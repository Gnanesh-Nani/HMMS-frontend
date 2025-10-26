import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import BlockModal from "../../components/BlockModal";

interface Block {
  id: string;
  name: string;
  totalFloors: number;
  hostelId: string;
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  totalBlocks: number;
  warden: string;
  description: string;
  mealPlan: string;
}

export default function AdminBlockPage() {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(false);
  const [hostelLoading, setHostelLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBlock, setEditBlock] = useState<Block | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; blockId: string; blockName: string } | null>(null);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hostel/${hostelId}/block`);
      if (!res.data.error) {
        setBlocks(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch blocks");
    } finally {
      setLoading(false);
    }
  };

  const fetchHostel = async () => {
    if (!hostelId) return;
    
    try {
      setHostelLoading(true);
      const res = await api.get(`/hostel/${hostelId}`);
      if (!res.data.error) {
        setHostel(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch hostel details:", err);
    } finally {
      setHostelLoading(false);
    }
  };

  const showDeleteConfirm = (block: Block) => {
    setDeleteConfirm({
      show: true,
      blockId: block.id,
      blockName: block.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await api.delete(`/hostel/${hostelId}/block/${deleteConfirm.blockId}`);
      fetchBlocks();
    } catch (err: any) {
      alert("Failed to delete block");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Navigate to room management page for the block
  const navigateToRooms = (blockId: string, blockName: string) => {
    navigate(`/admin/hostels/${hostelId}/blocks/${blockId}/rooms`, {
      state: { blockName, hostelName: hostel?.name }
    });
  };

  useEffect(() => {
    if (hostelId) {
      fetchBlocks();
      fetchHostel();
    }
  }, [hostelId]);

  const isOverlayActive = showModal || deleteConfirm?.show;

  return (
    <div className={`min-h-screen flex flex-col ${isOverlayActive ? "backdrop-blur-sm" : ""}`}>
      <AdminHeader />
      <main className={`flex-grow bg-gray-50 p-6 transition-all duration-300 ${isOverlayActive ? "blur-sm" : ""}`}>
        <div className="max-w-5xl mx-auto">
          {/* Header with Hostel Info */}
          <div className="mb-8">
            {hostelLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            ) : hostel ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {hostel.name} - Blocks
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="capitalize"> {hostel.type} Hostel</span>
                      <span> Warden: {hostel.warden || "Not assigned"}</span>
                      <span> Total Blocks: {hostel.totalBlocks}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditBlock(null);
                      setShowModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mt-4 sm:mt-0"
                  >
                    + Add Block
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Blocks</h1>
                <button
                  onClick={() => {
                    setEditBlock(null);
                    setShowModal(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  + Add Block
                </button>
              </div>
            )}
          </div>

          {loading && <p className="text-gray-500 text-center">Loading blocks...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500 flex flex-col justify-between hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => navigateToRooms(b.id, b.name)}
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                    Block {b.name}
                  </h2>
                  <p className="text-gray-700">Total Floors: {b.totalFloors}</p>
                  <p className="text-blue-600 text-sm mt-2 hover:text-blue-700 flex items-center gap-1">
                    <span>Click to manage rooms</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </p>
                </div>
                <div className="flex justify-between mt-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditBlock(b);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => showDeleteConfirm(b)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && blocks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow border">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Blocks Found
              </h3>
              <p className="text-gray-600 mb-4">
                {hostel ? `Get started by creating the first block for ${hostel.name}` : "Get started by creating the first block"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create First Block
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Block Modal */}
      <BlockModal
        show={showModal}
        onClose={() => setShowModal(false)}
        hostelId={hostelId!}
        block={editBlock}
        onSuccess={() => {
          setShowModal(false);
          fetchBlocks();
          fetchHostel(); // Refresh hostel data to update totalBlocks count
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm?.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              Confirm Deletion
            </h2>
            
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this block?
              </p>
              <p className="font-semibold text-lg text-gray-800">
                "Block {deleteConfirm.blockName}"
              </p>
              {hostel && (
                <p className="text-gray-600 text-sm mt-1">
                  from {hostel.name}
                </p>
              )}
              <p className="text-red-500 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFooter />
    </div>
  );
}