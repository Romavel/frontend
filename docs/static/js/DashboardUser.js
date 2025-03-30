import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Home.css"; // lub osobny plik np. DashboardUser.css

const DashboardUser = () => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [userEmail, setUserEmail] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const toggleContrast = () => {
        const newContrast = !highContrast;
        setHighContrast(newContrast);
        localStorage.setItem("highContrast", newContrast);
    };

    const changeFontSize = (change) => {
        let newFontSize = fontSize + change;
        if (newFontSize > 50) newFontSize = 50;
        if (newFontSize < 20) newFontSize = 20;
        setFontSize(newFontSize);
        localStorage.setItem("fontSize", newFontSize);
        document.documentElement.style.setProperty("--dynamic-font-size", `${newFontSize}px`);
    };

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
        document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
    }, [highContrast, fontSize]);

    // Sprawdzenie tokena + dekodowanie JWT
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
        } else {
            try {
                const decoded = jwtDecode(token);
                setUserEmail(decoded.sub); // email
                setUserRole(decoded.role);
            } catch (e) {
                console.error("Błędny token:", e);
                localStorage.removeItem("authToken");
                window.location.href = "/login";
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
    };

    return (
        <div className={`container ${highContrast ? "high-contrast" : ""}`}>
            <header>
                <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard/user"}>
                    <img src={logoSrc} alt="Logo" />
                </div>

                <nav className="top-menu">
                    <span style={{ marginRight: "10px" }}>
                        {language === "pl" ? "Zalogowano jako:" : "Logged in as:"} <strong>{userEmail}</strong>
                    </span>
                    <button onClick={handleLogout}>
                        {language === "pl" ? "Wyloguj się" : "Logout"}
                    </button>

                    <div className="language-dropdown">
                        <button className="language-btn">
                            {language === "pl" ? "Polski" : "English"} ▼
                        </button>
                        <div className="language-options">
                            <button onClick={() => changeLanguage("pl")}>Polski</button>
                            <button onClick={() => changeLanguage("en")}>English</button>
                        </div>
                    </div>

                    <button className="control-button" onClick={toggleContrast}>
                        {language === "pl" ? "Wysoki kontrast" : "High Contrast"}
                    </button>
                    <button className="control-button" onClick={() => changeFontSize(2)}>A+</button>
                    <button className="control-button" onClick={() => changeFontSize(-2)}>A-</button>
                </nav>
            </header>

            <main className="tiles-container">
                <div className="tile">
                    <Link to="/dashboard/user/reservation" className="tile-text">
                        {language === "pl" ? "Rezerwacja Sali" : "Room Booking"}
                    </Link>
                </div>

                <div className="tile">
                    <Link to="/dashboard/user/my-reservations" className="tile-text">
                        {language === "pl" ? "Moje Rezerwacje" : "My Reservations"}
                    </Link>
                </div>

                <div className="tile tile-wide">
                    <Link to="/dashboard/user/schedule" className="tile-text">
                        {language === "pl" ? "Harmonogram" : "Schedule"}
                    </Link>
                </div>
            </main>

            <footer>
                <p>
                    {language === "pl"
                        ? "Centrum Rezerwacji Sal - Politechnika Lubelska"
                        : "Room Booking Center - Lublin University of Technology"}
                </p>
                <div className="footer-links">
                    <a href="/terms" target="_blank" rel="noreferrer">
                        {language === "pl" ? "Regulamin" : "Terms"}
                    </a>
                    <span> | </span>
                    <a href="/privacy" target="_blank" rel="noreferrer">
                        {language === "pl" ? "Polityka prywatności" : "Privacy Policy"}
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default DashboardUser;
