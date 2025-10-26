import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import StripeSuccessModal from "../../components/StripeSuccessModal";

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

  // Stripe success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [successError, setSuccessError] = useState<string | null>(null);

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

  // Pay Now
  const handlePayNow = async (paymentId: string) => {
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
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            My Payments
          </h1>

          {loading && <p className="text-center text-gray-500">Loading payments...</p>}
          {errorMsg && <p className="text-center text-red-500 mb-4">{errorMsg}</p>}

          {/* Pending Payments */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Pending Payments
            </h2>
            {pendingPayments.length === 0 ? (
              <p className="text-gray-600">No pending payments </p>
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
