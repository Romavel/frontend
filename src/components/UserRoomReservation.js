import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import "./RoomReservation.css";

const UserRoomReservation = () => {
    const language = localStorage.getItem("language") || "pl";
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

    const [formData, setFormData] = useState({
        reserver: "",
        coordinator: "",
        email: "",
        phone: "",
        eventName: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        participants: "",
        accessibility: false,
        equipment: {
            projector: false,
            microphone: false,
            computer: false,
        },
        notes: ""
    });

    const changeLanguage = (lang) => {
        localStorage.setItem("language", lang);
        window.location.reload();
    };

    const toggleContrast = () => {
        const newVal = !highContrast;
        setHighContrast(newVal);
        localStorage.setItem("highContrast", newVal.toString());
    };

    const changeFontSize = (action) => {
        let newSize = fontSize;
        if (action === "increase") newSize += 5;
        if (action === "decrease") newSize -= 5;
        newSize = Math.max(20, Math.min(60, newSize));
        setFontSize(newSize);
        localStorage.setItem("fontSize", newSize.toString());
    };

    // 🔐 Wypełnianie danych użytkownika z tokena
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const { firstName, lastName, email, phone } = decoded;

            setFormData(prev => ({
                ...prev,
                reserver: `${firstName} ${lastName}`,
                email,
                phone
            }));
        } catch (e) {
            console.error("Błąd dekodowania tokena:", e);
            localStorage.clear();
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
        document.body.classList.toggle("high-contrast", highContrast);
    }, [fontSize, highContrast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name in formData.equipment) {
            setFormData({
                ...formData,
                equipment: {
                    ...formData.equipment,
                    [name]: checked
                }
            });
        } else if (name === "accessibility") {
            setFormData({ ...formData, accessibility: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            reserverName: formData.reserver,
            coordinatorName: formData.coordinator,
            email: formData.email,
            phone: formData.phone,
            eventName: formData.eventName,
            eventDate: formData.eventDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            participants: parseInt(formData.participants),
            accessibility: formData.accessibility,
            projector: formData.equipment.projector,
            microphone: formData.equipment.microphone,
            computer: formData.equipment.computer,
            notes: formData.notes,
        };

        try {
            const res = await fetch("http://localhost:8080/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // jeśli chcesz autoryzować, dodaj:
                    // "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert(language === "pl" ? "Wniosek został wysłany!" : "Request submitted!");
                // ewentualnie reset formularza
                setFormData({
                    reserver: "",
                    coordinator: "",
                    email: "",
                    phone: "",
                    eventName: "",
                    eventDate: "",
                    startTime: "",
                    endTime: "",
                    participants: "",
                    accessibility: false,
                    equipment: {
                        projector: false,
                        microphone: false,
                        computer: false,
                    },
                    notes: ""
                });
            } else {
                const errText = await res.text();
                alert((language === "pl" ? "Błąd wysyłania:" : "Submit failed:") + "\n" + errText);
            }
        } catch (err) {
            console.error("Błąd zapisu:", err);
            alert(language === "pl" ? "Błąd połączenia z serwerem." : "Server error.");
        }
    };
    return (
        <div className="page-wrapper">
            {/* HEADER ZALOGOWANEGO */}
            <header>
                <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard/user"}>
                    <img src={logoSrc} alt="Logo" />
                </div>
                <nav className="top-menu">
                    <button onClick={toggleContrast}>
                        {language === "pl" ? "Wysoki kontrast" : "High Contrast"}
                    </button>
                    <button onClick={() => changeFontSize("increase")}>A+</button>
                    <button onClick={() => changeFontSize("decrease")}>A-</button>
                </nav>
            </header>

            <main className="reservation-container">
                <h2>{language === "pl" ? "Formularz rezerwacji sali" : "Room Reservation Form"}</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>📇 {language === "pl" ? "Dane kontaktowe" : "Contact Details"}</legend>
                        <input type="text" name="reserver" value={formData.reserver} readOnly />
                        <input type="text" name="coordinator" placeholder={language === "pl" ? "Imię i nazwisko osoby odpowiedzialnej" : "Coordinator full name"} onChange={handleChange} required />
                        <input type="email" name="email" value={formData.email} readOnly />
                        <input type="tel" name="phone" value={formData.phone} readOnly />
                    </fieldset>

                    <fieldset>
                        <legend>📅 {language === "pl" ? "Dane wydarzenia" : "Event Details"}</legend>
                        <input type="text" name="eventName" placeholder={language === "pl" ? "Nazwa wydarzenia lub projektu" : "Event or project name"} onChange={handleChange} required />
                        <label>{language === "pl" ? "Data wydarzenia:" : "Event date:"}</label>
                        <input type="date" name="eventDate" onChange={handleChange} required />
                        <label>{language === "pl" ? "Godzina rozpoczęcia:" : "Start time:"}</label>
                        <input type="time" name="startTime" onChange={handleChange} required />
                        <label>{language === "pl" ? "Godzina zakończenia:" : "End time:"}</label>
                        <input type="time" name="endTime" onChange={handleChange} required />
                        <input type="number" name="participants" placeholder={language === "pl" ? "Liczba uczestników" : "Number of participants"} onChange={handleChange} required />
                    </fieldset>

                    <fieldset>
                        <legend>🛠️ {language === "pl" ? "Zapotrzebowanie" : "Requirements"}</legend>
                        <label><input type="checkbox" name="accessibility" checked={formData.accessibility} onChange={handleChange} /> {language === "pl" ? "Ułatwiony dostęp" : "Accessibility needed"}</label>
                        <label><input type="checkbox" name="projector" onChange={handleChange} /> {language === "pl" ? "Projektor" : "Projector"}</label>
                        <label><input type="checkbox" name="microphone" onChange={handleChange} /> {language === "pl" ? "Mikrofon" : "Microphone"}</label>
                        <label><input type="checkbox" name="computer" onChange={handleChange} /> {language === "pl" ? "Komputer" : "Computer"}</label>
                        <textarea name="notes" placeholder={language === "pl" ? "Uwagi dodatkowe" : "Additional notes"} onChange={handleChange}></textarea>
                    </fieldset>

                    <button type="submit">{language === "pl" ? "Zarezerwuj" : "Reserve"}</button>
                </form>
            </main>

            <footer>
                <p>{language === "pl" ? "Centrum Rezerwacji Sal - Politechnika Lubelska" : "Room Booking Center - Lublin University of Technology"}</p>
                <div className="footer-links">
                    <a href="/terms" target="_blank" rel="noreferrer">{language === "pl" ? "Regulamin" : "Terms"}</a>
                    <span> | </span>
                    <a href="/privacy" target="_blank" rel="noreferrer">{language === "pl" ? "Polityka prywatności" : "Privacy Policy"}</a>
                </div>
            </footer>
        </div>
    );
};

export default UserRoomReservation;
