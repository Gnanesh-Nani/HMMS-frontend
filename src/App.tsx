import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
// import ChangePasswordPage from "./pages/ChangePassword"; // ✅ Add this route 
import { AuthProvider } from "./context/AuthContext";
import MealPlan from "./pages/MealPlan";

export default function App() {
  return (
    <AuthProvider> {/* ✅ Context    Wrapper — this is essential */}
      <BrowserRouter>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Change Password Page
          <Route path="/change-password" element={<ChangePasswordPage />} /> */}

          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
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
            <Route
            path="/admin/meal-plan"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MealPlan />
              </ProtectedRoute>
            }
          />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
