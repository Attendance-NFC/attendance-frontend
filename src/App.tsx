import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./routes/userLogin";
import AdminDashboard from "./routes/adminDashboard";
import CreateUser from "./routes/createUser";
import CreateClassroom from "./routes/createClassroom"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/createUser" element={<CreateUser />} />
        <Route path="/admin/classrooms/new" element={<CreateClassroom />} />
        {/* unmatched URLs fall back to the dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}