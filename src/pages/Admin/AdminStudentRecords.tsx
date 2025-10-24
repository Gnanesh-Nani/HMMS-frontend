import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";

interface Student {
  registerNo: string;
  name: string;
  year: string;
  gender: string;
  role: string;
  department: string;
  mailId: string;
}

export default function AdminStudentRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students"); // Replace with your API endpoint
      setStudents(res.data.students || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load student records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <AdminHeader />

      {/* Page Content */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Student Records</h1>
            <button
              onClick={() => window.location.href = "/admin/bulk-register"}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Bulk Register
            </button>
          </div>

          {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
          {loading ? (
            <p className="text-gray-500">Loading students...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-2 px-4 border">Register No</th>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Year</th>
                    <th className="py-2 px-4 border">Gender</th>
                    <th className="py-2 px-4 border">Role</th>
                    <th className="py-2 px-4 border">Department</th>
                    <th className="py-2 px-4 border">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.registerNo} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{student.registerNo}</td>
                      <td className="py-2 px-4 border">{student.name}</td>
                      <td className="py-2 px-4 border">{student.year}</td>
                      <td className="py-2 px-4 border">{student.gender}</td>
                      <td className="py-2 px-4 border">{student.role}</td>
                      <td className="py-2 px-4 border">{student.department}</td>
                      <td className="py-2 px-4 border">{student.mailId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && !loading && (
                <p className="text-gray-500 mt-4 text-center">No student records found.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Admin Footer */}
      <AdminFooter />
    </div>
  );
}
