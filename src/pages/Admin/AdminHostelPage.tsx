import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import PopupAlert from "../../components/PopupAlert";
import HostelModal from "../../components/HostelModal";
import api from "../../api/axiosInstance";
import type { Hostel, MealPlan } from "../../components/HostelModal";

export default function AdminHostelPage() {
  const navigate = useNavigate();

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "boys",
    totalBlocks: 1,
    warden: "",
    description: "",
    mealPlan: "",
    hostelFee: 0, // Add this line
  });
  const [popup, setPopup] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; hostelId: string; hostelName: string } | null>(null);

  const showPopup = (type: "success" | "error", message: string) => setPopup({ type, message });

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hostel");
      if (!res.data.error) setHostels(res.data.data);
      else setErrorMsg(res.data.message);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const res = await api.get("/meal-plan");
      if (!res.data.error) setMealPlans(res.data.data);
    } catch {
      console.error("Failed to fetch meal plans");
    }
  };

  useEffect(() => { fetchHostels(); fetchMealPlans(); }, []);

  const openAddForm = () => {
    setEditingHostel(null);
    setFormData({ 
      name: "", 
      type: "boys", 
      totalBlocks: 1, 
      warden: "", 
      description: "", 
      mealPlan: "",
      hostelFee: 0 // Add this line
    });
    setShowForm(true);
  };

  const openEditForm = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      type: hostel.type,
      totalBlocks: hostel.totalBlocks,
      warden: hostel.warden,
      description: hostel.description,
      mealPlan: hostel.mealPlan?.id || "",
      hostelFee: hostel.hostelFee || 0 // Add this line
    });
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      // Convert hostelFee to number
      const submitData = {
        ...data,
        hostelFee: Number(data.hostelFee)
      };

      if (editingHostel) {
        const res = await api.patch(`/hostel/${editingHostel.id}`, submitData);
        if (!res.data.error) { 
          showPopup("success", "Hostel updated successfully"); 
          fetchHostels(); 
          setShowForm(false); 
        }
        else showPopup("error", res.data.message);
      } else {
        const res = await api.post("/hostel", submitData);
        if (!res.data.error) { 
          showPopup("success", "Hostel created successfully"); 
          fetchHostels(); 
          setShowForm(false); 
        }
        else showPopup("error", res.data.message);
      }
    } catch (err: any) {
      showPopup("error", err.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await api.delete(`/hostel/${deleteConfirm.hostelId}`);
      if (!res.data.error) { 
        showPopup("success", "Hostel deleted successfully"); 
        fetchHostels(); 
      }
      else showPopup("error", res.data.message);
    } catch (err: any) { 
      showPopup("error", err.response?.data?.message || "Failed to delete hostel"); 
    }
    finally { setDeleteConfirm(null); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Hostel Management</h1>
            <button onClick={openAddForm} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">+ Add Hostel</button>
          </div>

          {loading && <p className="text-gray-500 text-center">Loading...</p>}
          {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}
          {!loading && hostels.length === 0 && <p className="text-gray-600 text-center">No hostels found.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map(h => (
              <div
                key={h.id}
                onClick={() => navigate(`/admin/hostels/${h.id}/blocks`)}
                className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition cursor-pointer"
              >
                <div className="absolute right-4 top-4 text-gray-500 opacity-60">
                  <Building2 size={60} />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">{h.name}</h2>
                  <p className="text-sm text-gray-500 capitalize mb-2">{h.type} hostel • {h.totalBlocks} blocks</p>
                  <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Warden:</span> {h.warden || "N/A"}</p>
                  <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Meal Plan:</span> {h.mealPlan ? h.mealPlan.name : "Not Assigned"}</p>
                  {/* Add hostel fee display */}
                  <p className="text-gray-700 text-sm mb-1">
                    <span className="font-semibold">Hostel Fee:</span> ₹{h.hostelFee || 0}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">{h.description || "No description provided."}</p>
                  <div className="flex justify-between mt-3">
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(h); }}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition text-sm">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, hostelId: h.id, hostelName: h.name }); }}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <HostelModal
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        editingHostel={editingHostel}
        mealPlans={mealPlans}
        formData={formData}
        setFormData={setFormData}
      />

      {deleteConfirm?.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">Confirm Deletion</h2>
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-2">Are you sure you want to delete the hostel?</p>
              <p className="font-semibold text-lg text-gray-800">"{deleteConfirm.hostelName}"</p>
              <p className="text-red-500 text-sm mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {popup && <PopupAlert type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
      <AdminFooter />
    </div>
  );
}