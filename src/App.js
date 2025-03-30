import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Register from "./components/Register";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import RoomReservation from "./components/RoomReservation";
import Schedule from "./components/Schedule";
import DashboardUser from "./components/DashboardUser";
import DashboardAdmin from "./components/DashboardAdmin";
import AdminUserList from "./components/AdminUserList";
import UserRoomReservation from "./components/UserRoomReservation";
import UserReservations from "./components/UserReservations";
import UserSchedule from "./components/UserSchedule";
import AdminAssignRooms from "./components/AdminAssignRooms";
import AdminManageRooms from "./components/AdminManageRooms";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/frontend" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/reservation" element={<RoomReservation />} />
                <Route path="/schedule" element={<Schedule />} />

                 {/* Dashboardy */}
                <Route path="/dashboard/user" element={<DashboardUser />} />
                <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                
                {/* Panel usera */}
                <Route path="/dashboard/user/reservation" element={<UserRoomReservation />} />
                <Route path="/dashboard/user/my-reservations" element={<UserReservations />} />
                <Route path="/dashboard/user/schedule" element={<UserSchedule />} />


                {/* Panel admina */}
                <Route path="/dashboard/admin/users" element={<AdminUserList />} />  
                <Route path="/dashboard/admin/requests" element={<AdminAssignRooms />} /> 
                <Route path="/dashboard/admin/manage" element={<AdminManageRooms />} /> 
            </Routes>
        </Router>
    );
}

export default App;
