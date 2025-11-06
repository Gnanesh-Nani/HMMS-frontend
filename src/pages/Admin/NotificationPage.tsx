// src/pages/admin/Notifications.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

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
}

interface CreateNotificationForm {
  title: string;
  message: string;
  type: 'global' | 'gender' | 'hostel';
  gender?: 'boys' | 'girls';
  hostelId?: string;
}

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState<CreateNotificationForm>({
    title: "",
    message: "",
    type: "global",
    gender: undefined,
    hostelId: undefined
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      if (!res.data.error) {
        setNotifications(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setErrorMsg("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch hostels for dropdown
  const fetchHostels = async () => {
    try {
      const res = await api.get("/hostel");
      if (!res.data.error) {
        setHostels(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch hostels:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchHostels();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? undefined : value
    }));
  };

  // Create new notification
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare payload based on notification type
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type
      };

      if (formData.type === 'gender' && formData.gender) {
        payload.gender = formData.gender;
      }

      if (formData.type === 'hostel' && formData.hostelId) {
        payload.hostelId = formData.hostelId;
      }

      const res = await api.post("/notifications", payload);
      
      if (!res.data.error) {
        setSuccessMsg("Notification created successfully!");
        setShowCreateForm(false);
        setFormData({
          title: "",
          message: "",
          type: "global",
          gender: undefined,
          hostelId: undefined
        });
        fetchNotifications();
      } else {
        throw new Error(res.data.message);
      }
    } catch (err: any) {
      console.error("Failed to create notification:", err);
      setErrorMsg(err.response?.data?.message || "Failed to create notification.");
    } finally {
      setLoading(false);
    }
  };

  // Update notification
  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;

    try {
      setLoading(true);
      const res = await api.patch(`/notifications/${editingNotification.id}`, {
        title: formData.title,
        message: formData.message
      });

      if (!res.data.error) {
        setSuccessMsg("Notification updated successfully!");
        setEditingNotification(null);
        setFormData({
          title: "",
          message: "",
          type: "global",
          gender: undefined,
          hostelId: undefined
        });
        fetchNotifications();
      } else {
        throw new Error(res.data.message);
      }
    } catch (err: any) {
      console.error("Failed to update notification:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update notification.");
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const res = await api.delete(`/notifications/${id}`);
      if (!res.data.error) {
        setSuccessMsg("Notification deleted successfully!");
        fetchNotifications();
      } else {
        throw new Error(res.data.message);
      }
    } catch (err: any) {
      console.error("Failed to delete notification:", err);
      setErrorMsg(err.response?.data?.message || "Failed to delete notification.");
    }
  };

  // Start editing a notification
  const startEditing = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      gender: notification.gender,
      hostelId: notification.hostelId
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      message: "",
      type: "global",
      gender: undefined,
      hostelId: undefined
    });
  };

  // Get notification type badge
  const getTypeBadge = (type: string) => {
    const styles = {
      global: "bg-blue-100 text-blue-800",
      gender: "bg-purple-100 text-purple-800",
      hostel: "bg-green-100 text-green-800"
    };

    const labels = {
      global: "Global",
      gender: "Gender",
      hostel: "Hostel"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  // Get target audience
  const getTargetAudience = (notification: Notification) => {
    switch (notification.type) {
      case 'global':
        return "All Students";
      case 'gender':
        return `${notification.gender === 'boys' ? 'Boys' : 'Girls'} Hostels`;
      case 'hostel':
        const hostel = hostels.find(h => h.id === notification.hostelId);
        return hostel ? hostel.name : "Specific Hostel";
      default:
        return "Unknown";
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                <p className="text-gray-600 mt-2">Manage and send notifications to students</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold"
              >
                + Create Notification
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

          {/* Create/Edit Form */}
          {(showCreateForm || editingNotification) && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </h2>
              
              <form onSubmit={editingNotification ? handleUpdateNotification : handleCreateNotification}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter notification title"
                    />
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter notification message"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      disabled={!!editingNotification}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="global">Global (All Students)</option>
                      <option value="gender">Gender Specific</option>
                      <option value="hostel">Hostel Specific</option>
                    </select>
                  </div>

                  {/* Gender (only for gender type) */}
                  {formData.type === 'gender' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        required={formData.type === 'gender'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                      </select>
                    </div>
                  )}

                  {/* Hostel (only for hostel type) */}
                  {formData.type === 'hostel' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hostel *
                      </label>
                      <select
                        name="hostelId"
                        value={formData.hostelId || ''}
                        onChange={handleInputChange}
                        required={formData.type === 'hostel'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Hostel</option>
                        {hostels.map(hostel => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={editingNotification ? cancelEditing : () => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                  >
                    {loading ? 'Saving...' : (editingNotification ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Notifications</h2>

            {loading && !showCreateForm && !editingNotification ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No notifications found.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Create First Notification
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {notification.title}
                          </h3>
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Target: {getTargetAudience(notification)}</span>
                          <span>•</span>
                          <span>Created: {formatDate(notification.createdAt)}</span>
                          <span>•</span>
                          <span className={notification.isRead ? "text-green-600" : "text-orange-600"}>
                            {notification.isRead ? "Read" : "Unread"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditing(notification)}
                          className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition duration-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
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