export type NotifType = "like" | "comment" | "join" | "unlock" | "follow" | "feature";

export type AppNotification = {
  id: number;
  type: NotifType;
  text: string;
  time: string;
  read: boolean;
};
