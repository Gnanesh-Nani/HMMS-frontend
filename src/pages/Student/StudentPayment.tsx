import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import StripeSuccessModal from "../../components/StripeSuccessModal";
import PreferenceModal from "../../components/PreferenceModal";
import type { StudentPreference } from "../../components/PreferenceModal";
import { StudyHabit,HealthCondition } from "../../components/PreferenceModal"; 

interface Payment {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  description: string;
  feeMonth?: string;
}

export default function StudentPayment() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [generatingNoDue, setGeneratingNoDue] = useState(false);
  const [noDueError, setNoDueError] = useState("");

  // Stripe success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [successError, setSuccessError] = useState<string | null>(null);

  // Preference modal state
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [preferenceError, setPreferenceError] = useState("");
  const [preferenceData, setPreferenceData] = useState<StudentPreference>({
    studentProfileId: "",
    preferredRoommates: [],
    wakeupTime: "08:00",
    sleepTime: "22:00",
    studyHabit: StudyHabit.FLEXIBLE,
    healthCondition: HealthCondition.NONE,
  });

  const [searchParams] = useSearchParams();
  const queryPaymentId = searchParams.get("paymentId");
  const querySuccess = searchParams.get("success");

  // Fetch payments
  const fetchPayments = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get(`/payment/${profile.id}`);
      if (!res.data.error) {
        setPayments(res.data.data || []);
      } else {
        setErrorMsg(res.data.message || "Failed to fetch payments.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error fetching payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [profile]);

  // Fetch student preference
  const fetchStudentPreference = async () => {
    if (!profile) return;
    try {
      setPreferenceLoading(true);
      setPreferenceError("");
      const res = await api.get(`/students/preference/${profile.id}`);
      if (!res.data.error && res.data.data) {
        const pref = res.data.data;
        setPreferenceData({
          studentProfileId: profile.id,
          preferredRoommates: pref.preferredRoommates || [],
          wakeupTime: pref.wakeupTime ? pref.wakeupTime.substring(0, 5) : "08:00",
          sleepTime: pref.sleepTime ? pref.sleepTime.substring(0, 5) : "22:00",
          studyHabit: pref.studyHabit || StudyHabit.FLEXIBLE,
          healthCondition: pref.healthCondition || HealthCondition.NONE,
          id: pref.id
        });
      } else {
        // Initialize with default values if no preference found
        setPreferenceData({
          studentProfileId: profile.id,
          preferredRoommates: [],
          wakeupTime: "08:00",
          sleepTime: "22:00",
          studyHabit: StudyHabit.FLEXIBLE,
          healthCondition: HealthCondition.NONE,
        });
      }
    } catch (err: any) {
      console.error("Error fetching preference:", err);
      // Initialize with default values on error
      setPreferenceData({
        studentProfileId: profile.id,
        preferredRoommates: [],
        wakeupTime: "08:00",
        sleepTime: "22:00",
        studyHabit: StudyHabit.FLEXIBLE,
        healthCondition: HealthCondition.NONE,
      });
    } finally {
      setPreferenceLoading(false);
    }
  };

  // Save preference
  const savePreference = async () => {
    if (!profile) return;
    try {
      setPreferenceLoading(true);
      setPreferenceError("");

      // Prepare data for API
      const submitData = {
        studentProfileId: profile.id,
        preferredRoommates: preferenceData.preferredRoommates,
        wakeupTime: `${preferenceData.wakeupTime}:00`,
        sleepTime: `${preferenceData.sleepTime}:00`,
        studyHabit: preferenceData.studyHabit,
        healthCondition: preferenceData.healthCondition,
      };

      let res;
      if (preferenceData.id) {
        // Update existing preference
        res = await api.patch(`/students/preference/${profile.id}`, submitData);
      } else {
        // Create new preference
        res = await api.post(`/students/preference`, submitData);
      }

      if (!res.data.error) {
        setShowPreferenceModal(false);
        // Continue with payment after preference is saved
        if (currentPaymentId) {
          await processPayment(currentPaymentId);
        }
      } else {
        setPreferenceError(res.data.message || "Failed to save preference.");
      }
    } catch (err: any) {
      console.error("Error saving preference:", err);
      setPreferenceError(err.response?.data?.message || "Error saving preference.");
    } finally {
      setPreferenceLoading(false);
    }
  };

  // Pay Now with preference check
  const handlePayNow = async (paymentId: string) => {
    if (!profile) return;
    
    const payment = payments.find(p => p.id === paymentId);
    
    // Check if it's hostel fee and show preference modal
    if (payment?.type.toLowerCase().includes('hostel')) {
      setCurrentPaymentId(paymentId);
      await fetchStudentPreference();
      setShowPreferenceModal(true);
      return;
    }
    
    // For non-hostel payments, proceed directly
    await processPayment(paymentId);
  };

  // Process payment (actual payment processing)
  const processPayment = async (paymentId: string) => {
    if (!profile) return;
    try {
      setProcessingId(paymentId);
      const res = await api.post(`/stripe/checkout`, {
        studentId: profile.id,
        paymentId,
      });

      if (!res.data.error && res.data.data.url) {
        localStorage.setItem("stripeSessionId", res.data.data.sessionId);
        window.location.href = res.data.data.url;
      } else {
        alert(res.data.message || "Failed to initiate Stripe checkout.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating Stripe session.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle preference form submission and continue to payment
  const handlePreferenceSubmit = async () => {
    await savePreference();
  };

  // Skip preference and proceed to payment
  const handleSkipPreference = async () => {
    setShowPreferenceModal(false);
    if (currentPaymentId) {
      await processPayment(currentPaymentId);
    }
  };

  // Generate No Due Form
  const handleGenerateNoDue = async () => {
    if (!profile) return;
    
    // Check if there are pending payments
    const pendingPayments = payments.filter(p => p.status === "pending");
    if (pendingPayments.length > 0) {
      setNoDueError("You have pending payments. Please clear all payments before generating No Due form.");
      return;
    }

    try {
      setGeneratingNoDue(true);
      setNoDueError("");
      
      const res = await api.post(`/no-due/generate/${profile.id}`, {
        purpose: "Hostel and Mess Clearance"
      }, {
        responseType: 'blob'
      });

      // Create blob and download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'no_due_certificate.pdf';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('No Due generation error:', err);
      if (err.response?.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorData = JSON.parse(errorText);
          setNoDueError(errorData.message || "Failed to generate No Due form.");
        } catch {
          setNoDueError("Failed to generate No Due form. Please try again.");
        }
      } else {
        setNoDueError(err.response?.data?.message || "Failed to generate No Due form.");
      }
    } finally {
      setGeneratingNoDue(false);
    }
  };

  // Handle success via query params + localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem("stripeSessionId");
    if (queryPaymentId && querySuccess === "true" && sessionId) {
      const markPaymentSuccess = async () => {
        try {
          const res = await api.get(`/stripe/success/${sessionId}`);
          if (!res.data.error) {
            setReceiptUrl(res.data.data.receiptUrl);
            setShowSuccess(true);
            fetchPayments();
          } else {
            setSuccessError(res.data.message || "Failed to verify payment.");
            setShowSuccess(true);
          }
        } catch (err: any) {
          setSuccessError(err.response?.data?.message || "Error verifying payment.");
          setShowSuccess(true);
        } finally {
          localStorage.removeItem("stripeSessionId");
        }
      };
      markPaymentSuccess();
    }
  }, [queryPaymentId, querySuccess]);

  // Separate payments
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const completedPayments = payments.filter((p) => p.status === "success");

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-grow bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              My Payments
            </h1>
            
            <div className="flex flex-col items-end">
              <button
                onClick={handleGenerateNoDue}
                disabled={generatingNoDue || pendingPayments.length > 0}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                  generatingNoDue || pendingPayments.length > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {generatingNoDue ? "Generating..." : "Generate No Due Form"}
              </button>
              {pendingPayments.length > 0 && (
                <p className="text-sm text-red-600 mt-2 text-right max-w-xs">
                  Clear all pending payments to generate No Due form
                </p>
              )}
            </div>
          </div>

          {noDueError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {noDueError}
            </div>
          )}

          {loading && <p className="text-center text-gray-500">Loading payments...</p>}
          {errorMsg && <p className="text-center text-red-500 mb-4">{errorMsg}</p>}

          {/* Pending Payments */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Pending Payments
            </h2>
            {pendingPayments.length === 0 ? (
              <p className="text-gray-600">No pending payments</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-red-500 hover:shadow-2xl transition duration-300 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-gray-800">{p.type}</span>
                        <span className="text-red-500 font-bold capitalize">{p.status}</span>
                      </div>
                      <div className="text-gray-700 mb-1">
                        <span className="font-medium">Amount:</span> ₹{p.amount.toFixed(2)}
                      </div>
                      <div className="text-gray-700 mb-1">
                        <span className="font-medium">Due Date:</span>{" "}
                        {new Date(p.dueDate).toLocaleDateString()}
                      </div>
                      {p.feeMonth && (
                        <div className="text-gray-700 mb-1">
                          <span className="font-medium">Fee Month:</span> {p.feeMonth}
                        </div>
                      )}
                      <div className="text-gray-700">{p.description}</div>
                    </div>

                    <button
                      onClick={() => handlePayNow(p.id)}
                      disabled={processingId === p.id}
                      className={`mt-auto w-full py-2 rounded-lg text-white ${
                        processingId === p.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      } transition`}
                    >
                      {processingId === p.id ? "Processing..." : "Pay Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Completed Payments
            </h2>
            {completedPayments.length === 0 ? (
              <p className="text-gray-600">No completed payments yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedPayments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500 hover:shadow-2xl transition duration-300 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-gray-800">{p.type}</span>
                        <span className="text-green-600 font-bold capitalize">{p.status}</span>
                      </div>
                      <div className="text-gray-700 mb-1">
                        <span className="font-medium">Amount:</span> ₹{p.amount.toFixed(2)}
                      </div>
                      <div className="text-gray-700 mb-1">
                        <span className="font-medium">Paid On:</span>{" "}
                        {new Date(p.dueDate).toLocaleDateString()}
                      </div>
                      {p.feeMonth && (
                        <div className="text-gray-700 mb-1">
                          <span className="font-medium">Fee Month:</span> {p.feeMonth}
                        </div>
                      )}
                      <div className="text-gray-700">{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Preference Modal */}
        <PreferenceModal
          show={showPreferenceModal}
          onClose={() => setShowPreferenceModal(false)}
          onSubmit={handlePreferenceSubmit}
          onSkip={handleSkipPreference}
          profile={profile}
          preferenceData={preferenceData}
          setPreferenceData={setPreferenceData}
          loading={preferenceLoading}
          error={preferenceError}
        />

        <StripeSuccessModal
          show={showSuccess}
          receiptUrl={receiptUrl}
          error={successError}
          onClose={() => setShowSuccess(false)}
        />
      </main>
      <AdminFooter />
    </div>
  );
}