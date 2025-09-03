

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
  motherTongue?: string;
  fatherName?: string;
  motherName?: string;
  mobileNo?: string;
  maritalStatus?: 'Never Married' | 'Divorced' | 'Widow' | 'Widower';
  zodiacSign?: string;
  starSign?: string;
  religion?: string;
  community?: string;
  subCaste?: string;
  education?: string;
  educationDetails?: string;
  employed?: 'Government' | 'Private' | 'Business' | 'Self Employed' | 'Un Employed';
  occupation?: string;
  salary?: string;
  workingPlace?: string;
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
  role?: 'admin' | 'user';
  bodyType?: 'Slim' | 'Normal' | 'Little Fat';
  complexion?: 'Fair' | 'Medium Fair' | 'Medium Brown' | 'Brown';
  heightFeet?: string;
  heightInches?: string;
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
