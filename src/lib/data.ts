import type { UserProfile, Connection, Conversation } from './types';

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Anika Sharma',
    age: 28,
    location: 'Mumbai, India',
    bio: 'Software engineer by day, aspiring chef by night. I love exploring new cafes, hiking, and reading historical fiction. Looking for someone with a good sense of humor and a kind heart.',
    interests: ['Cooking', 'Hiking', 'Reading', 'Technology'],
    imageUrl: 'https://picsum.photos/seed/woman1/400/400',
    lookingFor: 'A meaningful, long-term relationship.',
  },
  {
    id: '2',
    name: 'Rohan Mehta',
    age: 31,
    location: 'Delhi, India',
    bio: 'Architect with a passion for sustainable design and travel. You can find me sketching in a park or planning my next trip. Seeking a creative and adventurous partner to explore the world with.',
    interests: ['Architecture', 'Travel', 'Art', 'Sustainability'],
    imageUrl: 'https://picsum.photos/seed/man1/400/400',
    lookingFor: 'Someone to share adventures and deep conversations with.',
  },
  {
    id: '3',
    name: 'Priya Patel',
    age: 29,
    location: 'Bangalore, India',
    bio: 'A graphic designer who finds joy in colors and typography. I enjoy live music, indie films, and cycling. Looking for a genuine connection with someone who is passionate about their craft.',
    interests: ['Design', 'Music', 'Films', 'Cycling'],
    imageUrl: 'https://picsum.photos/seed/woman2/400/400',
    lookingFor: 'A creative and kind partner.',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    age: 33,
    location: 'Pune, India',
    bio: 'Fitness enthusiast and entrepreneur. I run a small chain of gyms. I believe in a disciplined lifestyle but also enjoy a good cheat meal. Looking for someone who is ambitious and values a healthy lifestyle.',
    interests: ['Fitness', 'Business', 'Nutrition', 'Dogs'],
    imageUrl: 'https://picsum.photos/seed/man2/400/400',
    lookingFor: 'A motivated and supportive partner.',
  },
    {
    id: '5',
    name: 'Saanvi Gupta',
    age: 27,
    location: 'Hyderabad, India',
    bio: 'Doctor, dog lover, and a terrible singer. I find happiness in the little things. My weekends are for brunch, long walks with my beagle, and catching up on mystery novels.',
    interests: ['Medicine', 'Dogs', 'Brunch', 'Mysteries'],
    imageUrl: 'https://picsum.photos/seed/woman3/400/400',
    lookingFor: 'A fun-loving and compassionate person.',
  },
  {
    id: '6',
    name: 'Arjun Desai',
    age: 30,
    location: 'Chennai, India',
    bio: 'Musician and part-time philosopher. I play the guitar and write my own songs. I\'m fascinated by psychology and deep conversations about life. Looking for a soulful connection.',
    interests: ['Music', 'Philosophy', 'Psychology', 'Concerts'],
    imageUrl: 'https://picsum.photos/seed/man3/400/400',
    lookingFor: 'A partner who is introspective and loves music.',
  },
];

export const mockConnections: Connection[] = [
    { id: 'c1', userId: '3', status: 'pending', direction: 'incoming' },
    { id: 'c2', userId: '4', status: 'pending', direction: 'incoming' },
    { id: 'c3', userId: '5', status: 'accepted', direction: 'incoming' },
    { id: 'c4', userId: '6', status: 'pending', direction: 'outgoing' },
];

export const mockConversations: Conversation[] = [
    {
        id: 'conv1',
        participant: mockUsers[4],
        messages: [
            { id: 'm1', senderId: 'user', text: 'Hey Saanvi! I loved your profile, especially the part about your beagle. I have a golden retriever!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)},
            { id: 'm2', senderId: '5', text: 'Oh wow, that\'s amazing! We should definitely plan a puppy playdate sometime.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23)},
        ],
        lastMessage: { id: 'm2', senderId: '5', text: 'Oh wow, that\'s amazing! We should definitely plan a puppy playdate sometime.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23)},
    },
    {
        id: 'conv2',
        participant: mockUsers[1],
        messages: [
             { id: 'm3', senderId: '2', text: 'Hey, saw you\'re into architecture too!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)},
        ],
        lastMessage: { id: 'm3', senderId: '2', text: 'Hey, saw you\'re into architecture too!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)},
    }
]

export const getConnectionsByStatus = (status: Connection['status']) => 
    mockConnections.filter(c => c.status === status).map(c => {
        const user = mockUsers.find(u => u.id === c.userId);
        return { ...c, user };
    });

export const getConnectionsByDirection = (direction: Connection['direction']) => 
    mockConnections.filter(c => c.direction === direction).map(c => {
        const user = mockUsers.find(u => u.id === c.userId);
        return { ...c, user };
    });
