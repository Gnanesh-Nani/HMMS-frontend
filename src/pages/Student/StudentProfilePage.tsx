import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import PopupAlert from "../../components/PopupAlert";
import { useAuth } from "../../context/AuthContext";
import StudentHeader from "../../components/StudentHeader";
import Footer from "../../components/Footer";

interface Student {
  id: string;
  userId: string;
  name: string;
  gender: "male" | "female" | "other";
  department: string;
  year: number;
  dob: string | null;
  fathersName: string | null;
  address: string | null;
  mailId: string;
  contacts: string[];
}

export default function StudentProfileSelfPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "male" as "male" | "female" | "other",
    department: "",
    year: 1,
    dob: "",
    fathersName: "",
    address: "",
    mailId: "",
    contacts: [] as string[],
  });

  const [popup, setPopup] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showPopup = (type: "success" | "error", message: string) => setPopup({ type, message });

  // Fetch current student profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${profile?.id}`);
      if (!res.data.error) {
        setStudent(res.data.data);
        setFormData({
          name: res.data.data.name,
          gender: res.data.data.gender,
          department: res.data.data.department,
          year: res.data.data.year,
          dob: res.data.data.dob || "",
          fathersName: res.data.data.fathersName || "",
          address: res.data.data.address || "",
          mailId: res.data.data.mailId,
          contacts: res.data.data.contacts || [],
        });
      } else showPopup("error", res.data.message);
    } catch (err: any) {
      showPopup("error", err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactsChange = (index: number, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = value;
    setFormData((prev) => ({ ...prev, contacts: newContacts }));
  };

  const addContactField = () => {
    setFormData((prev) => ({ ...prev, contacts: [...prev.contacts, ""] }));
  };

  const removeContactField = (index: number) => {
    const newContacts = [...formData.contacts];
    newContacts.splice(index, 1);
    setFormData((prev) => ({ ...prev, contacts: newContacts }));
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      const res = await api.patch(`/students/${student?.id}`, payload);
      if (!res.data.error) {
        showPopup("success", "Profile updated successfully");
        fetchProfile();
        setShowForm(false);
      } else showPopup("error", res.data.message);
    } catch (err: any) {
      showPopup("error", err.response?.data?.message || "Update failed");
    }
  };

  // Get first letter of name for profile circle
  const getInitial = () => {
    return student?.name?.charAt(0).toUpperCase() || "U";
  };

  const navigateToChangePassword = () => {
    navigate("/change-password");
  };

  if (loading || !student) return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-grow bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-center">Loading profile...</p>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <StudentHeader />
      
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Profile Image and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Circular Profile Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                {getInitial()}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 truncate">{student.name}</h1>
                <p className="text-gray-600 text-sm md:text-base">{student.department} • Year {student.year}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={navigateToChangePassword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm w-full md:w-auto"
              >
                Change Password
              </button>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm w-full md:w-auto"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* View Profile */}
          {!showForm ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Full Name" value={student.name} />
                    <InfoField label="Gender" value={student.gender} capitalize />
                    <InfoField label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"} />
                    <InfoField label="Father's Name" value={student.fathersName || "N/A"} />
                  </div>
                </div>

                {/* Academic & Contact Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Academic & Contact Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField label="Department" value={student.department} />
                      <InfoField label="Year" value={`Year ${student.year}`} />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <InfoField label="Email" value={student.mailId} breakWords />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <InfoField 
                        label="Contact Numbers" 
                        value={student.contacts.length > 0 ? student.contacts.join(", ") : "N/A"} 
                        breakWords
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <InfoField label="Address" value={student.address || "N/A"} breakWords />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Profile Form
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div> */}

                  {/* <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      min="1"
                      max="4"
                    />
                  </div> */}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                    <input
                      type="text"
                      name="fathersName"
                      value={formData.fathersName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="mailId"
                      value={formData.mailId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-vertical"
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Contact Numbers</label>
                  <div className="space-y-3">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={contact}
                          onChange={(e) => handleContactsChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Contact number"
                        />
                        <button
                          type="button"
                          onClick={() => removeContactField(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium w-full sm:w-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addContactField}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium w-full sm:w-auto"
                    >
                      + Add Contact Number
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium w-full sm:w-auto order-1 sm:order-2"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {popup && <PopupAlert type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
      
      <Footer />
    </div>
  );
}

// Helper component for info fields
function InfoField({ 
  label, 
  value, 
  capitalize = false, 
  breakWords = false 
}: { 
  label: string; 
  value: string; 
  capitalize?: boolean;
  breakWords?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <p className={`text-base font-semibold text-gray-800 ${capitalize ? 'capitalize' : ''} ${breakWords ? 'break-words' : ''} leading-relaxed`}>
        {value}
      </p>
    </div>
  );
}