import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

interface StudentProfile {
  id: string;
  name: string;
  gender: string;
  department: string;
  year: number;
}

export default function AllocatePayment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    studentProfileId: "",
    type: "",
    amount: "",
    dueDate: "",
    feeMonth: "",
    description: "",
  });

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
      if (!res.data.error) setStudents(res.data.data);
      else setErrorMsg("Failed to fetch students");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Prepopulate form if editing
  useEffect(() => {
    if (location.state?.payment) {
      const p = location.state.payment;
      setFormData({
        id: p.id,
        studentProfileId: p.studentProfileId.id,
        type: p.type,
        amount: p.amount.toString(),
        dueDate: new Date(p.dueDate).toISOString().split("T")[0],
        feeMonth: p.feeMonth,
        description: p.description,
      });
      setIsEditing(true);
    }
  }, [location.state]);

  const handleSubmit = async () => {
    if (!formData.studentProfileId || !formData.type || !formData.amount) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = {
        studentProfileId: formData.studentProfileId,
        type: formData.type,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        feeMonth: formData.feeMonth,
        description: formData.description,
      };

      let res;
      if (isEditing) {
        res = await api.patch(`/payment/update/${formData.id}`, payload);
      } else {
        res = await api.post("/payment/allocate", payload);
      }

      if (!res.data.error) {
        setSuccessMsg(isEditing ? "Payment updated successfully!" : "Payment allocated successfully!");
        setFormData({
          id: "",
          studentProfileId: "",
          type: "",
          amount: "",
          dueDate: "",
          feeMonth: "",
          description: "",
        });
        setIsEditing(false);
        setTimeout(() => navigate("/admin/payments"), 1000);
      } else {
        setErrorMsg(res.data.message || "Failed to save payment.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to save payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-grow bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            {isEditing ? "Edit Payment" : "Allocate Payment"}
          </h1>

          {loading && <p className="text-center text-gray-500">Processing...</p>}
          {errorMsg && <p className="text-center text-red-500 mb-4">{errorMsg}</p>}
          {successMsg && <p className="text-center text-green-600 mb-4">{successMsg}</p>}

          <div className="flex flex-col gap-3 mb-6">
            <select
              value={formData.studentProfileId}
              onChange={(e) => setFormData({ ...formData, studentProfileId: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.department} ({s.year} yr)
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Type (e.g. Hostel Fee)"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />

            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />

            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />

            <input
              type="text"
              placeholder="Fee Month (e.g. 10-2025)"
              value={formData.feeMonth}
              onChange={(e) => setFormData({ ...formData, feeMonth: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-2 transition"
            >
              {isEditing ? "Update Payment" : "Allocate Payment"}
            </button>
          </div>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}
