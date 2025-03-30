import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Home.css";
import "./RoomReservation.css";

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const language = localStorage.getItem("language") || "pl";
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
  const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");

  const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

  const changeFontSize = (action) => {
    let newSize = fontSize;
    if (action === "increase") newSize += 5;
    if (action === "decrease") newSize -= 5;
    newSize = Math.max(20, Math.min(60, newSize));
    setFontSize(newSize);
    localStorage.setItem("fontSize", newSize.toString());
  };

  const toggleContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    localStorage.setItem("highContrast", newContrast.toString());
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
    document.body.classList.toggle("high-contrast", highContrast);
  }, [fontSize, highContrast]);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Musisz być zalogowany.");
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/api/requests/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();

          // Filtrujemy tylko przyszłe rezerwacje
          const today = new Date().toISOString().split("T")[0];
          const futureReservations = data.filter((r) => r.eventDate >= today);

          // Sortuj po dacie
          futureReservations.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

          setReservations(futureReservations);
        } else {
          alert(language === "pl" ? "Błąd pobierania rezerwacji." : "Failed to load reservations.");
        }
      } catch (err) {
        console.error("Błąd:", err);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="page-wrapper">
      {/* HEADER */}
      <header>
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard/user"}>
          <img src={logoSrc} alt="Logo" />
        </div>
        <div className="top-menu">
          <button className="control-button" onClick={toggleContrast}>
            {language === "pl" ? "Wysoki kontrast" : "High Contrast"}
          </button>
          <button className="control-button" onClick={() => changeFontSize("increase")}>A+</button>
          <button className="control-button" onClick={() => changeFontSize("decrease")}>A-</button>
        </div>
      </header>

      {/* MAIN */}
      <main className="reservation-container">
        <h2>{language === "pl" ? "Moje przyszłe rezerwacje" : "My Upcoming Reservations"}</h2>

        {reservations.length === 0 ? (
          <p>{language === "pl" ? "Brak przyszłych rezerwacji." : "No upcoming reservations."}</p>
        ) : (
          <ul className="reservation-list">
            {reservations.map((r) => (
              <li key={r.id} className="reservation-card">
                <h3>{r.eventName}</h3>
                <p>📅 {r.eventDate}</p>
                <p>🕒 {r.startTime?.substring(0,5)} - {r.endTime?.substring(0,5)}</p>
                <p>👥 {language === "pl" ? "Uczestników:" : "Participants:"} {r.participants}</p>
                <p>📌 {language === "pl" ? "Status:" : "Status:"} {r.status}</p>
                {r.assignedRoom && (
                  <p>🏫 {language === "pl" ? "Sala przydzielona:" : "Assigned room:"} {r.assignedRoom}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FOOTER */}
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

export default UserReservations;
