

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
  gender?: 'male' | 'female';
  motherTongue?: "Assamese" | "Bengali" | "Bodo" | "Dogri" | "English" | "Gujarati" | "Hindi" | "Kannada" | "Kashmiri" | "Konkani" | "Maithili" | "Malayalam" | "Manipuri" | "Marathi" | "Nepali" | "Odia" | "Punjabi" | "Sanskrit" | "Santali" | "Sindhi" | "Tamil" | "Telugu" | "Urdu" | "Other";
  fatherName?: string;
  motherName?: string;
  mobileNo?: string;
  maritalStatus?: 'Never Married' | 'Divorced' | 'Widow' | 'Widower';
  zodiacSign?: string;
  starSign?: string;
  religion?: "Hindu" | "Christian" | "Muslim - Shia" | "Muslim - Sunni" | "Muslim - Other" | "Sikh" | "Jain - Digambar" | "Jain - Shwetamber" | "Jain - Others" | "Parsi" | "Buddhist" | "Jewish" | "Inter - Religion" | "No Religious Belief";
  community?: "OC" | "FC" | "MBC" | "BC" | "SC" | "ST" | "Other";
  subCaste?: string;
  education?: string;
  educationDetails?: string;
  employed?: 'Government' | 'Private' | 'Business' | 'Self Employed' | 'Un Employed';
  occupation?: string;
  salary?: string;
  workingPlace?: string;
  homeState?: string;
  city?: string;
  state?: string;
  email?: string;
  usertype?: 'admin' |'Basic' | 'Silver' | 'Gold' | 'Diamond';
  memberid?: string;
  coverUrl?: string;
  createdAt?: any;
  likes?: string[];
  photoVisibility?: 'Public' | 'Protected';
  contactLimit?: number;
  viewedContacts?: string[];
  role?: 'admin' | 'user';
  bodyType?: 'Slim' | 'Normal' | 'Little Fat';
  complexion?: 'Fair' | 'Medium Fair' | 'Medium Brown' | 'Brown';
  heightFeet?: string;
  heightInches?: string;
  diet?: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian';
  drinkingHabit?: 'Non-Drinker' | 'Social Drinker' | 'Moderate drinker' | 'Heavy drinkers';
  smokingHabit?: 'Non-Smoker' | 'Light Smoker' | 'Moderate Smoker' | 'Heavy Smoker';
  profileBy?: "Self" | "Parents" | "Sibling" | "Guardian" | "Friends" | "Relatives";
  currentStatus?: 'Active' | 'Engaged' | 'Married' | 'Inactive';
  profileVisible?: boolean;
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

    

    
