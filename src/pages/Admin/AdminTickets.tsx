import { useEffect, useState, useRef } from 'react';
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";
import type { Ticket, Message, StudentProfile } from '../../types/ticket';
import { useAuth } from '../../context/AuthContext';

export default function AdminTickets() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // This endpoint should be created in backend to get all tickets
      const res = await api.get("/ticket");
      if (!res.data.error) {
        setTickets(res.data.data);
        setFilteredTickets(res.data.data);
      } else {
        setErrorMsg(res.data.message || "Failed to fetch tickets.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to fetch tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = tickets;

    if (statusFilter) {
      filtered = filtered.filter(ticket => 
        ticket.status === statusFilter
      );
    }
    if (typeFilter) {
      filtered = filtered.filter(ticket => 
        ticket.type === typeFilter
      );
    }
    if (searchSubject) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchSubject.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [statusFilter, typeFilter, searchSubject, tickets]);

  // Fetch ticket details and open modal
  const handleViewTicket = async (ticket: Ticket) => {
    try {
      setLoading(true);
      const res = await api.get(`/ticket/${ticket.id}`);
      if (!res.data.error) {
        setSelectedTicket(res.data.data);
        setIsDetailsModalOpen(true);
      } else {
        setErrorMsg(res.data.message || "Failed to fetch ticket details.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to fetch ticket details.");
    } finally {
      setLoading(false);
    }
  };

  // Send message in ticket
  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    try {
      setLoading(true);
      const res = await api.post(`/ticket/send-message/${selectedTicket.id}`, {
        senderId: profile?.id, // This should come from admin auth context
        message: newMessage.trim()
      });
      
      if (!res.data.error) {
        // Refresh the ticket to get updated messages
        const ticketRes = await api.get(`/ticket/${selectedTicket.id}`);
        if (!ticketRes.data.error) {
          setSelectedTicket(ticketRes.data.data);
          setNewMessage("");
        }
      } else {
        setErrorMsg(res.data.message || "Failed to send message.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      setLoading(true);
      const res = await api.patch(`/ticket/close/${ticketId}`);
      if (!res.data.error) {
        setSuccessMsg("Ticket closed successfully!");
        
        // Update the ticket in the list
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
        ));
        
        // Update selected ticket if it's the one being closed
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status: 'closed' } : null);
        }
        
      } else {
        setErrorMsg(res.data.message || "Failed to close ticket.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to close ticket.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.conversation]);

  // Helper functions for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'feed-back': return 'bg-blue-100 text-blue-800';
      case 'room-change': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudentInfo = (studentProfile: string | StudentProfile) => {
    if (typeof studentProfile === 'string') {
      return { name: 'Loading...', department: 'N/A', year: 'N/A' };
    }
    
    return {
      name: studentProfile.name || 'Unknown Student',
      department: studentProfile.department || 'N/A',
      year: studentProfile.year?.toString() || 'N/A'
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">All Support Tickets</h1>
              <p className="text-gray-600 mt-1">Manage student support requests and conversations</p>
            </div>

            {/* Messages */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{successMsg}</p>
              </div>
            )}

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Search by subject..."
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="feed-back">Feedback</option>
                  <option value="complaint">Complaint</option>
                  <option value="room-change">Room Change</option>
                </select>
                
                <button
                  onClick={fetchTickets}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="p-6">
              {loading && tickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-600">No tickets match your current filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => {
                        const studentInfo = getStudentInfo(ticket.studentProfile);
                        return (
                          <tr key={ticket.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{studentInfo.name}</p>
                                <p className="text-sm text-gray-600">{studentInfo.department} - Year {studentInfo.year}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{ticket.subject}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(ticket.type)}`}>
                                {ticket.type.replace('-', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(ticket.raisedOn).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewTicket(ticket)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  View
                                </button>
                                {ticket.status !== 'closed' && (
                                  <button
                                    onClick={() => handleCloseTicket(ticket.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                  >
                                    Close
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Details Modal */}
      {isDetailsModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedTicket.type)}`}>
                    {selectedTicket.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Student: {getStudentInfo(selectedTicket.studentProfile).name} • 
                  Created: {new Date(selectedTicket.raisedOn).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Close Ticket
                  </button>
                )}
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {typeof selectedTicket.conversation !== 'string' && 
                 selectedTicket.conversation.messages.map((msg: Message) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender === 'admin-user-id' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'admin-user-id'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'admin-user-id' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.sentAt).toLocaleString()}
                        {msg.sender === 'admin-user-id' ? ' (You)' : ' (Student)'}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {typeof selectedTicket.conversation === 'string' && (
                <div className="text-center text-gray-500 py-8">
                  Loading messages...
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedTicket.status !== 'closed' && (
              <div className="border-t bg-white p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
            
            {selectedTicket.status === 'closed' && (
              <div className="border-t bg-gray-100 p-4 text-center text-gray-600">
                This ticket is closed. No further messages can be sent.
              </div>
            )}
          </div>
        </div>
      )}

      <AdminFooter />
    </div>
  );
}