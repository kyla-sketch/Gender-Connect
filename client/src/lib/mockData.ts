import man1 from '@assets/generated_images/portrait_of_a_handsome_man.png';
import man2 from '@assets/generated_images/portrait_of_a_stylish_man.png';
import woman1 from '@assets/generated_images/portrait_of_a_beautiful_woman.png';
import woman2 from '@assets/generated_images/portrait_of_a_creative_woman.png';

export type Gender = 'male' | 'female';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  location: string;
  avatar: string;
  bio: string;
  interests: string[];
  job: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export const MOCK_USERS: User[] = [
  {
    id: 'm1',
    name: 'James',
    age: 28,
    gender: 'male',
    location: 'New York, NY',
    avatar: man1,
    bio: 'Photographer and coffee enthusiast. Looking for someone to explore the city with.',
    interests: ['Photography', 'Coffee', 'Hiking'],
    job: 'Freelance Photographer'
  },
  {
    id: 'm2',
    name: 'Alexander',
    age: 32,
    gender: 'male',
    location: 'Brooklyn, NY',
    avatar: man2,
    bio: 'Architect who loves jazz clubs and old buildings. Let’s talk about design.',
    interests: ['Architecture', 'Jazz', 'Design'],
    job: 'Senior Architect'
  },
  {
    id: 'f1',
    name: 'Sophia',
    age: 26,
    gender: 'female',
    location: 'Manhattan, NY',
    avatar: woman1,
    bio: 'Art gallery manager. I love painting, wine tasting, and sunny days in Central Park.',
    interests: ['Art', 'Wine', 'Museums'],
    job: 'Gallery Manager'
  },
  {
    id: 'f2',
    name: 'Isabella',
    age: 29,
    gender: 'female',
    location: 'Queens, NY',
    avatar: woman2,
    bio: 'Graphic designer and bookworm. Always looking for the next great novel.',
    interests: ['Reading', 'Design', 'Travel'],
    job: 'Graphic Designer'
  },
  // Adding more mock users for fullness, reusing images for now with slight tweaks
  {
    id: 'm3',
    name: 'Michael',
    age: 27,
    gender: 'male',
    location: 'Jersey City, NJ',
    avatar: man1,
    bio: 'Tech entrepreneur. Fast paced life, looking for someone to slow down with.',
    interests: ['Startups', 'Running', 'Tech'],
    job: 'Founder'
  },
  {
    id: 'f3',
    name: 'Emma',
    age: 25,
    gender: 'female',
    location: 'Brooklyn, NY',
    avatar: woman1,
    bio: 'Fashion student. I love vintage shopping and sewing my own clothes.',
    interests: ['Fashion', 'Vintage', 'Sewing'],
    job: 'Student'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg1',
    senderId: 'm1',
    receiverId: 'f1',
    text: 'Hey Sophia, I saw you like art galleries. Have you been to the new exhibit at the MoMA?',
    timestamp: '2023-10-25T10:00:00Z'
  },
  {
    id: 'msg2',
    senderId: 'f1',
    receiverId: 'm1',
    text: 'Hi James! Yes, I went last weekend. It was breathtaking. Do you shoot film or digital?',
    timestamp: '2023-10-25T10:05:00Z'
  }
];
