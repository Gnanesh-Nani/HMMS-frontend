import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import FirstTimeChangePassword from "./pages/Student/change-password";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminStudentRecords from "./pages/Admin/AdminStudentRecords";
import BulkRegister from "./pages/Admin/Bulk-register";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Change Password Page */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <FirstTimeChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
<Route
  path="/admin/student-records"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminStudentRecords />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/students"   // <-- this must match the URL you are trying to navigate to
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminStudentRecords />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/bulk-register"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <BulkRegister />
    </ProtectedRoute>
  }
/>
          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
