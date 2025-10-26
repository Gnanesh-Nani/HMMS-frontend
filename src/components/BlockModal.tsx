import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

interface Block {
  id: string;
  name: string;
  totalFloors: number;
  hostelId: string;
}

interface BlockModalProps {
  show: boolean;
  onClose: () => void;
  hostelId: string;
  block: Block | null;
  onSuccess: () => void;
}

export default function BlockModal({ show, onClose, hostelId, block, onSuccess }: BlockModalProps) {
  const [name, setName] = useState("");
  const [totalFloors, setTotalFloors] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (block) {
      setName(block.name);
      setTotalFloors(block.totalFloors);
    } else {
      setName("");
      setTotalFloors(1);
    }
  }, [block, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (block) {
        await api.patch(`/hostel/${hostelId}/block/${block.id}`, { name, totalFloors });
      } else {
        await api.post(`/hostel/${hostelId}/block`, { name, totalFloors });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save block");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {block ? "Edit Block" : "Add Block"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Block Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Total Floors</label>
            <input
              type="number"
              min="1"
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : (block ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}