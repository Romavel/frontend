import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    // Wybór logo w zależności od trybu kontrastu
    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

    // Funkcja do zmiany języka
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
        if (newFontSize > 60) newFontSize = 60;
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

    // Obsługa wysyłania prośby o resetowanie hasła
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage(language === "pl" ? "Wysłano prośbę o zresetowanie hasła." : "Password reset request sent.");
    };

    return (
        <div className="container">
            {/* Nagłówek */}
            <header>
                <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
                    <img src={logoSrc} alt="Logo" />
                </div>

                <nav className="top-menu">
                    <Link to="/">{language === "pl" ? "Strona główna" : "Home"}</Link>

                    {/* Menu języka */}
                    <div className="language-dropdown">
                        <button className="language-btn">{language === "pl" ? "Polski" : "English"} ▼</button>
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

            {/* Sekcja przypomnienia hasła */}
            <main className="forgot-password-container">
                <h2>{language === "pl" ? "Przypomnienie hasła" : "Forgot Password"}</h2>
                <form onSubmit={handlePasswordReset}>
                    <label>{language === "pl" ? "Wpisz swój email:" : "Enter your email:"}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type="submit">{language === "pl" ? "Wyślij prośbę" : "Send Request"}</button>
                </form>
                <p>{message}</p>
                <p>
                    <Link to="/login">{language === "pl" ? "Powrót do logowania" : "Back to Login"}</Link>
                </p>
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

export default ForgotPassword;
