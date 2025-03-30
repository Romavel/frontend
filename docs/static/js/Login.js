import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(language === "pl" ? "Logowanie..." : "Logging in...");
    
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                const { role, token } = data;
    
                // Zapamiętaj token i rolę
                localStorage.setItem("authToken", token);
                localStorage.setItem("userRole", role);
    
                setMessage(language === "pl" ? "Zalogowano pomyślnie!" : "Login successful!");
    
                // Przekierowanie
                if (role === "ADMIN") {
                    window.location.href = "/dashboard/admin";
                } else {
                    window.location.href = "/dashboard/user";
                }
            } else {
                const error = await response.text();
                setMessage(language === "pl" ? `Błąd: ${error}` : `Error: ${error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage(language === "pl" ? "Błąd połączenia z serwerem" : "Connection error");
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

            {/* Sekcja logowania */}
            <main className="login-container">
                <h2>{language === "pl" ? "Logowanie" : "Login"}</h2>
                <form onSubmit={handleLogin}>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label>Hasło:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <button type="submit">{language === "pl" ? "Zaloguj się" : "Login"}</button>
                </form>
                <p>{message}</p>

                {/* Link do przypomnienia hasła */}
                <p>
                    <Link to="/forgot-password">
                        {language === "pl" ? "Nie pamiętasz hasła?" : "Forgot your password?"}
                    </Link>
                </p>

                <p>
                    {language === "pl" ? "Nie masz konta?" : "Don't have an account?"}{" "}
                    <Link to="/register">{language === "pl" ? "Zarejestruj się" : "Register"}</Link>
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

export default Login;
