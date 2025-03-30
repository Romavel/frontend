import React, { useEffect, useState } from "react";
import "./Home.css";
import "./AdminPanel.css";

const AdminManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    floor: "",
    capacity: 0,
    accessibility: false,
    projector: false,
    microphone: false,
    computer: false
  });

  const language = localStorage.getItem("language") || "pl";
  const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);

  useEffect(() => {
    document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
    document.body.classList.toggle("high-contrast", highContrast);
    fetchRooms();
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

  const fetchRooms = async () => {
    const token = localStorage.getItem("authToken");
  
    try {
      const res = await fetch("http://localhost:8080/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        console.error("Błąd ładowania sal");
      }
    } catch (err) {
      console.error("Błąd:", err);
    }
  };
  

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const url = editingRoom
      ? `http://localhost:8080/api/rooms/${editingRoom.id}`
      : "http://localhost:8080/api/rooms";

    const method = editingRoom ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchRooms();
        setFormData({
          roomNumber: "",
          floor: "",
          capacity: 0,
          accessibility: false,
          projector: false,
          microphone: false,
          computer: false
        });
        setEditingRoom(null);
      } else {
        alert("Błąd zapisu sali.");
      }
    } catch (err) {
      console.error("Błąd:", err);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(language === "pl" ? "Czy na pewno usunąć tę salę?" : "Delete this room?");
    if (!confirm) return;

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`http://localhost:8080/api/rooms/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchRooms();
      } else {
        alert("Błąd usuwania sali.");
      }
    } catch (err) {
      console.error("Błąd:", err);
    }
  };

  return (
    <div className="page-wrapper">
      <header>
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard/admin"}>
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
        <h2>{language === "pl" ? "Zarządzanie salami" : "Room Management"}</h2>

        <form onSubmit={handleSubmit} className="form-inline">
          <h4>{editingRoom ? (language === "pl" ? "Edycja sali" : "Edit Room") : (language === "pl" ? "Nowa sala" : "New Room")}</h4>

          <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="Numer sali" required />
          <input name="floor" value={formData.floor} onChange={handleChange} placeholder="Piętro" required />
          <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Pojemność" required />

          <label><input type="checkbox" name="accessibility" checked={formData.accessibility} onChange={handleChange} /> ♿</label>
          <label><input type="checkbox" name="projector" checked={formData.projector} onChange={handleChange} /> 📽</label>
          <label><input type="checkbox" name="microphone" checked={formData.microphone} onChange={handleChange} /> 🎤</label>
          <label><input type="checkbox" name="computer" checked={formData.computer} onChange={handleChange} /> 💻</label>

          <button type="submit">{editingRoom ? (language === "pl" ? "Zapisz zmiany" : "Save Changes") : (language === "pl" ? "Dodaj salę" : "Add Room")}</button>
        </form>

        <hr />

        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{language === "pl" ? "Numer" : "Number"}</th>
              <th>{language === "pl" ? "Piętro" : "Floor"}</th>
              <th>{language === "pl" ? "Pojemność" : "Capacity"}</th>
              <th>{language === "pl" ? "Udogodnienia" : "Features"}</th>
              <th>{language === "pl" ? "Akcje" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.roomNumber}</td>
                <td>{room.floor}</td>
                <td>{room.capacity}</td>
                <td>
                  {room.accessibility && "♿ "}
                  {room.projector && "📽 "}
                  {room.microphone && "🎤 "}
                  {room.computer && "💻 "}
                </td>
                <td>
                  <button onClick={() => handleEdit(room)}>{language === "pl" ? "Edytuj" : "Edit"}</button>
                  <button onClick={() => handleDelete(room.id)} style={{ marginLeft: "4px", backgroundColor: "#f66", color: "#fff" }}>
                    {language === "pl" ? "Usuń" : "Delete"}
                  </button>
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
          <a href="/terms" target="_blank" rel="noreferrer">{language === "pl" ? "Regulamin" : "Terms"}</a>
          <span> | </span>
          <a href="/privacy" target="_blank" rel="noreferrer">{language === "pl" ? "Polityka prywatności" : "Privacy Policy"}</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminManageRooms;
