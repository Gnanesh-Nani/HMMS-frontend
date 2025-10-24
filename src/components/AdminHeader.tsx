import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { logout, profile } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-lg font-bold">
          Admin Dashboard
        </div>

        {/* Menu Links */}
        <nav className="flex gap-6 items-center">
          <Link
            to="/admin/hostel"
            className="hover:text-green-400 transition"
          >
            Hostel
          </Link>
          <Link
            to="/admin/meal-plan"
            className="hover:text-green-400 transition"
          >
            Meal Plan
          </Link>
          <Link
            to="/admin/students"
            className="hover:text-green-400 transition"
          >
            Student Records
          </Link>
          <Link
            to="/admin/payments"
            className="hover:text-green-400 transition"
          >
            Payments
          </Link>
          <Link
            to="/admin/feedback"
            className="hover:text-green-400 transition"
          >
            Complaint / Feedback
          </Link>

          {/* Optional: Show admin name */}
          {profile && (
            <span className="ml-4 text-sm text-gray-300">
              {profile.name}
            </span>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
