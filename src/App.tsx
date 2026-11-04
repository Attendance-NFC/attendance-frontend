import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./routes/userLogin";
import AdminDashboard from "./routes/adminDashboard";
import UsersList from "./routes/usersList"
import CreateUser from "./routes/createUser";
import ClassroomsList from "./routes/classroomsList";
import CreateClassroom from "./routes/createClassroom";
import EnrollStudents from "./routes/enrollStudents";
import GrantRoomAccess from "./routes/grantRoomAccess";
import CreateSchedule from "./routes/createSchedule";
import ViewUser from './routes/viewUser';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/users/new" element={<CreateUser />} />
        <Route path="/admin/classrooms" element={<ClassroomsList />} />
        <Route path="/admin/classrooms/new" element={<CreateClassroom />} />
        <Route path="/admin/enrollments/new" element={<EnrollStudents />} />
        <Route path="/admin/room-access/new" element={<GrantRoomAccess />} />
        <Route path="/admin/schedule/new" element={<CreateSchedule />} />
        <Route path="/admin/users/:userId" element={<ViewUser />} />

        {/* unmatched URLs fall back to the dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}