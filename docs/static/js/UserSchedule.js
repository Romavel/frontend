import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import "./Home.css";
import "./Schedule.css";

const UserSchedule = () => {
    const floors = [
        { value: "", labelPl: "Wszystkie", labelEn: "All" },
        { value: "Parter", labelPl: "Parter", labelEn: "Ground Floor" },
        { value: "1 Piętro", labelPl: "1 Piętro", labelEn: "1st Floor" },
        { value: "2 Piętro", labelPl: "2 Piętro", labelEn: "2nd Floor" },
        { value: "3 Piętro", labelPl: "3 Piętro", labelEn: "3rd Floor" },
        { value: "4 Piętro", labelPl: "4 Piętro", labelEn: "4th Floor" },
    ];

    const [selectedDate, setSelectedDate] = useState("");
    const [todayFloor, setTodayFloor] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [todayScheduleData, setTodayScheduleData] = useState([]);
    const [selectedScheduleData, setSelectedScheduleData] = useState([]);
    const today = new Date().toISOString().split("T")[0];
    const [language, setLanguage] = useState(localStorage.getItem("language") || "pl");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
    const [userEmail, setUserEmail] = useState(null);
    const [userRole, setUserRole] = useState(null);


    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

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

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        window.location.reload();
    };

    const toggleContrast = () => {
        const newContrast = !highContrast;
        setHighContrast(newContrast);
        localStorage.setItem("highContrast", newContrast);
    };

    const changeFontSize = (action) => {
        let newSize = fontSize;
        if (action === "increase") newSize += 5;
        if (action === "decrease") newSize -= 5;
        newSize = Math.max(20, Math.min(60, newSize));
        setFontSize(newSize);
        localStorage.setItem("fontSize", newSize.toString());
    };

    useEffect(() => {
        document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
        document.body.classList.toggle("high-contrast", highContrast);
    }, [fontSize, highContrast]);

    const fetchTodaySchedule = async () => {
        try {
            const url = `http://localhost:8080/api/schedule?date=${today}${todayFloor ? `&floor=${encodeURIComponent(todayFloor)}` : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            setTodayScheduleData(data);
        } catch (err) {
            console.error("Błąd pobierania harmonogramu dnia dzisiejszego:", err);
        }
    };

    const fetchSelectedSchedule = async (date) => {
        try {
            const url = `http://localhost:8080/api/schedule?date=${date}${selectedFloor ? `&floor=${encodeURIComponent(selectedFloor)}` : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            setSelectedScheduleData(data);
        } catch (err) {
            console.error("Błąd pobierania harmonogramu dla daty:", err);
        }
    };

    useEffect(() => {
        fetchTodaySchedule();
    }, [todayFloor]);

    useEffect(() => {
        if (selectedDate) {
            fetchSelectedSchedule(selectedDate);
        }
    }, [selectedDate, selectedFloor]);

    const renderScheduleList = (data) => {
        if (data.length === 0) {
            return <p>{language === "pl" ? "Brak wydarzeń." : "No events scheduled."}</p>;
        }
        if (!Array.isArray(data)) {
            return (
                <p style={{ color: "red" }}>
                    {language === "pl"
                        ? "Błąd: nieprawidłowe dane harmonogramu."
                        : "Error: invalid schedule data."}
                </p>
            );
        }
        const groupedByRoom = data.reduce((acc, item) => {
            if (!acc[item.roomName]) {
                acc[item.roomName] = [];
            }
            acc[item.roomName].push(item);
            return acc;
        }, {});

        return (
            <ul className="schedule-list">
                {Object.entries(groupedByRoom).map(([roomNumber, events]) => {
                    const sortedEvents = events.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    const firstStart = sortedEvents[0].startTime?.substring(0, 5);
                    const lastEnd = sortedEvents[sortedEvents.length - 1].endTime?.substring(0, 5);

                    return (
                        <li key={roomNumber} className="room-group">
                            <strong>
                                {language === "pl" ? "Sala" : "Room"} {roomNumber} {firstStart} - {lastEnd}
                            </strong>
                            <ul>
                                {sortedEvents.map((event, index) => (
                                    <li key={index}>
                                        🕒 {event.startTime?.substring(0, 5)} - {event.endTime?.substring(0, 5)} — {event.eventName}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderFloorButtons = (label, floorSetter, currentFloor) => (
        <div className="floor-grid">
            {floors.map((floor) => (
                <button
                    key={`${label}-${floor.value}`}
                    className={`floor-btn ${currentFloor === floor.value ? "selected" : ""}`}
                    onClick={() => floorSetter(floor.value)}
                >
                    {language === "pl" ? floor.labelPl : floor.labelEn}
                </button>
            ))}
        </div>
    );

    const renderSchedulePlaceholder = (label, date, data, floorSetter, currentFloor) => (
        <div className="schedule-section">
            <h3>{label}</h3>
            {renderFloorButtons(label, floorSetter, currentFloor)}
            <div className="schedule-placeholder">
                <p>
                    {language === "pl" ? "🗓️ Wyświetlanie harmonogramu dla:" : "🗓️ Displaying schedule for:"}
                    <strong> {currentFloor || (language === "pl" ? "wszystkich pięter" : "all floors")}</strong>
                </p>
                <p>
                    {language === "pl" ? "📅 Data:" : "📅 Date:"} <strong>{date}</strong>
                </p>
                {renderScheduleList(data)}
            </div>
        </div>
    );

    return (
        <div className="page-wrapper">
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

            <main className="schedule-page">
                <h2>{language === "pl" ? "Harmonogram sal" : "Room Schedule"}</h2>

                {renderSchedulePlaceholder(
                    language === "pl" ? "Aktualna data" : "Current date",
                    today,
                    todayScheduleData,
                    setTodayFloor,
                    todayFloor
                )}

                <div className="schedule-section">
                    <h3>{language === "pl" ? "Wybrana data" : "Selected date"}</h3>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        {language === "pl" ? "Wybierz datę:" : "Select a date:"}
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    {selectedDate &&
                        renderSchedulePlaceholder(
                            language === "pl" ? "Dla daty" : "For selected date",
                            selectedDate,
                            selectedScheduleData,
                            setSelectedFloor,
                            selectedFloor
                        )}
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

export default UserSchedule;
