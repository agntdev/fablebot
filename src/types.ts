export interface Fable {
  id: string;
  title: string;
  author: string;
  text: string;
  length: "short" | "medium" | "long";
  ageSuitability: string;
  tags: string[];
  language: string;
  createdAt: string;
  flagged: boolean;
  flagReason?: string;
}

export interface UserProfile {
  telegramId: number;
  displayName: string;
  language: string;
  subscriptionStatus: "none" | "active" | "paused";
  savedFableIds: string[];
}

export interface DeliverySchedule {
  userId: number;
  cadence: "daily" | "weekly";
  preferredTime: string;
  tagFilter: string[];
  active: boolean;
}

export interface AdminNote {
  fableId: string;
  editorComments: string;
  reviewedAt?: string;
}

export const CATEGORIES = [
  { label: "Bravery", tag: "bravery", emoji: "🦁" },
  { label: "Kindness", tag: "kindness", emoji: "💛" },
  { label: "Wisdom", tag: "wisdom", emoji: "🦉" },
  { label: "Honesty", tag: "honesty", emoji: "🌟" },
  { label: "Friendship", tag: "friendship", emoji: "🤝" },
  { label: "Nature", tag: "nature", emoji: "🌿" },
  { label: "Magic", tag: "magic", emoji: "✨" },
  { label: "Adventure", tag: "adventure", emoji: "🗺️" },
] as const;
