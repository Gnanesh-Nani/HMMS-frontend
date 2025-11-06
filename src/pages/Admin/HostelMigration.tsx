import { useEffect, useState } from "react";
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

interface MassMovement {
  id: string;
  hostels: string[];
  isCompleted: boolean;
  date: string;
}

interface PaymentStatus {
  massMovementId: string;
  totalNoOfPayments: number;
  completedNoOfPayments: number;
  overallCompletionPercentage: number;
  hostelsPaymentPercentage: Array<{
    hostelId: string;
    totalNoOfPayments: number;
    completedNoOfPayments: number;
    percentage?: number;
  }>;
}

interface MassMovementWithStatus extends MassMovement {
  paymentStatus?: PaymentStatus;
  hostelDetails?: Hostel[];
}

interface AllocationProgress {
  [hostelId: string]: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  };
}

export default function HostelMigration() {
  const navigate = useNavigate();
  const [massMovements, setMassMovements] = useState<MassMovementWithStatus[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [allocationProgress, setAllocationProgress] = useState<AllocationProgress>({});
  const [isAllocating, setIsAllocating] = useState(false);

  // Fetch all hostels
  const fetchHostels = async () => {
    try {
      const res = await api.get("/hostel");
      if (!res.data.error) {
        setHostels(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch hostels:", err);
      setErrorMsg("Failed to load hostels.");
    }
  };

  // Fetch all mass movements
  const fetchMassMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mass-movement/");
      if (!res.data.error) {
        const movementsWithStatus = await Promise.all(
          res.data.data.map(async (movement: MassMovement) => {
            try {
              // Fetch payment status for each mass movement
              const paymentRes = await api.get(`/mass-movement/payment-status/${movement.id}`);
              const paymentStatus = paymentRes.data.data;
              
              // Calculate percentages for each hostel
              const hostelsWithPercentage = paymentStatus.hostelsPaymentPercentage.map((hostel: any) => ({
                ...hostel,
                percentage: hostel.totalNoOfPayments > 0 
                  ? Math.round((hostel.completedNoOfPayments / hostel.totalNoOfPayments) * 100)
                  : 0
              }));

              // Get hostel details
              const hostelDetails = movement.hostels.map(hostelId => 
                hostels.find(h => h.id === hostelId)
              ).filter(Boolean) as Hostel[];

              return {
                ...movement,
                paymentStatus: {
                  ...paymentStatus,
                  hostelsPaymentPercentage: hostelsWithPercentage
                },
                hostelDetails
              };
            } catch (error) {
              console.error(`Failed to fetch payment status for ${movement.id}:`, error);
              return {
                ...movement,
                hostelDetails: movement.hostels.map(hostelId => 
                  hostels.find(h => h.id === hostelId)
                ).filter(Boolean) as Hostel[]
              };
            }
          })
        );
        setMassMovements(movementsWithStatus);
      }
    } catch (err: any) {
      console.error("Failed to fetch mass movements:", err);
      setErrorMsg("Failed to load migration data.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger allocation for a specific hostel
  const triggerHostelAllocation = async (massMovementId: string, hostelId: string, year: number = 4) => {
    try {
      // Update progress state
      setAllocationProgress(prev => ({
        ...prev,
        [hostelId]: { status: 'loading', message: 'Starting allocation...' }
      }));

      console.log(`🚀 Triggering allocation for hostel ${hostelId} in migration ${massMovementId}`);

      const response = await api.post(
        `/mass-movement/allocate-hostel/${massMovementId}/${hostelId}/${year}`
      );

      if (response.data.success) {
        setAllocationProgress(prev => ({
          ...prev,
          [hostelId]: { 
            status: 'success', 
            message: response.data.message || 'Allocation completed successfully!' 
          }
        }));
        
        // Show success message
        setSuccessMsg(`Allocation completed for ${getHostelName(hostelId)}`);
        
        // Refresh data after successful allocation
        setTimeout(() => {
          fetchMassMovements();
        }, 2000);
        
        return true;
      } else {
        throw new Error(response.data.message || 'Allocation failed');
      }
    } catch (error: any) {
      console.error(`Allocation failed for hostel ${hostelId}:`, error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Allocation failed';
      
      setAllocationProgress(prev => ({
        ...prev,
        [hostelId]: { status: 'error', message: errorMessage }
      }));
      
      setErrorMsg(`Failed to allocate ${getHostelName(hostelId)}: ${errorMessage}`);
      return false;
    }
  };

  // Trigger allocation for all eligible hostels in a migration
  const triggerMassAllocation = async (massMovement: MassMovementWithStatus) => {
    setIsAllocating(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Filter hostels that are eligible for allocation (payment threshold > 75% and not first year)
      const eligibleHostels = massMovement.paymentStatus?.hostelsPaymentPercentage.filter(
        hostel => (hostel.percentage || 0) > 75
      ) || [];

      if (eligibleHostels.length === 0) {
        setErrorMsg("No hostels meet the allocation criteria (payment threshold > 75%).");
        return;
      }

      console.log(`🎯 Starting mass allocation for ${eligibleHostels.length} hostels`);

      // Process hostels sequentially to avoid overloading the server
      for (const hostel of eligibleHostels) {
        const success = await triggerHostelAllocation(massMovement.id, hostel.hostelId, 4);
        
        if (!success) {
          console.warn(`Allocation failed for hostel ${hostel.hostelId}, continuing with others...`);
        }
        
        // Add a small delay between allocations to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSuccessMsg(`Mass allocation completed for ${eligibleHostels.length} hostels!`);
      
    } catch (error: any) {
      console.error("Mass allocation failed:", error);
      setErrorMsg(`Mass allocation failed: ${error.message}`);
    } finally {
      setIsAllocating(false);
    }
  };

  // Clear allocation progress for a migration
  const clearAllocationProgress = (massMovementId: string) => {
    setAllocationProgress(prev => {
      const newProgress = { ...prev };
      Object.keys(newProgress).forEach(key => {
        if (key.startsWith(massMovementId)) {
          delete newProgress[key];
        }
      });
      return newProgress;
    });
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (hostels.length > 0) {
      fetchMassMovements();
    }
  }, [hostels]);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (isCompleted: boolean) => {
    return isCompleted ? (
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        Completed
      </span>
    ) : (
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
        In Progress
      </span>
    );
  };

  const getHostelName = (hostelId: string) => {
    return hostels.find(h => h.id === hostelId)?.name || "Unknown Hostel";
  };

  const getAllocationStatus = (hostelId: string) => {
    return allocationProgress[hostelId] || { status: 'idle' };
  };

  const getAllocationButtonText = (hostelId: string) => {
    const status = getAllocationStatus(hostelId);
    switch (status.status) {
      case 'loading':
        return 'Allocating...';
      case 'success':
        return 'Allocated ✓';
      case 'error':
        return 'Retry Allocation';
      default:
        return 'Allocate';
    }
  };

  const getAllocationButtonColor = (hostelId: string) => {
    const status = getAllocationStatus(hostelId);
    switch (status.status) {
      case 'loading':
        return 'bg-gray-400 cursor-not-allowed';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hostel Migration</h1>
                <p className="text-gray-600 mt-2">Manage and track hostel migration processes</p>
              </div>
              <button
                onClick={() => navigate("/admin/create-migration")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold"
              >
                + Create Migration
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

          {/* Mass Movements List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Migration History</h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading migrations...</p>
              </div>
            ) : massMovements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No migrations found.</p>
                <button
                  onClick={() => navigate("/admin/create-migration")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Create First Migration
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {massMovements.map((movement) => (
                  <div key={movement.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    {/* Movement Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Migration #{movement.id.slice(-6)}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Created: {new Date(movement.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(movement.isCompleted)}
                        <span className="text-sm text-gray-500">
                          {movement.hostels.length} Hostels
                        </span>
                        {!movement.isCompleted && (
                          <button
                            onClick={() => triggerMassAllocation(movement)}
                            disabled={isAllocating}
                            className={`px-4 py-2 text-white rounded-lg font-medium transition duration-200 ${
                              isAllocating 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {isAllocating ? 'Allocating...' : 'Allocate All'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment Status Overview */}
                    {movement.paymentStatus && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-700">Payment Progress</h4>
                          <span className="text-sm text-gray-600">
                            {movement.paymentStatus.completedNoOfPayments} / {movement.paymentStatus.totalNoOfPayments} Completed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getCompletionColor(
                              movement.paymentStatus.overallCompletionPercentage
                            )}`}
                            style={{ width: `${movement.paymentStatus.overallCompletionPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Overall Progress</span>
                          <span>{movement.paymentStatus.overallCompletionPercentage}%</span>
                        </div>
                      </div>
                    )}

                    {/* Hostels List with Individual Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {movement.hostels.map((hostelId, index) => {
                        const hostel = hostels.find(h => h.id === hostelId);
                        const paymentInfo = movement.paymentStatus?.hostelsPaymentPercentage.find(
                          h => h.hostelId === hostelId
                        );
                        const allocationStatus = getAllocationStatus(hostelId);
                        const canAllocate = (paymentInfo?.percentage || 0) >= 75;

                        return (
                          <div key={hostelId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-gray-800">
                                {hostel?.name || "Unknown Hostel"}
                              </h5>
                              {allocationStatus.status === 'loading' && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Type:</span>
                                <span className="capitalize">{hostel?.type}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Warden:</span>
                                <span>{hostel?.warden}</span>
                              </div>
                              {paymentInfo && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payments:</span>
                                    <span>{paymentInfo.completedNoOfPayments}/{paymentInfo.totalNoOfPayments}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${getCompletionColor(paymentInfo.percentage || 0)}`}
                                      style={{ width: `${paymentInfo.percentage || 0}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 text-center">
                                    {paymentInfo.percentage || 0}% Complete
                                  </div>
                                </>
                              )}
                              
                              {/* Allocation Status */}
                              {allocationStatus.message && (
                                <div className={`text-xs p-2 rounded ${
                                  allocationStatus.status === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : allocationStatus.status === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {allocationStatus.message}
                                </div>
                              )}

                              {/* Allocation Button */}
                              {canAllocate && !movement.isCompleted && (
                                <button
                                  onClick={() => triggerHostelAllocation(movement.id, hostelId, 4)}
                                  disabled={allocationStatus.status === 'loading' || isAllocating}
                                  className={`w-full mt-2 px-3 py-2 text-white rounded text-sm font-medium transition duration-200 ${getAllocationButtonColor(hostelId)}`}
                                >
                                  {getAllocationButtonText(hostelId)}
                                </button>
                              )}

                              {!canAllocate && (
                                <div className="text-xs text-gray-500 text-center mt-2">
                                  Needs 75% payments to allocate
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}