import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { logout, profile } = useAuth();
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo / Title */}
        <div className="text-xl font-semibold text-sky-700">
          Admin Dashboard
        </div>

        {/* Menu Links */}
        <nav className="flex items-center gap-6">
          <NavLink to="/admin/hostel" label="Hostel" />
          
          {/* Register Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
              className="text-slate-600 hover:text-sky-600 font-medium transition text-sm flex items-center gap-1"
            >
              Register
              <svg 
                className={`w-4 h-4 transition-transform ${isRegisterDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isRegisterDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/admin/single-register"
                  className="block px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                  onClick={() => setIsRegisterDropdownOpen(false)}
                >
                  Single Register
                </Link>
                <Link
                  to="/admin/bulk-register"
                  className="block px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                  onClick={() => setIsRegisterDropdownOpen(false)}
                >
                  Bulk Register
                </Link>
              </div>
            )}
          </div>

          {/* Payment Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              className="text-slate-600 hover:text-sky-600 font-medium transition text-sm flex items-center gap-1"
            >
              Payments
              <svg 
                className={`w-4 h-4 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isPaymentDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/admin/payments"
                  className="block px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                  onClick={() => setIsPaymentDropdownOpen(false)}
                >
                  View Payments
                </Link>
                <Link
                  to="/admin/payments/allocate"
                  className="block px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                  onClick={() => setIsPaymentDropdownOpen(false)}
                >
                  Allocate Payment
                </Link>
                <Link
                  to="/admin/payments/bulk-allocate"
                  className="block px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                  onClick={() => setIsPaymentDropdownOpen(false)}
                >
                  Bulk Allocate
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/admin/meal-plan" label="MealPlan"/>
          <NavLink to="/admin/feedback" label="Feedback / Complaints" />

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

      {/* Close dropdowns when clicking outside */}
      {(isRegisterDropdownOpen || isPaymentDropdownOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsRegisterDropdownOpen(false);
            setIsPaymentDropdownOpen(false);
          }}
        />
      )}
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