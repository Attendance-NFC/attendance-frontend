import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./routes/userLogin";
import AdminDashboard from "./routes/adminDashboard";
import CreateUser from "./routes/createUser";
import ClassroomsList from "./routes/classroomsList";
import CreateClassroom from "./routes/createClassroom";
import EnrollStudents from "./routes/enrollStudents";
import GrantRoomAccess from "./routes/grantRoomAccess";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users/new" element={<CreateUser />} />
        <Route path="/admin/classrooms" element={<ClassroomsList />} />
        <Route path="/admin/classrooms/new" element={<CreateClassroom />} />
        <Route path="/admin/enrollment" element={<EnrollStudents />} />
        <Route path="/admin/room-access/new" element={<GrantRoomAccess />} />
        {/* unmatched URLs fall back to the dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}