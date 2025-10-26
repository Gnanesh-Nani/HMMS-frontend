import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import RoomModal from "../../components/RoomModal";

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

export default function AdminRoomPage() {
  const { blockId, hostelId } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(false);
  const [hostelLoading, setHostelLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; roomId: string; roomNo: number } | null>(null);
  
  // Filter states
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [searchRoomNo, setSearchRoomNo] = useState<string>("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/blocks/${blockId}/rooms`);
      if (!res.data.error) {
        setRooms(res.data.data);
        setFilteredRooms(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch rooms");
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

  const fetchBlock = async () => {
    if (!hostelId || !blockId) return;
    
    try {
      setBlockLoading(true);
      const res = await api.get(`/hostel/${hostelId}/block/${blockId}`);
      if (!res.data.error) {
        setBlock(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch block details:", err);
    } finally {
      setBlockLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = rooms;

    // Filter by floor
    if (selectedFloor !== "all") {
      filtered = filtered.filter(room => room.floorNo === parseInt(selectedFloor));
    }

    // Filter by room number search
    if (searchRoomNo) {
      filtered = filtered.filter(room => 
        room.roomNo.toString().includes(searchRoomNo)
      );
    }

    setFilteredRooms(filtered);
  }, [rooms, selectedFloor, searchRoomNo]);

  const showDeleteConfirm = (room: Room) => {
    setDeleteConfirm({
      show: true,
      roomId: room.id,
      roomNo: room.roomNo
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await api.delete(`/room/${deleteConfirm.roomId}`);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete room");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get unique floors for filter dropdown
  const uniqueFloors = Array.from(new Set(rooms.map(room => room.floorNo))).sort((a, b) => a - b);

  const getFloorLabel = (floor: number): string => {
    if (floor === 0) return "Ground Floor";
    if (floor === 1) return "1st Floor";
    if (floor === 2) return "2nd Floor";
    if (floor === 3) return "3rd Floor";
    return `${floor}th Floor`;
  };

  useEffect(() => {
    if (blockId && hostelId) {
      fetchRooms();
      fetchHostel();
      fetchBlock();
    }
  }, [blockId, hostelId]);

  const isOverlayActive = showModal || deleteConfirm?.show;

  return (
    <div className={`min-h-screen flex flex-col ${isOverlayActive ? "backdrop-blur-sm" : ""}`}>
      <AdminHeader />
      <main className={`flex-grow bg-gray-50 p-6 transition-all duration-300 ${isOverlayActive ? "blur-sm" : ""}`}>
        <div className="max-w-6xl mx-auto">
          {/* Hostel and Block Information */}
          <div className="mb-8">
            {(hostelLoading || blockLoading) ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-56"></div>
              </div>
            ) : (hostel && block) ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {hostel.name} - Block {block.name}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="capitalize"> {hostel.type} Hostel</span>
                      <span> Warden: {hostel.warden || "Not assigned"}</span>
                      <span> Total Floors: {block.totalFloors}</span>
                      <span> Total Rooms: {rooms.length}</span>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Room Management</h1>
                <p className="text-gray-600">Loading hostel and block information...</p>
              </div>
            )}
          </div>

          {/* Header with Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Rooms</h2>
              <p className="text-gray-600 text-sm">
                Manage rooms for Block {block?.name}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search by Room Number */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search room number..."
                  value={searchRoomNo}
                  onChange={(e) => setSearchRoomNo(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchRoomNo && (
                  <button
                    onClick={() => setSearchRoomNo("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter by Floor */}
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Floors</option>
                {uniqueFloors.map(floor => (
                  <option key={floor} value={floor}>
                    {getFloorLabel(floor)}
                  </option>
                ))}
              </select>

              {/* Add Room Button */}
              <button
                onClick={() => {
                  setEditRoom(null);
                  setShowModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
              >
                + Add Room
              </button>
            </div>
          </div>

          {/* Filter Summary */}
          {(selectedFloor !== "all" || searchRoomNo) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
                <span className="font-medium">Filters applied:</span>
                {selectedFloor !== "all" && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full">
                    Floor: {getFloorLabel(parseInt(selectedFloor))}
                  </span>
                )}
                {searchRoomNo && (
                  <span className="bg-blue-100 px-2 py-1 rounded-full">
                    Room No: {searchRoomNo}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedFloor("all");
                    setSearchRoomNo("");
                  }}
                  className="text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {loading && <p className="text-gray-500 text-center">Loading rooms...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500 flex flex-col justify-between hover:shadow-xl transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800">
                      Room {room.roomNo}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.currentStudents.length >= room.maxCapacity 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {room.currentStudents.length}/{room.maxCapacity}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Floor:</span> {getFloorLabel(room.floorNo)}
                    </p>
                    <p><span className="font-semibold">Capacity:</span> {room.maxCapacity} students</p>
                    
                    {room.currentStudents.length > 0 ? (
                      <div>
                        <p className="font-semibold mb-1">Current Students:</p>
                        <ul className="space-y-1">
                          {room.currentStudents.map((student) => (
                            <li key={student.id} className="text-xs bg-gray-100 p-1 rounded">
                              {student.name} ({student.registerNo})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No students assigned</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setEditRoom(room);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => showDeleteConfirm(room)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && rooms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow border">
              <div className="text-6xl mb-4">🚪</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Rooms Found
              </h3>
              <p className="text-gray-600 mb-4">
                {block ? `Get started by creating the first room for Block ${block.name}` : "Get started by creating the first room"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Create First Room
              </button>
            </div>
          )}

          {!loading && rooms.length > 0 && filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No rooms match your filters.</p>
              <button
                onClick={() => {
                  setSelectedFloor("all");
                  setSearchRoomNo("");
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Room Modal */}
      <RoomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        blockId={blockId!}
        room={editRoom}
        onSuccess={() => {
          setShowModal(false);
          fetchRooms();
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
                Are you sure you want to delete this room?
              </p>
              <p className="font-semibold text-lg text-gray-800">
                "Room {deleteConfirm.roomNo}"
              </p>
              {hostel && block && (
                <p className="text-gray-600 text-sm mt-1">
                  from {hostel.name} - Block {block.name}
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