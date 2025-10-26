import { useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

export const Departments = {
  CSE: "CSE",
  IT: "IT",
  ECE: "ECE",
  EEE: "EEE",
  IBT: "IBT",
  EIE: "EIE",
  MECH: "MECH",
  CIVIL: "CIVIL",
} as const;


export default function SingleRegister() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState<any>({
    registerNo: "",
    password: "",
    name: "",
    year: "",
    gender: "",
    department: Departments.CSE,
    mailId: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.registerNo || !formData.password || !formData.name || !formData.gender || !formData.mailId) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    if (!isAdmin && (!formData.year || !formData.department)) {
      setErrorMsg("Please fill all required fields for student registration.");
      return;
    }

    try {
      setLoading(true);
      const url = isAdmin ? "/admin/register/admin" : "/admin/register";

      const payload = isAdmin
        ? {
          registerNo: formData.registerNo,
          password: formData.password,
          name: formData.name,
          gender: formData.gender,
          mailId: formData.mailId,
        }
        : {
          registerNo: formData.registerNo,
          password: formData.password,
          name: formData.name,
          year: Number(formData.year),
          gender: formData.gender,
          department: formData.department,
          mailId: formData.mailId,
        };

      const res = await api.post(url, payload);

      setSuccessMsg(res.data.message || "Registration successful!");
      setFormData({
        registerNo: "",
        password: "",
        name: "",
        year: "",
        gender: "",
        department: Departments.CSE,
        mailId: "",
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };


  const toggleUserType = (admin: boolean) => {
    setIsAdmin(admin);
    // Clear messages when toggling
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-grow bg-gray-100 p-6 flex justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {isAdmin ? "Register Admin" : "Register Student"}
          </h1>

          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => toggleUserType(false)}
              className={`px-4 py-2 rounded-md font-medium ${!isAdmin ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Student
            </button>
            <button
              onClick={() => toggleUserType(true)}
              className={`px-4 py-2 rounded-md font-medium ${isAdmin ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <input
              type="text"
              name="registerNo"
              placeholder="Register No"
              value={formData.registerNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            {!isAdmin && (
              <>
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                {/* Department Dropdown */}
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {Object.values(Departments).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </>
            )}

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="email"
              name="mailId"
              placeholder="Email"
              value={formData.mailId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Error / Success Messages */}
          {errorMsg && <p className="text-red-500 mt-2 text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 mt-2 text-center">{successMsg}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 w-full py-2.5 rounded-lg text-white font-medium transition ${loading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}