import { useEffect, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

interface Hostel {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  department?: string;
  year?: number;
  gender?: string;
}

export default function BulkPayment() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<{ days: number; amountPerDay: number; extra: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Bulk inputs for payment details
  const [bulkDays, setBulkDays] = useState<number>(0);
  const [bulkAmountPerDay, setBulkAmountPerDay] = useState<number>(0);
  const [bulkExtra, setBulkExtra] = useState<number>(0);
  const [bulkFeeMonth, setBulkFeeMonth] = useState<string>("");
  const [bulkDueDate, setBulkDueDate] = useState<string>("");
  const [bulkDescription, setBulkDescription] = useState<string>("");

  const fetchHostels = async () => {
    try {
      const res = await api.get("/hostel");
      if (!res.data.error) setHostels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (hostelId: string) => {
    try {
      // Clear previous students immediately
      setStudents([]);
      setPayments([]);
      // Clear bulk inputs
      setBulkDays(0);
      setBulkAmountPerDay(0);
      setBulkExtra(0);
      setBulkFeeMonth("");
      setBulkDueDate("");
      setBulkDescription("");
      
      setLoading(true);
      const res = await api.get(`/students/hostel/${hostelId}`);
      if (!res.data.error) {
        setStudents(res.data.data);
        setPayments(res.data.data.map(() => ({ days: 0, amountPerDay: 0, extra: 0 })));
        
        // Set default values for bulk inputs
        const now = new Date();
        setBulkFeeMonth(`${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`);
        setBulkDueDate(now.toISOString().split('T')[0]); // YYYY-MM-DD format
        setBulkDescription("Mess bill payment");
      }
    } catch (err) {
      console.error(err);
      // Ensure students are cleared even on error
      setStudents([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleHostelChange = (hostelId: string) => {
    setSelectedHostel(hostelId);
    setSuccessMsg("");
    setErrorMsg("");
    
    if (hostelId) {
      fetchStudents(hostelId);
    } else {
      // Clear students if no hostel is selected
      setStudents([]);
      setPayments([]);
      setBulkDays(0);
      setBulkAmountPerDay(0);
      setBulkExtra(0);
      setBulkFeeMonth("");
      setBulkDueDate("");
      setBulkDescription("");
    }
  };

  const handleInputChange = (index: number, field: "days" | "amountPerDay" | "extra", value: number) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  // New function to apply bulk values to all students
  const applyBulkValues = () => {
    const newPayments = payments.map(() => ({
      days: bulkDays,
      amountPerDay: bulkAmountPerDay,
      extra: bulkExtra
    }));
    setPayments(newPayments);
  };

  const handleSubmit = async () => {
    if (!selectedHostel) return setErrorMsg("Please select a hostel");
    
    // Validate that all required fields are filled
    const hasInvalidPayments = payments.some(payment => 
      payment.days <= 0 || payment.amountPerDay <= 0
    );
    
    if (hasInvalidPayments) {
      return setErrorMsg("Please enter valid days and amount per day for all students");
    }

    if (!bulkFeeMonth || !bulkDueDate) {
      return setErrorMsg("Please enter fee month and due date");
    }

    const payload = students.map((s, i) => ({
      studentProfileId: s.id,
      type: "mess bill",
      amount: payments[i].days * payments[i].amountPerDay + payments[i].extra,
      dueDate: new Date(bulkDueDate).toISOString(),
      feeMonth: bulkFeeMonth,
      description: bulkDescription || `Mess bill payment for ${payments[i].days} days`
    }));

    try {
      setLoading(true);
      const res = await api.post("/payment/bulk-allocate", { payments: payload });
      if (!res.data.error) {
        setSuccessMsg("Payments allocated successfully!");
        setErrorMsg("");
        // Clear form after successful submission
        setPayments(students.map(() => ({ days: 0, amountPerDay: 0, extra: 0 })));
        setBulkDays(0);
        setBulkAmountPerDay(0);
        setBulkExtra(0);
        // Keep the common fields so admin can reuse them if needed
      } else {
        setErrorMsg(res.data.message || "Failed to allocate payments");
        setSuccessMsg("");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-grow bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-6">Bulk Payment Allocation</h1>

          <div className="mb-6">
            <select
              value={selectedHostel}
              onChange={(e) => handleHostelChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64"
            >
              <option value="">Select Hostel</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {loading && <p className="text-gray-500 mb-4">Loading...</p>}
          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 mb-4">{successMsg}</p>}

          {students.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Bulk Set Values for All Students</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days for All
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkDays}
                    onChange={(e) => setBulkDays(+e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount/Day for All
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkAmountPerDay}
                    onChange={(e) => setBulkAmountPerDay(+e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra for All
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bulkExtra}
                    onChange={(e) => setBulkExtra(+e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={applyBulkValues}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow w-full"
                  >
                    Apply to All
                  </button>
                </div>
              </div>
              
              {/* Common fields for all students */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Month (MM-YYYY) *
                  </label>
                  <input
                    type="text"
                    placeholder="MM-YYYY"
                    value={bulkFeeMonth}
                    onChange={(e) => setBulkFeeMonth(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Payment description"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="px-4 py-2 border">Student Name</th>
                    <th className="px-4 py-2 border">Department</th>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Gender</th>
                    <th className="px-4 py-2 border">Days</th>
                    <th className="px-4 py-2 border">Amount/Day</th>
                    <th className="px-4 py-2 border">Extra</th>
                    <th className="px-4 py-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{s.name}</td>
                      <td className="px-4 py-2 border">{s.department || "N/A"}</td>
                      <td className="px-4 py-2 border">{s.year || "N/A"}</td>
                      <td className="px-4 py-2 border">{s.gender || "N/A"}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          min={0}
                          value={payments[idx]?.days || 0}
                          onChange={(e) => handleInputChange(idx, "days", +e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-20"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          min={0}
                          value={payments[idx]?.amountPerDay || 0}
                          onChange={(e) => handleInputChange(idx, "amountPerDay", +e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-24"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          min={0}
                          value={payments[idx]?.extra || 0}
                          onChange={(e) => handleInputChange(idx, "extra", +e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-20"
                        />
                      </td>
                      <td className="px-4 py-2 border font-semibold">
                        {payments[idx] ? (payments[idx].days * payments[idx].amountPerDay + payments[idx].extra) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 text-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "Allocate Payments"}
                </button>
              </div>
            </div>
          ) : selectedHostel && !loading ? (
            <p className="text-gray-500 text-center py-4">No students found in this hostel.</p>
          ) : null}
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}