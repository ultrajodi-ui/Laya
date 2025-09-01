

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
  // Firestore data
  fullName?: string;
  dob?: any;
  gender?: 'male' | 'female' | 'other';
  fatherName?: string;
  motherName?: string;
  mobileNo?: string;
  zodiacSign?: string;
  starSign?: string;
  religion?: string;
  community?: string;
  subCaste?: string;
  employed?: 'yes' | 'no';
  occupation?: string;
  salary?: string;
  workingPlace?: string;
  homeAddress?: string;
  city?: string;
  state?: string;
  email?: string;
  usertype?: 'Basic' | 'Premium';
  memberid?: string;
  coverUrl?: string;
  createdAt?: any;
  likes?: string[];
  photoVisibility?: 'Public' | 'Private';
  contactLimit?: number;
  viewedContacts?: string[];
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
