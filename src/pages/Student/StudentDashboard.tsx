// src/pages/student/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'global' | 'gender' | 'hostel';
  gender?: 'boys' | 'girls';
  hostelId?: string;
  isRead: boolean;
  createdAt: string;
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  totalBlocks: number;
  warden: string;
  description: string;
  hostelFee: number;
  mealPlan: string;
}

interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  gender: string;
  department: string;
  year: number;
  dob: string | null;
  contacts: any[];
  fathersName: string | null;
  address: string | null;
  mailId: string;
  physicallyChallenged: boolean;
  registerNo: string;
  passOut: boolean;
  hostel: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications'>('overview');

  // Fetch student profile
  const fetchStudentProfile = async () => {
    try {
      if (!profile?.id) {
        setErrorMsg("Student profile not found");
        return null;
      }

      const res = await api.get(`/students/${profile.id}`);
      if (!res.data.error) {
        setStudentProfile(res.data.data);
        return res.data.data;
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (err: any) {
      console.error("Failed to fetch student profile:", err);
      setErrorMsg("Failed to load student profile");
    }
    return null;
  };

  // Fetch hostel details only if student has a hostel
  const fetchHostelDetails = async (hostelId: string) => {
    try {
      if (!hostelId) {
        console.log("No hostel ID provided, skipping hostel fetch");
        return;
      }

      const res = await api.get(`/hostel/${hostelId}`);
      if (!res.data.error) {
        setHostel(res.data.data);
      } else {
        console.warn("Failed to load hostel information:", res.data.message);
        // Don't set error message for hostel fetch failures as it's not critical
      }
    } catch (err: any) {
      console.error("Failed to fetch hostel details:", err);
      // Don't set error message for hostel fetch failures as it's not critical
    }
  };

  // Fetch notifications
  const fetchNotifications = async (studentProfileId: string) => {
    try {
      const res = await api.get(`/notifications/me/${studentProfileId}`);
      if (!res.data.error) {
        setNotifications(res.data.data);
      } else {
        setErrorMsg("Failed to load notifications");
      }
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setErrorMsg("Failed to load notifications");
    }
  };

  // Load all data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      
      const profileData = await fetchStudentProfile();
      if (profileData) {
        // Only fetch hostel details if student has a hostel assigned
        const fetchPromises = [fetchNotifications(profileData.id)];
        
        if (profileData.hostel) {
          fetchPromises.push(fetchHostelDetails(profileData.hostel));
        } else {
          console.log("Student not associated with any hostel");
        }
        
        await Promise.all(fetchPromises);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setErrorMsg("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'global':
        return 'All Students';
      case 'gender':
        return 'Gender Specific';
      case 'hostel':
        return 'Hostel Specific';
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get year label
  const getYearLabel = (year: number) => {
    const years = ['First', 'Second', 'Third', 'Fourth'];
    return years[year - 1] || `${year}th`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <StudentHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading your dashboard...</p>
          </div>
        </main>
        <StudentFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {studentProfile?.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {getYearLabel(studentProfile?.year || 4)} Year • {studentProfile?.department} Department
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Register No</p>
                <p className="text-lg font-semibold text-gray-900">
                  {studentProfile?.registerNo}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errorMsg}
            </div>
          )}

          {/* Notifications Section - Always visible at top */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {notifications.filter(n => !n.isRead).length} unread
                </span>
              )}
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notifications available</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        notification.type === 'global' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'gender' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <span className="text-blue-600 font-medium">New</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {notifications.length > 5 && (
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  View all notifications
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Notifications
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Information Card */}
              <div className={`${hostel ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Full Name" value={studentProfile?.name} />
                    <InfoItem label="Register Number" value={studentProfile?.registerNo} />
                    <InfoItem label="Department" value={studentProfile?.department} />
                    <InfoItem label="Year" value={getYearLabel(studentProfile?.year || 4)} />
                    <InfoItem label="Gender" value={studentProfile?.gender} />
                    <InfoItem 
                      label="Physically Challenged" 
                      value={studentProfile?.physicallyChallenged ? "Yes" : "No"} 
                    />
                    <InfoItem label="Email" value={studentProfile?.mailId} />
                    <InfoItem label="Father's Name" value={studentProfile?.fathersName || "Not provided"} />
                    <InfoItem 
                      label="Hostel Status" 
                      value={hostel ? "Assigned" : "Not Assigned"} 
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hostel && (
                      <ActionCard 
                        title="Hostel Details" 
                        description="View room and block information"
                        onClick={() => navigate('/student/hostel-details')}
                      />
                    )}
                    <ActionCard 
                      title="Pay Fees" 
                      description="Make hostel payments"
                      onClick={() => navigate('/student/payments')}
                    />
                    {hostel && (
                      <ActionCard 
                        title="Meal Plan" 
                        description="Check mess schedule"
                        onClick={() => navigate('/student/meal-plan')}
                      />
                    )}
                    <ActionCard 
                      title="Feedback" 
                      description="Submit complaints"
                      onClick={() => navigate('/student/feedback')}
                    />
                  </div>
                </div> */}
              </div>

              {/* Hostel Information Sidebar - Only show if student has hostel */}
              {hostel && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Hostel Information</h2>
                    <div className="space-y-3">
                      <InfoItem label="Hostel Name" value={hostel.name} />
                      <InfoItem label="Type" value={hostel.type} />
                      <InfoItem label="Warden" value={hostel.warden} />
                      <InfoItem label="Blocks" value={hostel.totalBlocks.toString()} />
                      <InfoItem label="Fee" value={`₹${hostel.hostelFee}`} />
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm text-gray-700">{hostel.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {notifications.filter(n => !n.isRead).length} unread
                  </span>
                  <button
                    onClick={() => {
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, isRead: true }))
                      );
                    }}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No notifications available</p>
                    <p className="text-gray-400 text-sm mt-1">You're all caught up</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.type === 'global' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'gender' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {notification.isRead ? 'Read' : 'Mark as read'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <StudentFooter />
    </div>
  );
}

// Helper Components
const InfoItem = ({ label, value }: { label: string; value: string | undefined }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value || 'Not provided'}</p>
  </div>
);

const ActionCard = ({ 
  title, 
  description, 
  onClick 
}: { 
  title: string; 
  description: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
  >
    <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
    <p className="text-gray-600 text-xs mt-1">{description}</p>
  </button>
);