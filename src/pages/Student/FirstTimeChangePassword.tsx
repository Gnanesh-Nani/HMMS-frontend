import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function FirstTimeChangePassword() {
  const { user, profile } = useAuth();
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
    sendOtp();
  }, [profile]);

  const sendOtp = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/send-otp/${profile.id}`);
      setOtpSent(true);
      setSuccessMsg(res.data.message || "OTP has been sent.");
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to send OTP.";
      setErrorMsg(message);
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/verify-otp/${profile.id}`, { otp });
      setVerified(true);
      setSuccessMsg(res.data.message || "OTP verified!");
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const message =
        err.response?.data?.message || err.message || "Invalid OTP. Please try again.";
      setErrorMsg(message);
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!profile?.userId) return;
    try {
      setLoading(true);
      const res = await api.post(`/otp/change-password/${profile.userId}`, {
        newPassword,
      });
      setSuccessMsg(res.data.message || "Password changed successfully!");
      setErrorMsg("");
      navigate(user?.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (err: any) {
      console.error("Error changing password:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to change password.";
      setErrorMsg(message);
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-4">
          Change Password
        </h1>
        <p className="text-sm text-center text-slate-500 mb-6">
          {verified ? "Set your new password below" : "Enter OTP sent to your email/phone"}
        </p>

        {errorMsg && <p className="text-red-500 mb-2 text-sm text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 mb-2 text-sm text-center">{successMsg}</p>}

        {!verified ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter OTP
              </label>
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otp[idx] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/, "");
                      const newOtp = otp.split("");
                      newOtp[idx] = val;
                      setOtp(newOtp.join(""));

                      if (val) {
                        const nextInput = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        e.preventDefault();
                        const newOtp = otp.split("");
                        if (newOtp[idx]) {
                          newOtp[idx] = "";
                          setOtp(newOtp.join(""));
                        } else {
                          const prevInput = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null;
                          prevInput?.focus();
                          if (prevInput) {
                            const prevOtp = otp.split("");
                            prevOtp[idx - 1] = "";
                            setOtp(prevOtp.join(""));
                          }
                        }
                      }
                    }}
                    id={`otp-${idx}`}
                    className="w-12 h-12 text-center text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className={`w-full mt-4 py-2.5 rounded-lg text-white font-medium transition ${
                loading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <button
              onClick={changePassword}
              disabled={loading || !newPassword}
              className={`w-full mt-4 py-2.5 rounded-lg text-white font-medium transition ${
                loading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
