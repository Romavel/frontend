import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20); // Domyślnie 20px

    // Wybór logo w zależności od trybu kontrastu
    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

    // Funkcja do zmiany języka i zapisania w localStorage
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    // Funkcja do przełączania kontrastu
    const toggleContrast = () => {
        const newContrast = !highContrast;
        setHighContrast(newContrast);
        localStorage.setItem("highContrast", newContrast);
    };

    // Funkcja do zmiany rozmiaru czcionki
    const changeFontSize = (change) => {
        let newFontSize = fontSize + change;
        if (newFontSize > 50) newFontSize = 50; // Maksymalny rozmiar czcionki
        if (newFontSize < 20) newFontSize = 20; // Minimalny rozmiar czcionki

        setFontSize(newFontSize);
        localStorage.setItem("fontSize", newFontSize);
        document.documentElement.style.setProperty("--dynamic-font-size", `${newFontSize}px`);
    };

    // Efekt, który ładuje ustawienia przy pierwszym uruchomieniu
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
        document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
    }, [highContrast, fontSize]);

    return (
        <div className={`container ${highContrast ? "high-contrast" : ""}`}>
            {/* Nagłówek */}
            <header>
                <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/frontend"}>
                    <img src={logoSrc} alt="Logo" />
                </div>

                <nav className="top-menu">
                    <Link to="/login">{language === "pl" ? "Logowanie" : "Login"}</Link>
                    <Link to="/register">{language === "pl" ? "Rejestracja" : "Register"}</Link>

                    {/* Rozwijane menu języka */}
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

            {/* Kafelki */}
            <main className="tiles-container">
                <div className="tile">
                    <Link to="/reservation" className="tile-text">
                        {language === "pl" ? "Rezerwacja Sali" : "Room Booking"}
                    </Link>
                </div>
                <div className="tile">
                    <Link to="/schedule" className="tile-text">
                        {language === "pl" ? "Harmonogram" : "Schedule"}
                    </Link>
                </div>
            </main>

            {/* Stopka */}
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

export default Home;
