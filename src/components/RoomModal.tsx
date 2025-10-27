import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

interface Student {
  id: string;
  name: string;
  department?: string;
  year?: number;
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

export default function RoomModal({
  show,
  onClose,
  blockId,
  room,
  onSuccess,
}: RoomModalProps) {
  const [roomNo, setRoomNo] = useState<number>(0);
  const [maxCapacity, setMaxCapacity] = useState<number>(3);
  const [floorNo, setFloorNo] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // New states
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Load initial room data when editing
  useEffect(() => {
    if (room) {
      setRoomNo(room.roomNo);
      setMaxCapacity(room.maxCapacity);
      setFloorNo(room.floorNo);
    } else {
      setRoomNo(0);
      setMaxCapacity(3);
      setFloorNo(0);
    }
  }, [room, show]);

  // Fetch all students when the modal opens in edit mode
  useEffect(() => {
    if (show && room) fetchStudents();
  }, [show, room]);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students/");
      if (!res.data.error) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredStudents([]);
      return;
    }
    const term = search.toLowerCase();
    const result = students.filter((s) =>
      s.name.toLowerCase().includes(term)
    );
    setFilteredStudents(result);
  }, [search, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (room) {
        await api.patch(`/room/${room.id}`, { maxCapacity, floorNo });
      } else {
        await api.post(`/blocks/${blockId}/rooms`, {
          roomNo,
          maxCapacity,
          floorNo,
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (studentId: string) => {
    if (!room) return;
    setAllocating(studentId);
    try {
      await api.patch(`/room/${room.id}/allocate/${studentId}`);
      await onSuccess(); // Refresh room list after allocation
      await fetchStudents();
      alert("Student allocated successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to allocate student");
    } finally {
      setAllocating(null);
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!room) return;
    setRemoving(studentId);
    try {
      await api.patch(`/room/${room.id}/remove/${studentId}`);
      await onSuccess(); // Refresh room list
      alert("Student removed successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove student");
    } finally {
      setRemoving(null);
    }
  };

  const getFloorLabel = (floor: number): string => {
    if (floor === 0) return "Ground Floor";
    if (floor === 1) return "1st Floor";
    if (floor === 2) return "2nd Floor";
    if (floor === 3) return "3rd Floor";
    return `${floor}th Floor`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {room ? `Edit Room ${room.roomNo}` : "Add Room"}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-medium mb-2">Floor Number</label>
            <select
              value={floorNo}
              onChange={(e) => setFloorNo(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              {[...Array(11).keys()].map((n) => (
                <option key={n} value={n}>
                  {getFloorLabel(n)} ({n})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Maximum Capacity</label>
            <select
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              {[1, 2, 3, 4].map((cap) => (
                <option key={cap} value={cap}>
                  {cap} Student{cap > 1 && "s"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
              disabled={loading}
            >
              {loading ? "Saving..." : room ? "Update" : "Create"}
            </button>
          </div>
        </form>

        {/* Only show students when editing */}
        {room && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Students in this room</h3>

            {room.currentStudents.length === 0 ? (
              <p className="text-gray-500">No students assigned yet.</p>
            ) : (
              <ul className="space-y-2">
                {room.currentStudents.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
                  >
                    <span>
                      {s.name}{" "}
                      {s.department && (
                        <span className="text-sm text-gray-500">
                          ({s.department.toUpperCase()} - Year {s.year})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleRemove(s.id)}
                      disabled={removing === s.id}
                      className="text-red-600 hover:underline disabled:text-gray-400"
                    >
                      {removing === s.id ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
console.log("Deleting student with ID:", id);

            {/* Add new student */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Add a student</h4>
              <input
                type="text"
                placeholder="Search student by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500"
              />
              {filteredStudents.length > 0 && (
                <ul className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                  {filteredStudents.map((s) => (
                    <li
                      key={s.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-50"
                    >
                      <span>
                        {s.name}{" "}
                        {s.department && (
                          <span className="text-sm text-gray-500">
                            ({s.department.toUpperCase()} - Year {s.year})
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleAllocate(s.id)}
                        disabled={allocating === s.id}
                        className="text-blue-600 hover:underline disabled:text-gray-400"
                      >
                        {allocating === s.id ? "Adding..." : "Add"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
