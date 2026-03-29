import type { AppNotification } from "@/lib/types/notification";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 1, type: "like", text: "Priya Singh liked your idea EcoTrack", time: "2m ago", read: false },
  {
    id: 2,
    type: "comment",
    text: "Rahul Verma commented on SkillChain: 'Amazing concept!'",
    time: "18m ago",
    read: false,
  },
  { id: 3, type: "join", text: "Dev Sharma joined your community AI & ML Hub", time: "1h ago", read: true },
  {
    id: 4,
    type: "unlock",
    text: "Someone unlocked your idea MediScan — ₹149 earned!",
    time: "3h ago",
    read: false,
  },
  { id: 5, type: "follow", text: "Ananya Roy started following you", time: "5h ago", read: true },
  { id: 6, type: "feature", text: "Your idea EcoTrack was featured on Explore!", time: "1d ago", read: true },
];
