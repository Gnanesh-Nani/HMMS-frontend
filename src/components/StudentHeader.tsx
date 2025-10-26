import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentHeader() {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/meal-plan", label: "Meal Plan" },
    { to: "/student/profile", label: "Profile" },
    { to: "/student/payment", label: "Payments" },
    { to: "/student/feedback", label: "Feedback" },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-xl font-semibold text-sky-700">Student Dashboard</div>

        {/* Menu Links */}
        <nav className="flex items-center gap-6">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} />
          ))}

          {/* Profile Info */}
          {profile && (
            <div className="ml-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="font-medium text-sky-700">{profile.name}</span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-1.5 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition font-medium text-sm shadow-sm"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-slate-600 hover:text-sky-600 font-medium transition text-sm"
    >
      {label}
    </Link>
  );
}
