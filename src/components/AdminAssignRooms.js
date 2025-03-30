import React, { useEffect, useState } from "react";
import "./Home.css";
import "./AdminPanel.css";

const AdminAssignRooms = () => {
  const [requests, setRequests] = useState([]);
  const [assignedRooms, setAssignedRooms] = useState({});
  const [availableRooms, setAvailableRooms] = useState({});
  const [filterDate, setFilterDate] = useState("");
  const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
  const language = localStorage.getItem("language") || "pl";

  useEffect(() => {
    document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
    document.body.classList.toggle("high-contrast", highContrast);
  }, [fontSize, highContrast]);

  const toggleContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("highContrast", newVal);
  };

  const changeFontSize = (action) => {
    let newSize = fontSize;
    if (action === "increase") newSize += 5;
    if (action === "decrease") newSize -= 5;
    newSize = Math.max(20, Math.min(60, newSize));
    setFontSize(newSize);
    localStorage.setItem("fontSize", newSize.toString());
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");
    let url = "http://localhost:8080/api/requests";
    if (filterDate) {
      url += `?date=${filterDate}`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        console.log("Fetched requests:", data);
      } else {
        console.error("Błąd ładowania danych.");
      }
    } catch (err) {
      console.error("Błąd zapytania:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterDate]);

  const handleAssign = async (id) => {
    const room = assignedRooms[id];
    if (!room) return;

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room }),
      });

      if (res.ok) {
        alert(language === "pl" ? "Sala przypisana!" : "Room assigned!");
        fetchRequests();
      } else {
        const err = await res.text();
        alert((language === "pl" ? "Błąd przypisywania: " : "Error: ") + err);
      }
    } catch (err) {
      console.error("Błąd przypisywania:", err);
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("authToken");

    if (!window.confirm(language === "pl" ? "Czy na pewno odrzucić ten wniosek?" : "Are you sure to reject this request?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert(language === "pl" ? "Wniosek odrzucony!" : "Request rejected!");
        fetchRequests();
      } else {
        alert("Błąd odrzucania.");
      }
    } catch (err) {
      console.error("Błąd:", err);
    }
  };

  const handleSuggestRooms = async (req) => {
    console.log("Sugestie dla wniosku:", req);
    const token = localStorage.getItem("authToken");
    const url = `http://localhost:8080/api/rooms/suitable?participants=${req.participants || 0}&accessibility=${req.accessibility ? 1 : 0}&projector=${req.projector ? 1 : 0}&microphone=${req.microphone ? 1 : 0}&computer=${req.computer ? 1 : 0}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Dostępne sale:", data);
        setAvailableRooms((prev) => ({ ...prev, [req.id]: data }));
      } else {
        alert("Błąd pobierania dostępnych sal.");
      }
    } catch (err) {
      console.error("Błąd sugestii sal:", err);
    }
  };

  return (
    <div className="page-wrapper">
      <header>
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => (window.location.href = "/dashboard/admin") }>
          <img src={highContrast ? "/images/logo2.png" : "/images/logo1.png"} alt="Logo" />
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
        <div style={{ marginBottom: "1rem" }}>
          <label><strong>{language === "pl" ? "Filtruj po dacie:" : "Filter by date:"}</strong></label>{" "}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button onClick={() => setFilterDate("")}>{language === "pl" ? "Wyczyść filtr" : "Clear Filter"}</button>
        </div>

        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{language === "pl" ? "Wydarzenie" : "Event"}</th>
              <th>{language === "pl" ? "Data" : "Date"}</th>
              <th>{language === "pl" ? "Godziny" : "Time"}</th>
              <th>{language === "pl" ? "Uczestnicy" : "Participants"}</th>
              <th>{language === "pl" ? "Wymagania" : "Requirements"}</th>
              <th>{language === "pl" ? "Status" : "Status"}</th>
              <th>{language === "pl" ? "Sala" : "Room"}</th>
              <th>{language === "pl" ? "Akcje" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className={
                req.status === "APPROVED" ? "approved" :
                req.status === "REJECTED" ? "rejected" : ""
              }>
                <td>{req.id}</td>
                <td>{req.eventName}</td>
                <td>{req.eventDate}</td>
                <td>{req.startTime?.substring(0, 5)} - {req.endTime?.substring(0, 5)}</td>
                <td>{req.participants}</td>
                <td>
                  {req.accessibility && "♿ "}
                  {req.projector && "📽 "}
                  {req.microphone && "🎤 "}
                  {req.computer && "💻 "}
                </td>
                <td>{req.status}</td>
                <td>
                  {req.assignedRoom ? (
                    <strong>{req.assignedRoom}</strong>
                  ) : (
                    req.status === "REJECTED" ? (
                      <em style={{ color: "#aaa" }}>–</em>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={assignedRooms[req.id] || ""}
                          onChange={(e) =>
                            setAssignedRooms({ ...assignedRooms, [req.id]: e.target.value })
                          }
                          placeholder="Nr sali"
                          disabled={req.status === "REJECTED"}
                        />
                        {availableRooms[req.id] && availableRooms[req.id].length > 0 && (
                          <div style={{ marginTop: "5px", fontSize: "0.9em" }}>
                            <em>{language === "pl" ? "Sugestie:" : "Suggestions:"}</em>{" "}
                            {availableRooms[req.id].map((r) => r.roomNumber).join(", ")}
                          </div>
                        )}
                      </>
                    )
                  )}
                </td>
                <td>
                  {req.status === "PENDING" && (
                    <>
                      <button onClick={() => handleAssign(req.id)}>{language === "pl" ? "Przypisz" : "Assign"}</button>
                      <button onClick={() => handleReject(req.id)} style={{ marginLeft: "4px", backgroundColor: "#f66", color: "#fff" }}>{language === "pl" ? "Odrzuć" : "Reject"}</button>
                      <button onClick={() => handleSuggestRooms(req)} style={{ marginLeft: "4px" }}>{language === "pl" ? "Sugeruj salę" : "Suggest"}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminAssignRooms;
