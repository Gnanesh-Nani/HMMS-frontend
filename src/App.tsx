import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import FirstTimeChangePassword from "./pages/Student/FirstTimeChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import BulkRegister from "./pages/Admin/Bulk-register";
import SingleRegister from "./pages/Admin/Single-register";
import Payment from "./pages/Admin/Payment";
import AllocatePayment from "./pages/Admin/AllocatePayment";
import MealPlan from "./pages/Admin/MealPlan";
import StudentPayment from "./pages/Student/StudentPayment";
import AdminHostelPage from "./pages/Admin/AdminHostelPage";
import AdminBlockPage from "./pages/Admin/AdminBlockPage";
import AdminRoomPage from "./pages/Admin/AdminRoomPage";

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
            path="/student/payment"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentPayment />
              </ProtectedRoute>
            }
          />

          {/* Admin Bulk Register */}
          <Route
            path="/admin/bulk-register"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BulkRegister />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/hostel"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHostelPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/hostels/:hostelId/blocks"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminBlockPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/hostels/:hostelId/blocks/:blockId/rooms" 
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRoomPage/>
              </ProtectedRoute>
            } 
          />

          <Route
            path="/admin/single-register"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SingleRegister />
              </ProtectedRoute>
            }
          />
          {/*Admin Payment Page*/}
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments/allocate"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AllocatePayment />
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
