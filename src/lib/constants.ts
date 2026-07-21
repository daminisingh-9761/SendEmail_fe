import { PenSquare, Clock, User } from "lucide-react";
import type { ApplicationStatus } from "@/types";

export const HOME_CONSTANTS = {
  COMPOSER_CLEARANCE: "60px",
  HERO_HEADING: "What application are we writing today?",
};

export const STATUS_VARIANT: Record<ApplicationStatus, "secondary" | "success" | "destructive" | "accent"> = {
  draft: "secondary",
  sent: "success",
  follow_up_sent: "accent",
  failed: "destructive",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  follow_up_sent: "Follow-up",
  failed: "Failed",
};

export const BOTTOM_NAV_TABS = [
  { id: "new", label: "New", icon: PenSquare, path: "/" },
  { id: "history", label: "History", icon: Clock, path: "/history" },
  { id: "profile", label: "Profile", icon: User, path: null },
] as const;

export const HERO_ANIMATION = {
  DURATION: 5.5,
  COLORS: {
    navy: "#1C2333",
    coral: "#D85A30",
  },
};

export const HISTORY_FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
];
