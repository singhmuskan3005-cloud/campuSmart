export interface Message {
  messageId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  sentAt: string;
}

export interface MessageThreadSummary {
  threadId: string;
  listingId: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  participants: string[];
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantAvatar?: string;
  otherParticipantCampus?: string;
  lastMessage: {
    senderId: string;
    content: string;
    sentAt: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

export interface MessageThreadDetail extends MessageThreadSummary {
  messages: Message[];
}
