export type IdeaType = "Startup Idea" | "Project" | "Research";

export interface Idea {
  id: string | number;
  title: string;
  desc: string;
  creator: string;
  avatar: string;
  tags: string[];
  type: IdeaType;
  locked: boolean;
  price?: number;
  views: number;
  likes: number;
  branch: string;
  level: string;
}
