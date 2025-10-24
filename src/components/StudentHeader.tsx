import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Meal Plan", path: "/student/meal-plan" },
    { name: "Profile", path: "/student/profile" },
    { name: "Payments", path: "/student/payments" },
    { name: "Feedback", path: "/student/feedback" },
  ];

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <div className="text-xl font-bold">Student Dashboard</div>
        <nav className="flex items-center space-x-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded hover:bg-green-700 transition ${
                  isActive ? "bg-green-700" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
