import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Home.css"; // lub DashboardAdmin.css – ważne, żeby był styl header/footer

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [language] = useState(localStorage.getItem("language") || "pl");
    const [error, setError] = useState("");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 20);
    const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");

    const logoSrc = highContrast ? "/images/logo2.png" : "/images/logo1.png";

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    useEffect(() => {
        document.documentElement.style.setProperty("--dynamic-font-size", `${fontSize}px`);
        document.body.classList.toggle("high-contrast", highContrast);
    }, [fontSize, highContrast]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/login";
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "ADMIN") {
                window.location.href = "/dashboard/user";
            }
        } catch (err) {
            localStorage.clear();
            window.location.href = "/login";
        }

        fetch("http://localhost:8080/api/admin/users", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP error: ${res.status}`);
                }

                const data = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("Odpowiedź z serwera nie jest listą użytkowników");
                }

                setUsers(data);
                setFilteredUsers(data);
            })
            .catch(err => {
                console.error("Błąd pobierania użytkowników:", err);
                setError(err.message);
            });
    }, []);

    const deleteUser = async (userId) => {
        const confirmed = window.confirm(
            language === "pl" 
                ? "Czy na pewno chcesz usunąć tego użytkownika?" 
                : "Are you sure you want to delete this user?"
        );
    
        if (!confirmed) return;
    
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
    
            if (res.ok) {
                const updatedUsers = users.filter(u => u.id !== userId);
                setUsers(updatedUsers);
                handleSearch(search); // odśwież wyniki po usunięciu
            } else {
                const error = await res.text();
                alert(`Błąd: ${error}`);
            }
        } catch (err) {
            console.error("Błąd usuwania użytkownika:", err);
        }
    };
    

    const handleSearch = (value) => {
        setSearch(value);
        const lower = value.toLowerCase();
        const filtered = users.filter(user =>
            user.firstName?.toLowerCase().includes(lower) ||
            user.lastName?.toLowerCase().includes(lower) ||
            user.email?.toLowerCase().includes(lower)
        );
        setFilteredUsers(filtered);
    };

    const promoteToAdmin = async (userId) => {
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: "ADMIN" })
            });

            if (res.ok) {
                const updatedUsers = users.map(u =>
                    u.id === userId ? { ...u, role: "ADMIN" } : u
                );
                setUsers(updatedUsers);
                handleSearch(search);
            } else {
                const error = await res.text();
                alert(`Błąd: ${error}`);
            }
        } catch (err) {
            console.error("Błąd zmiany roli:", err);
        }
    };

    return (
        <div className={`container ${highContrast ? "high-contrast" : ""}`}>
            {/* HEADER */}
            <header>
                <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/dashboard/admin"}>
                    <img src={logoSrc} alt="Logo" />
                </div>

                <nav className="top-menu">
                    <span style={{ marginRight: "10px" }}>
                        {language === "pl" ? "Panel Administratora" : "Admin panel"}
                    </span>
                    <button onClick={handleLogout}>
                        {language === "pl" ? "Wyloguj się" : "Logout"}
                    </button>
                </nav>
            </header>

            {/* TREŚĆ */}
            <main style={{ padding: "20px" }}>
                <h2>{language === "pl" ? "Lista użytkowników" : "User List"}</h2>

                {error && (
                    <div style={{ color: "red", marginBottom: "1rem" }}>
                        {language === "pl" ? "Błąd: " : "Error: "} {error}
                    </div>
                )}

                <input
                    type="text"
                    placeholder={language === "pl" ? "Szukaj użytkownika..." : "Search user..."}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "99%",
                        marginBottom: "20px",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                />

                {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                    }}>
                        <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>{language === "pl" ? "Imię" : "First Name"}</th>
                                <th style={thStyle}>{language === "pl" ? "Nazwisko" : "Last Name"}</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>{language === "pl" ? "Rola" : "Role"}</th>
                                <th style={thStyle}>{language === "pl" ? "Akcja" : "Action"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: "1px solid #ccc", textAlign: "center" }}>
                                    <td style={tdStyle}>{user.id}</td>
                                    <td style={tdStyle}>{user.firstName}</td>
                                    <td style={tdStyle}>{user.lastName}</td>
                                    <td style={tdStyle}>{user.email}</td>
                                    <td style={tdStyle}>{user.role}</td>
                                    <td style={tdStyle}>
                                        {user.role !== "ADMIN" ? (
                                            <>
                                                <button onClick={() => promoteToAdmin(user.id)} style={{ marginRight: "10px" }}>
                                                    {language === "pl" ? "Nadaj ADMIN" : "Promote"}
                                                </button>
                                                <button onClick={() => deleteUser(user.id)} style={{ backgroundColor: "crimson", color: "white" }}>
                                                    {language === "pl" ? "Usuń" : "Delete"}
                                                </button>
                                            </>
                                        ) : (
                                            <em>{language === "pl" ? "Administrator" : "Admin"}</em>
                                        )}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !error && <p>{language === "pl" ? "Brak użytkowników do wyświetlenia." : "No users to display."}</p>
                )}
            </main>

            {/* FOOTER */}
            <footer>
                <p>
                    {language === "pl"
                        ? "Panel administratora - Politechnika Lubelska"
                        : "Admin Panel - Lublin University of Technology"}
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

// Styl nagłówków tabeli
const thStyle = {
    padding: "12px",
    fontWeight: "bold",
    textAlign: "center"
};

// Styl komórek
const tdStyle = {
    padding: "10px",
    textAlign: "center"
};



export default AdminUserList;
