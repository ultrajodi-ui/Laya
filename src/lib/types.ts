export type UserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  imageUrl: string;
  lookingFor: string;
  compatibilityScore?: number;
};

export type Connection = {
  id: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined';
  direction: 'incoming' | 'outgoing';
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
};

export type Conversation = {
  id: string;
  participant: UserProfile;
  messages: Message[];
  lastMessage: Message;
};
