import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

interface Student {
  id: string;
  name: string;
  registerNo: string;
}

interface Room {
  id: string;
  blockId: string;
  roomNo: number;
  maxCapacity: number;
  floorNo: number;
  currentStudents: Student[];
}

interface RoomModalProps {
  show: boolean;
  onClose: () => void;
  blockId: string;
  room: Room | null;
  onSuccess: () => void;
}

export default function RoomModal({ show, onClose, blockId, room, onSuccess }: RoomModalProps) {
  const [roomNo, setRoomNo] = useState<number>(0);
  const [maxCapacity, setMaxCapacity] = useState<number>(3);
  const [floorNo, setFloorNo] = useState<number>(0); // Changed default to 0 for ground floor
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room) {
      setRoomNo(room.roomNo);
      setMaxCapacity(room.maxCapacity);
      setFloorNo(room.floorNo);
    } else {
      setRoomNo(0);
      setMaxCapacity(3);
      setFloorNo(0); // Default to ground floor
    }
  }, [room, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (room) {
        // Update existing room
        await api.patch(`/room/${room.id}`, { 
          maxCapacity, 
          floorNo 
        });
      } else {
        // Create new room
        await api.post(`/blocks/${blockId}/rooms`, { 
          roomNo,
          maxCapacity, 
          floorNo 
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const getFloorLabel = (floor: number): string => {
    if (floor === 0) return "Ground Floor";
    if (floor === 1) return "1st Floor";
    if (floor === 2) return "2nd Floor";
    if (floor === 3) return "3rd Floor";
    return `${floor}th Floor`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {room ? "Edit Room" : "Add Room"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!room && (
            <div>
              <label className="block font-medium mb-2">Room Number</label>
              <input
                type="number"
                min="1"
                value={roomNo}
                onChange={(e) => setRoomNo(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block font-medium mb-2">Floor Number</label>
            <select
              value={floorNo}
              onChange={(e) => setFloorNo(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>Ground Floor (0)</option>
              <option value={1}>1st Floor</option>
              <option value={2}>2nd Floor</option>
              <option value={3}>3rd Floor</option>
              <option value={4}>4th Floor</option>
              <option value={5}>5th Floor</option>
              <option value={6}>6th Floor</option>
              <option value={7}>7th Floor</option>
              <option value={8}>8th Floor</option>
              <option value={9}>9th Floor</option>
              <option value={10}>10th Floor</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Selected: {getFloorLabel(floorNo)}
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">Maximum Capacity</label>
            <select
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={1}>1 Student</option>
              <option value={2}>2 Students</option>
              <option value={3}>3 Students</option>
              <option value={4}>4 Students</option>
            </select>
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
              {loading ? "Saving..." : (room ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}