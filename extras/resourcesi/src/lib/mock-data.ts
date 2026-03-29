export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: "student" | "professor" | "mentor" | "admin";
  bio: string;
  institution: string;
  skills: string[];
  followers: number;
  following: number;
  verified: boolean;
  projects: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  saved: boolean;
  liked: boolean;
  createdAt: string;
  collaborationType?: "team" | "paid" | "research";
  budget?: string;
  deadline?: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "collab" | "mention";
  user: User;
  message: string;
  time: string;
  read: boolean;
}

export interface Message {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unread: number;
}

const avatarUrl = (seed: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

export const currentUser: User = {
  id: "1",
  name: "Alex Chen",
  username: "alexchen",
  avatar: avatarUrl("alex"),
  role: "student",
  bio: "CS student passionate about AI & sustainable tech. Building the future one commit at a time.",
  institution: "MIT",
  skills: ["Machine Learning", "React", "Python", "Computer Vision", "NLP"],
  followers: 1247,
  following: 389,
  verified: true,
  projects: 12,
};

export const users: User[] = [
  currentUser,
  { id: "2", name: "Dr. Sarah Kim", username: "sarahkim", avatar: avatarUrl("sarah"), role: "professor", bio: "AI Research Lead", institution: "Stanford University", skills: ["Deep Learning", "Research", "NLP"], followers: 5420, following: 210, verified: true, projects: 34 },
  { id: "3", name: "Raj Patel", username: "rajpatel", avatar: avatarUrl("raj"), role: "student", bio: "IoT & Robotics enthusiast", institution: "IIT Bombay", skills: ["IoT", "Embedded Systems", "C++"], followers: 892, following: 445, verified: false, projects: 8 },
  { id: "4", name: "Emma Wilson", username: "emmawilson", avatar: avatarUrl("emma"), role: "mentor", bio: "Ex-Google, helping startups scale", institution: "Y Combinator", skills: ["Product", "Strategy", "Fundraising"], followers: 12300, following: 156, verified: true, projects: 20 },
  { id: "5", name: "James Liu", username: "jamesliu", avatar: avatarUrl("james"), role: "student", bio: "Full-stack dev & open source contributor", institution: "UC Berkeley", skills: ["TypeScript", "Go", "Kubernetes"], followers: 2100, following: 320, verified: false, projects: 15 },
  { id: "6", name: "Prof. Maria Garcia", username: "mariagarcia", avatar: avatarUrl("maria"), role: "professor", bio: "Quantum computing researcher", institution: "Caltech", skills: ["Quantum", "Physics", "Mathematics"], followers: 3890, following: 180, verified: true, projects: 28 },
];

export const posts: Post[] = [
  {
    id: "1", author: users[1], content: "Excited to share our latest research on transformer architectures for low-resource languages. We achieved SOTA results with 10x less data! 🚀\n\nLooking for graduate students interested in NLP to join our lab.", tags: ["AI", "NLP", "Research"], likes: 342, comments: 56, shares: 89, saved: false, liked: false, createdAt: "2h ago", collaborationType: "research",
  },
  {
    id: "2", author: users[2], content: "Just built a smart irrigation system using ESP32 and soil moisture sensors. The ML model predicts watering needs with 94% accuracy. Hardware meets software! 🌱💧", tags: ["IoT", "AgriTech", "ML"], likes: 218, comments: 34, shares: 45, saved: true, liked: true, createdAt: "4h ago", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
  },
  {
    id: "3", author: users[3], content: "3 things I wish I knew before my first startup:\n\n1. Talk to users before writing code\n2. Distribution > Product\n3. Cash flow is oxygen\n\nWhat would you add to this list?", tags: ["Startup", "Advice", "Founders"], likes: 1205, comments: 187, shares: 312, saved: false, liked: false, createdAt: "6h ago",
  },
  {
    id: "4", author: users[4], content: "Open-sourced our real-time collaboration engine built with CRDTs. It handles 10K concurrent users with sub-50ms sync. Check it out! 🔥", tags: ["OpenSource", "Engineering", "Collaboration"], likes: 567, comments: 72, shares: 134, saved: false, liked: true, createdAt: "8h ago", collaborationType: "team",
  },
  {
    id: "5", author: users[5], content: "Our quantum error correction paper just got accepted at Nature! Years of work finally paying off. Huge thanks to the entire team. 🎉", tags: ["Quantum", "Research", "Physics"], likes: 2340, comments: 198, shares: 456, saved: false, liked: false, createdAt: "12h ago",
  },
];

export const trendingTags = ["AI", "Startup", "Research", "IoT", "Quantum", "Web3", "CleanTech", "Robotics", "NLP", "OpenSource"];

export const notifications: Notification[] = [
  { id: "1", type: "like", user: users[1], message: "liked your post about ML pipelines", time: "2m ago", read: false },
  { id: "2", type: "collab", user: users[2], message: "wants to collaborate on Smart Campus", time: "15m ago", read: false },
  { id: "3", type: "follow", user: users[4], message: "started following you", time: "1h ago", read: false },
  { id: "4", type: "comment", user: users[3], message: "commented on your project demo", time: "2h ago", read: true },
  { id: "5", type: "mention", user: users[5], message: "mentioned you in a post", time: "3h ago", read: true },
];

export const messages: Message[] = [
  { id: "1", user: users[1], lastMessage: "I'd love to discuss the research proposal further", time: "5m ago", unread: 2 },
  { id: "2", user: users[3], lastMessage: "Great pitch deck! Let me connect you with...", time: "1h ago", unread: 0 },
  { id: "3", user: users[2], lastMessage: "The sensor readings look promising 📊", time: "3h ago", unread: 1 },
  { id: "4", user: users[4], lastMessage: "PR merged! Nice work on the optimization", time: "1d ago", unread: 0 },
];
