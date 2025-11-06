import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

interface Hostel {
  id: string;
  name: string;
  type: string;
  totalBlocks: number;
  warden: string;
  description: string;
  hostelFee: number;
}

interface MigrationSlot {
  id: string | null;
  name: string;
  description: string;
  fee?: number;
  originalName: string;
}

export default function CreateMigrationPage() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // 4 slots for migration flow with proper typing
  const [slots, setSlots] = useState<MigrationSlot[]>([
    { id: null, name: "Hostel 1", description: "Students will move to:", originalName: "Hostel 1" },
    { id: null, name: "Hostel 2", description: "Students will move to:", originalName: "Hostel 2" },
    { id: null, name: "Hostel 3", description: "Students will move to:", originalName: "Hostel 3" },
    { id: null, name: "Pass Out Hostel", description: "Students will become:", originalName: "Pass Out Hostel" }
  ]);

  const [draggedHostel, setDraggedHostel] = useState<Hostel | null>(null);

  // Fetch all hostels
  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hostel");
      if (!res.data.error) {
        setHostels(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch hostels:", err);
      setErrorMsg("Failed to load hostels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, hostel: Hostel) => {
    setDraggedHostel(hostel);
    e.dataTransfer.setData("text/plain", hostel.id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    if (!draggedHostel) return;

    // Check if hostel is already in another slot
    const isAlreadyUsed = slots.some(slot => slot.id === draggedHostel.id);
    if (isAlreadyUsed) {
      setErrorMsg(`${draggedHostel.name} is already assigned to a slot. Each hostel can only be used once.`);
      return;
    }

    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotIndex] = {
        id: draggedHostel.id,
        name: draggedHostel.name,
        description: slotIndex === 3 ? "Students will become:" : "Students will move to:",
        fee: draggedHostel.hostelFee,
        originalName: newSlots[slotIndex].originalName
      };
      return newSlots;
    });

    setDraggedHostel(null);
    setErrorMsg("");
  };

  // Clear a specific slot
  const clearSlot = (slotIndex: number) => {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotIndex] = {
        id: null,
        name: slotIndex === 3 ? "Pass Out Hostel" : `Hostel ${slotIndex + 1}`,
        description: slotIndex === 3 ? "Students will become:" : "Students will move to:",
        originalName: newSlots[slotIndex].originalName
      };
      return newSlots;
    });
  };

  // Clear all slots
  const clearAllSlots = () => {
    setSlots([
      { id: null, name: "Hostel 1", description: "Students will move to:", originalName: "Hostel 1" },
      { id: null, name: "Hostel 2", description: "Students will move to:", originalName: "Hostel 2" },
      { id: null, name: "Hostel 3", description: "Students will move to:", originalName: "Hostel 3" },
      { id: null, name: "Pass Out Hostel", description: "Students will become:", originalName: "Pass Out Hostel" }
    ]);
  };

  // Handle create migration
  const createMassMovement = async () => {
    // Validate that all 4 slots are filled
    if (slots.some(slot => slot.id === null)) {
      setErrorMsg("Please assign hostels to all 4 slots to create migration.");
      return;
    }

    const selectedIds = slots.map(slot => slot.id).filter(Boolean) as string[];
    
    // Validate no duplicate hostels
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== 4) {
      setErrorMsg("Please select 4 different hostels for migration.");
      return;
    }

    try {
      setCreating(true);
      setErrorMsg("");
      const res = await api.post("/mass-movement/", {
        hostels: selectedIds
      });

      if (!res.data.error) {
        setSuccessMsg("Hostel migration created successfully! Students will be notified about their new hostel assignments and payment requirements.");
        setTimeout(() => {
          navigate("/admin/hostel-migration");
        }, 3000);
      } else {
        setErrorMsg(res.data.message || "Failed to create migration.");
      }
    } catch (err: any) {
      console.error("Failed to create mass movement:", err);
      setErrorMsg(err.response?.data?.message || "Failed to create migration.");
    } finally {
      setCreating(false);
    }
  };

  // Get available hostels (not already selected in slots)
  const getAvailableHostels = () => {
    const selectedIds = slots.map(slot => slot.id).filter(Boolean);
    return hostels.filter(hostel => !selectedIds.includes(hostel.id));
  };

  const availableHostels = getAvailableHostels();
  const allSlotsFilled = slots.every(slot => slot.id !== null);
  const noDuplicates = new Set(slots.map(slot => slot.id).filter(Boolean)).size === 4;

  // Get next hostel name for movement description
  const getNextHostelInfo = (slotIndex: number) => {
    if (slotIndex === 3) {
      return { name: "Pass Outs", fee: null };
    }
    const nextSlot = slots[slotIndex + 1];
    if (nextSlot.id) {
      return { name: nextSlot.name, fee: nextSlot.fee };
    }
    return { name: `Hostel ${slotIndex + 2}`, fee: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AdminHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading hostels...</p>
          </div>
        </main>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">Create Hostel Migration</h1>
                <p className="text-gray-600 mt-2">
                  Set up the annual hostel migration flow by assigning hostels to each position
                </p>
              </div>
              <button
                onClick={() => navigate("/hostel-migration")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold whitespace-nowrap"
              >
                ← Back to Migrations
              </button>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMsg}
            </div>
          )}

          {/* Migration Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">How Migration Works</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h3 className="font-semibold mb-2">Migration Flow:</h3>
                <ul className="space-y-1">
                  <li>• Students from <strong>Hostel 1</strong> → Move to <strong>Hostel 2</strong></li>
                  <li>• Students from <strong>Hostel 2</strong> → Move to <strong>Hostel 3</strong></li>
                  <li>• Students from <strong>Hostel 3</strong> → Move to <strong>Hostel 4</strong></li>
                  <li>• Students from <strong>Hostel 4</strong> → Become <strong>Pass Outs</strong></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Payment Information:</h3>
                <ul className="space-y-1">
                  <li>• Students will be automatically unassigned from their current hostels</li>
                  <li>• Updated payment amounts will be calculated based on new hostel fees</li>
                  <li>• Payment requirement notifications will be sent to all assigned students</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Migration Flow Visualization */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Migration Flow</h2>
              <button
                onClick={clearAllSlots}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Clear All
              </button>
            </div>

            {/* Flow Slots */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative">
              {slots.map((slot, index) => {
                const nextHostelInfo = getNextHostelInfo(index);
                
                return (
                  <div key={index} className="relative">
                    <div
                      className={`border-2 rounded-xl p-4 min-h-[180px] transition-all duration-200 ${
                        slot.id 
                          ? "border-green-500 bg-green-50" 
                          : "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{slot.originalName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                        </div>
                        {slot.id && (
                          <button
                            onClick={() => clearSlot(index)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {slot.id ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="font-medium text-gray-900 text-center mb-2">
                              Current: {slot.name}
                            </div>
                            {/* {slot.fee && (
                              <div className="text-sm text-green-600 font-semibold text-center">
                                Current Fee: ₹{slot.fee.toLocaleString()}
                              </div>
                            )} */}
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="font-medium text-blue-900 text-center mb-1">
                              {index === 3 ? "Becomes:" : "Moves to:"}
                            </div>
                            <div className="text-sm font-semibold text-blue-800 text-center">
                              {nextHostelInfo.name}
                            </div>
                            {nextHostelInfo.fee && (
                              <div className="text-xs text-blue-600 font-medium text-center mt-1">
                                Pays: ₹{nextHostelInfo.fee.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm">Drag hostel here</p>
                          <p className="text-xs mt-1">for {slot.originalName}</p>
                        </div>
                      )}
                    </div>

                    {/* Arrow between slots */}
                    {index < 3 && (
                      <div className="hidden md:flex absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Validation Status */}
            <div className={`p-4 rounded-lg ${
              !allSlotsFilled ? "bg-yellow-50 border border-yellow-200" :
              allSlotsFilled && !noDuplicates ? "bg-red-50 border border-red-200" :
              "bg-green-50 border border-green-200"
            }`}>
              <p className={`text-sm font-medium ${
                !allSlotsFilled ? "text-yellow-700" :
                allSlotsFilled && !noDuplicates ? "text-red-700" :
                "text-green-700"
              }`}>
                {!allSlotsFilled 
                  ? "🟡 Assign hostels to all 4 slots to continue"
                  : allSlotsFilled && !noDuplicates 
                  ? "🔴 Remove duplicate hostels - each hostel must be unique"
                  : "🟢 Ready to create migration! All slots are properly filled"
                }
              </p>
            </div>
          </div>

          {/* Available Hostels Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Available Hostels {availableHostels.length > 0 && `(${availableHostels.length})`}
            </h2>
            <p className="text-gray-600 mb-4">
              Drag and drop hostels from this list to the migration slots above
            </p>
            
            {availableHostels.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No hostels available</p>
                <p className="text-sm text-gray-400 mt-1">
                  All hostels have been assigned to migration slots
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableHostels.map((hostel) => (
                  <div
                    key={hostel.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, hostel)}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200 cursor-move hover:border-blue-300 active:scale-95"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">{hostel.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 capitalize">
                        {hostel.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hostel.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <div>
                        <span className="font-medium">Warden:</span>
                        <div className="text-gray-700">{hostel.warden}</div>
                      </div>
                      <div>
                        <span className="font-medium">Blocks:</span>
                        <div className="text-gray-700">{hostel.totalBlocks}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">
                        Fee: ₹{hostel.hostelFee.toLocaleString()}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">Drag me →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={createMassMovement}
              disabled={creating || !allSlotsFilled || !noDuplicates}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg font-semibold shadow-lg min-w-[200px]"
            >
              {creating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating...
                </div>
              ) : (
                `Create Migration Flow`
              )}
            </button>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}