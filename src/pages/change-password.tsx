import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axiosInstance";

export default function FirstTimeChangePassword() {
  const { user,profile } = useAuth(); // user contains userId, studentProfileId
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/login");
      return;
    }

    // Automatically send OTP when page loads
    sendOtp();
  }, [profile]);

  const sendOtp = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/send-otp/${profile.id}`);
      if (res.data.error) {
        setErrorMsg(res.data.message || "Failed to send OTP.");
      } else {
        setOtpSent(true);
        setSuccessMsg(res.data.message || "OTP has been sent to your registered email/phone.");
        setErrorMsg("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const verifyOtp = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/verify-otp/${profile.id}`, { otp });
      if (res.data.error) {
        setErrorMsg(res.data.message || "Invalid OTP. Please try again.");
      } else {
        setVerified(true);
        setSuccessMsg(res.data.message || "OTP verified! You can now set your new password.");
        setErrorMsg("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const changePassword = async () => {
    if (!profile?.userId) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/change-password/${profile.userId}`, { newPassword });
      if (res.data.error) {
        setErrorMsg(res.data.message || "Failed to change password.");
      } else {
        setSuccessMsg(res.data.message || "Password changed successfully!");
        setErrorMsg("");
        navigate(user?.role === "student" ? "/student/dashboard" : "/admin/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to change password. Try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Change Password
        </h1>

        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 mb-2">{successMsg}</p>}

        {!verified ? (
          <>
            <div>
              <label className="block text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400"
              />
            </div>
            <button
              onClick={changePassword}
              disabled={loading || !newPassword}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
