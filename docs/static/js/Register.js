import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
    });

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage(language === "pl" ? "Rejestracja zakończona pomyślnie!" : "Registration successful!");
            } else {
                const errorText = await response.text();
                setMessage(language === "pl" ? `Błąd: ${errorText}` : `Error: ${errorText}`);
            }
        } catch (error) {
            setMessage("Błąd połączenia z serwerem.");
            console.error("Błąd rejestracji:", error);
        }
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

            {/* Sekcja rejestracji */}
            <main className="register-container">
                <h2>{language === "pl" ? "Rejestracja" : "Register"}</h2>
                <form onSubmit={handleRegister}>
                    <label>{language === "pl" ? "Imię:" : "First Name:"}</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

                    <label>{language === "pl" ? "Nazwisko:" : "Last Name:"}</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                    <label>{language === "pl" ? "Numer telefonu:" : "Phone Number:"}</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />

                    <label>{language === "pl" ? "Hasło:" : "Password:"}</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                    <button type="submit">{language === "pl" ? "Zarejestruj się" : "Register"}</button>
                </form>
                <p>{message}</p>

                <p>
                    {language === "pl" ? "Masz już konto?" : "Already have an account?"}{" "}
                    <Link to="/login">{language === "pl" ? "Zaloguj się" : "Login"}</Link>
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

export default Register;
