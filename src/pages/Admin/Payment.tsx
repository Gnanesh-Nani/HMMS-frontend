import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

interface StudentProfile {
  name: string;
  gender: string;
  department: string;
  year: number;
  id: string;
}

interface Payment {
  id: string;
  studentProfileId: StudentProfile | null; // Updated to allow null
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  feeMonth: string;
  description: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [searchName, setSearchName] = useState("");

  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payment");
      if (!res.data.error) {
        setPayments(res.data.data);
        setFilteredPayments(res.data.data);
      } else {
        setErrorMsg(res.data.message || "Failed to fetch payments.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Safe filter function to handle null studentProfileId
  useEffect(() => {
    let filtered = payments;

    if (year) {
      filtered = filtered.filter((p) => 
        p.studentProfileId?.year?.toString() === year
      );
    }
    if (department) {
      filtered = filtered.filter((p) =>
        p.studentProfileId?.department?.toLowerCase().includes(department.toLowerCase())
      );
    }
    if (gender) {
      filtered = filtered.filter((p) =>
        p.studentProfileId?.gender?.toLowerCase() === gender.toLowerCase()
      );
    }
    if (searchName) {
      filtered = filtered.filter((p) =>
        p.studentProfileId?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [year, department, gender, searchName, payments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      const res = await api.delete(`/payment/delete/${id}`);
      if (!res.data.error) {
        setSuccessMsg("Payment deleted successfully!");
        setPayments((prev) => prev.filter((p) => p.id !== id));
      } else {
        setErrorMsg(res.data.message || "Failed to delete payment.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to delete payment.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get student info
  const getStudentInfo = (studentProfile: StudentProfile | null) => {
    if (!studentProfile) {
      return {
        name: "Unknown Student",
        department: "N/A",
        year: "N/A",
        gender: "N/A"
      };
    }
    
    return {
      name: studentProfile.name || "Unknown Student",
      department: studentProfile.department || "N/A",
      year: studentProfile.year?.toString() || "N/A",
      gender: studentProfile.gender || "N/A"
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-grow bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">All Payments</h1>
            <button
              onClick={() => navigate("/admin/payments/allocate")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
            >
              + Allocate Payment
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-48 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-32"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-40"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-32"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading && <p className="text-center text-gray-500">Processing...</p>}
          {errorMsg && <p className="text-center text-red-500 mb-4">{errorMsg}</p>}
          {successMsg && <p className="text-center text-green-500 mb-4">{successMsg}</p>}
          {!loading && !errorMsg && filteredPayments.length === 0 && (
            <p className="text-center text-gray-500">No payments found.</p>
          )}

          {filteredPayments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="px-4 py-2 border w-36">Student Name</th>
                    <th className="px-4 py-2 border w-24">Department</th>
                    <th className="px-4 py-2 border w-16">Year</th>
                    <th className="px-4 py-2 border w-20">Gender</th>
                    <th className="px-4 py-2 border w-24">Type</th>
                    <th className="px-4 py-2 border w-20">Amount</th>
                    <th className="px-4 py-2 border w-24">Due Date</th>
                    <th className="px-4 py-2 border w-20">Status</th>
                    <th className="px-4 py-2 border w-24">Month</th>
                    <th className="px-4 py-2 border w-32">Description</th>
                    <th className="px-4 py-2 border w-36">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const studentInfo = getStudentInfo(p.studentProfileId);
                    
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{studentInfo.name}</td>
                        <td className="px-4 py-2 border">{studentInfo.department}</td>
                        <td className="px-4 py-2 border">{studentInfo.year}</td>
                        <td className="px-4 py-2 border">{studentInfo.gender}</td>
                        <td className="px-4 py-2 border">{p.type}</td>
                        <td className="px-4 py-2 border">₹{p.amount}</td>
                        <td className="px-4 py-2 border">{new Date(p.dueDate).toLocaleDateString()}</td>
                        <td
                          className={`px-4 py-2 border font-semibold ${
                            p.status === "pending" ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {p.status}
                        </td>
                        <td className="px-4 py-2 border">{p.feeMonth}</td>
                        <td className="px-4 py-2 border">{p.description}</td>
                        <td className="px-4 py-2 border">
                          <div className="flex justify-center gap-2">
                            {p.status !== "success" && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate("/admin/payments/allocate", { state: { payment: p } })
                                  }
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}