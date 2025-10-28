import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import type { Hostel } from "./HostelModal";

interface Student {
  id: string;
  name: string;
  department?: string;
  year?: number;
  registerNo?: string;
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
  hostelId: string;
  show: boolean;
  onClose: () => void;
  blockId: string;
  room: Room | null;
  onSuccess: () => void;
}

export default function RoomModal({
  hostelId,
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

  // Student CRUD states
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [fetchingStudents, setFetchingStudents] = useState(false);

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
    if (show && room) {
      fetchStudents();
    }
  }, [show, room]);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      const res = await api.get("/students/");
      if (!res.data.error) {
        setStudents(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch students:", err);
      alert("Failed to load students list");
    } finally {
      setFetchingStudents(false);
    }
  };

  // Filter students based on search
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredStudents([]);
      return;
    }
    const term = search.toLowerCase();
    const result = students.filter((s) =>
      s.name.toLowerCase().includes(term) ||
      (s.registerNo && s.registerNo.toLowerCase().includes(term))
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
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (studentId: string) => {
    if (!room || !hostelId) return;
    setAllocating(studentId);
    try {
      // FIXED: Send hostelId in the request body
      await api.patch(`/room/${room.id}/allocate/${studentId}`, {
        hostelId: hostelId // Correct field name as per API
      });
      onSuccess(); // Refresh room list after allocation
      setSearch(""); // Clear search after successful allocation
      setFilteredStudents([]);
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
      console.log("Removing student with ID:", studentId, "from room:", room.id);
      await api.patch(`/room/${room.id}/remove/${studentId}`);
      onSuccess(); // Refresh room list
      alert("Student removed successfully");
    } catch (err: any) {
      console.error("Remove error:", err);
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

  // Helper function to safely get student info
  const getStudentInfo = (student: any): Student => {
    return {
      id: student.id || student._id,
      name: student.name || 'Unknown',
      department: student.department || 'N/A',
      year: student.year || student.currentYear || 1,
      registerNo: student.registerNo || student.userId?.registerNo || 'N/A'
    };
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 p-4 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center py-8">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-hidden flex">
          {/* Left Side - Room Form */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
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
                  className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Saving..." : room ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Student Management (Only show when editing) */}
          {room && (
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Student Management</h3>

              {/* Current Students */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Current Students</h4>
                {room.currentStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-white p-3 rounded-lg border">
                    No students assigned to this room yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {room.currentStudents.map((student) => {
                      const studentInfo = getStudentInfo(student);
                      return (
                        <li
                          key={studentInfo.id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <span className="font-medium block text-gray-800">
                              {studentInfo.name}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              <span>Dept: {studentInfo.department}</span>
                              <span className="ml-3">Year: {studentInfo.year}</span>
                              {studentInfo.registerNo && (
                                <span className="ml-3">Reg: {studentInfo.registerNo}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(studentInfo.id)}
                            disabled={removing === studentInfo.id}
                            className="ml-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 text-sm whitespace-nowrap transition-colors"
                          >
                            {removing === studentInfo.id ? "Removing..." : "Remove"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Capacity Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Capacity: {room.currentStudents.length} / {room.maxCapacity} students
                </p>
                {room.currentStudents.length >= room.maxCapacity && (
                  <p className="text-sm text-red-600 font-medium mt-1">
                    Room is at full capacity. Cannot add more students.
                  </p>
                )}
              </div>

              {/* Add Student Section - Only show if room is not full */}
              {room.currentStudents.length < room.maxCapacity && (
                <div className="mt-4">
                  <h4 className="font-medium mb-3 text-gray-700">Add Student to Room</h4>
                  
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search students by name or register number..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      disabled={fetchingStudents}
                    />
                    {fetchingStudents && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {search && filteredStudents.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                      <div className="bg-gray-50 px-3 py-2 border-b">
                        <p className="text-xs text-gray-600 font-medium">
                          Found {filteredStudents.length} student(s)
                        </p>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => {
                          const studentInfo = getStudentInfo(student);
                          const isAlreadyInRoom = room.currentStudents.some(
                            s => getStudentInfo(s).id === studentInfo.id
                          );
                          
                          return (
                            <li
                              key={studentInfo.id}
                              className="p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">
                                    {studentInfo.name}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    <span>Reg: {studentInfo.registerNo}</span>
                                    <span className="ml-3">Dept: {studentInfo.department}</span>
                                    <span className="ml-3">Year: {studentInfo.year}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAllocate(studentInfo.id)}
                                  disabled={allocating === studentInfo.id || isAlreadyInRoom}
                                  className={`ml-3 px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
                                    isAlreadyInRoom
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : allocating === studentInfo.id
                                      ? 'bg-blue-400 text-white cursor-not-allowed'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                >
                                  {isAlreadyInRoom 
                                    ? "Already in room" 
                                    : allocating === studentInfo.id 
                                      ? "Adding..." 
                                      : "Add to Room"
                                  }
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {search && filteredStudents.length === 0 && !fetchingStudents && (
                    <div className="text-center py-4 bg-white rounded-lg border">
                      <p className="text-gray-500 text-sm">No students found matching your search.</p>
                    </div>
                  )}

                  {!search && (
                    <div className="text-center py-4 bg-white rounded-lg border">
                      <p className="text-gray-500 text-sm">
                        Start typing to search for students by name or register number.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}