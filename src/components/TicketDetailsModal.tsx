import { useState, useEffect, useRef } from 'react';
import type { Ticket, Message, Conversation } from '../types/ticket.ts'

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onSendMessage: (ticketId: string, message: string) => void;
  loading: boolean;
  studentProfileId: string;
}

export default function TicketDetailsModal({
  isOpen,
  onClose,
  ticket,
  onSendMessage,
  loading,
  studentProfileId
}: TicketDetailsModalProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = ticket?.conversation as Conversation;
  const messages = conversation?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && ticket) {
      onSendMessage(ticket.id, message.trim());
      setMessage('');
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

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold">{ticket.subject}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(ticket.type)}`}>
                {ticket.type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Created: {new Date(ticket.raisedOn).toLocaleDateString()} • 
              Updated: {conversation ? new Date(conversation.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg: Message) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender === studentProfileId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === studentProfileId
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === studentProfileId ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Message Input */}
        {ticket.status !== 'closed' && (
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
        
        {ticket.status === 'closed' && (
          <div className="border-t bg-gray-100 p-4 text-center text-gray-600">
            This ticket is closed. No further messages can be sent.
          </div>
        )}
      </div>
    </div>
  );
}