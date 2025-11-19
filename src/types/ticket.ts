export interface Message {
  _id: string;
  sender: string;
  text: string;
  sentAt: string;
  default: any[];
}

export interface Conversation {
  status: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface Ticket {
  id: string;
  studentProfile: string | StudentProfile;
  conversation: string | Conversation;
  type: 'feed-back' | 'complaint' | 'room-change';
  subject: string;
  raisedOn: string;
  status: 'open' | 'closed' | 'in-progress';
  firstMessage?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  gender: string;
}

export interface CreateTicketData {
  studentProfile: string;
  subject: string;
  type: string;
  firstMessage: string;
}