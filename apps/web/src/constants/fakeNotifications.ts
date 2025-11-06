import { Upload, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FakeNotification {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  timestamp: string;
}

export const FAKE_NOTIFICATIONS: FakeNotification[] = [
  {
    id: "fake-1",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "New File Upload:...",
    description: "Submitted to your 'Project Briefs' link.",
    timestamp: "5m ago",
  },
  {
    id: "fake-2",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Link Click: Portfolio",
    description: "Your link was viewed 25 times today.",
    timestamp: "2h ago",
  },
  {
    id: "fake-3",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "New Document Upload",
    description: "Resume submitted to your 'Careers' drop.",
    timestamp: "3h ago",
  },
  {
    id: "fake-4",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Analytics Update",
    description: "Your profile was viewed 50 times this week.",
    timestamp: "5h ago",
  },
  {
    id: "fake-5",
    icon: Upload,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Image Upload Complete",
    description: "3 images submitted to your 'Gallery' link.",
    timestamp: "1d ago",
  },
  {
    id: "fake-6",
    icon: TrendingUp,
    iconBg: "bg-gray-900 dark:bg-gray-700",
    title: "Engagement Report",
    description: "Your links received 120 total clicks.",
    timestamp: "2d ago",
  },
];
