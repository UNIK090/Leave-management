// Type definitions for frontend use

// User types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  leaveBalance?: number;
  rollNumber?: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

// Leave request types
export interface LeaveRequest {
  id: number;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  contactInfo: string;
  status: string;
  duration: number;
  documents?: Array<{
    url: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
  user?: User;
  comments?: Comment[];
}

// Comment types
export interface Comment {
  id: number;
  leaveId: number;
  userId: string;
  content: string;
  createdAt: string;
  user?: User;
}

// Notification types
export interface NotificationType {
  id: number;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  forAdmin: boolean;
  relatedId?: number;
  createdAt: string;
}

// University update types
export interface Update {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// Leave stats response
export interface LeaveStatsResponse {
  pending: number;
  approved: number;
  rejected: number;
  balance: number;
  balancePercentage: number;
}
