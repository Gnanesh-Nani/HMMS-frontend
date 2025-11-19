import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../components/StudentHeader';
import Footer from '../components/Footer';
import api from '../api/axiosInstance';
import type { Ticket, CreateTicketData } from '../types/ticket';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailsModal from '../components/TicketDetailsModal';

export default function StudentTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const studentProfileId = "690c2a74bbbe64d1425cb959"; // This should come from auth context
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ticket/me/${studentProfileId}`);
      if (!res.data.error) {
        setTickets(res.data.data);
      } else {
        setErrorMsg(res.data.message || 'Failed to fetch tickets.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (ticketData: CreateTicketData) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.post('/ticket/create', ticketData);
      if (!res.data.error) {
        setSuccessMsg('Ticket created successfully!');
        setIsCreateModalOpen(false);
        fetchTickets(); // Refresh the list
      } else {
        setErrorMsg(res.data.message || 'Failed to create ticket.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (ticketId: string, message: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/ticket/send-message/${ticketId}`, {
        senderId: studentProfileId,
        message: message
      });
      if (!res.data.error) {
        // Refresh the selected ticket to get updated messages
        if (selectedTicket) {
          const ticketRes = await api.get(`/ticket/${selectedTicket.id}`);
          if (!ticketRes.data.error) {
            setSelectedTicket(ticketRes.data.data);
          }
        }
      } else {
        setErrorMsg(res.data.message || 'Failed to send message.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      setLoading(true);
      const res = await api.get(`/ticket/${ticket.id}`);
      if (!res.data.error) {
        setSelectedTicket(res.data.data);
        setIsDetailsModalOpen(true);
      } else {
        setErrorMsg(res.data.message || 'Failed to fetch ticket details.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />
      
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
                  <p className="text-gray-600 mt-1">Create and manage your support requests</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Create Ticket
                </button>
              </div>
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

            {/* Tickets List */}
            <div className="p-6">
              {loading && tickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600 mb-4">Create your first support ticket to get started</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer bg-white"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(ticket.type)}`}>
                              {ticket.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(ticket.raisedOn).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
        loading={loading}
        studentProfileId={studentProfileId}
      />

      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        ticket={selectedTicket}
        onSendMessage={handleSendMessage}
        loading={loading}
        studentProfileId={studentProfileId}
      />

      <Footer />
    </div>
  );
}