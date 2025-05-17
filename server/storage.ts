import {
  users,
  sessions,
  leaves,
  comments,
  notifications,
  updates,
  type User,
  type UpsertUser,
  type LeaveRequest,
  type InsertLeaveRequest,
  type Comment,
  type InsertComment,
  type Notification,
  type InsertNotification,
  type Update,
  type InsertUpdate
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, sql, count } from "drizzle-orm";
import { differenceInDays } from "date-fns";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: { rollNumber?: string; branch?: string; }): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Leave request operations
  getLeaveById(id: number): Promise<LeaveRequest | undefined>;
  getLeavesByUserId(userId: string): Promise<LeaveRequest[]>;
  getRecentLeavesByUserId(userId: string, limit: number): Promise<LeaveRequest[]>;
  getLeaveStatsByUserId(userId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    balance: number;
    balancePercentage: number;
  }>;
  getAllLeaves(): Promise<LeaveRequest[]>;
  createLeaveRequest(data: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveStatus(id: number, status: string): Promise<LeaveRequest>;

  // Comment operations
  createComment(data: InsertComment): Promise<Comment>;
  
  // Notification operations
  getNotificationById(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getAdminNotifications(): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification>;
  markAllUserNotificationsRead(userId: string): Promise<void>;
  markAllAdminNotificationsRead(): Promise<void>;
  
  // University updates operations
  getUpdates(): Promise<Update[]>;
  createUpdate(data: InsertUpdate): Promise<Update>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        role: userData.role || "student", // Default role is student
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Leave request operations
  async getLeaveById(id: number): Promise<LeaveRequest | undefined> {
    const [leave] = await db
      .select()
      .from(leaves)
      .where(eq(leaves.id, id));
    
    if (!leave) return undefined;
    
    // Get user details
    const [userDetails] = await db
      .select()
      .from(users)
      .where(eq(users.id, leave.userId));
    
    // Get comments
    const commentsData = await db
      .select()
      .from(comments)
      .where(eq(comments.leaveId, id))
      .orderBy(desc(comments.createdAt));
    
    // Get user details for each comment
    const commentsWithUsers = await Promise.all(
      commentsData.map(async (comment) => {
        const [commentUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.userId));
        
        return {
          ...comment,
          user: commentUser || { id: comment.userId }
        };
      })
    );
    
    // Calculate duration
    const duration = differenceInDays(
      new Date(leave.endDate),
      new Date(leave.startDate)
    ) + 1;
    
    return {
      ...leave,
      duration,
      user: userDetails || { id: leave.userId },
      comments: commentsWithUsers
    };
  }

  async getLeavesByUserId(userId: string): Promise<LeaveRequest[]> {
    const leavesData = await db
      .select()
      .from(leaves)
      .where(eq(leaves.userId, userId))
      .orderBy(desc(leaves.createdAt));
    
    return leavesData.map(leave => ({
      ...leave,
      duration: differenceInDays(
        new Date(leave.endDate),
        new Date(leave.startDate)
      ) + 1
    }));
  }

  async getRecentLeavesByUserId(userId: string, limit: number): Promise<LeaveRequest[]> {
    const leavesData = await db
      .select()
      .from(leaves)
      .where(eq(leaves.userId, userId))
      .orderBy(desc(leaves.createdAt))
      .limit(limit);
    
    return leavesData.map(leave => ({
      ...leave,
      duration: differenceInDays(
        new Date(leave.endDate),
        new Date(leave.startDate)
      ) + 1
    }));
  }

  async getLeaveStatsByUserId(userId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    balance: number;
    balancePercentage: number;
  }> {
    // Get counts by status
    const [pendingCount] = await db
      .select({ count: count() })
      .from(leaves)
      .where(
        and(
          eq(leaves.userId, userId),
          eq(leaves.status, "pending")
        )
      );
    
    const [approvedCount] = await db
      .select({ count: count() })
      .from(leaves)
      .where(
        and(
          eq(leaves.userId, userId),
          eq(leaves.status, "approved")
        )
      );
    
    const [rejectedCount] = await db
      .select({ count: count() })
      .from(leaves)
      .where(
        and(
          eq(leaves.userId, userId),
          eq(leaves.status, "rejected")
        )
      );
    
    // For this example, we'll assume each student gets 20 leave days per year
    const totalLeaveBalance = 20;
    
    // Calculate used days from approved leaves
    const approvedLeaves = await db
      .select()
      .from(leaves)
      .where(
        and(
          eq(leaves.userId, userId),
          eq(leaves.status, "approved")
        )
      );
    
    const usedDays = approvedLeaves.reduce((total, leave) => {
      const duration = differenceInDays(
        new Date(leave.endDate),
        new Date(leave.startDate)
      ) + 1;
      return total + duration;
    }, 0);
    
    const remainingBalance = Math.max(0, totalLeaveBalance - usedDays);
    const balancePercentage = Math.round((remainingBalance / totalLeaveBalance) * 100);
    
    return {
      pending: pendingCount?.count || 0,
      approved: approvedCount?.count || 0,
      rejected: rejectedCount?.count || 0,
      balance: remainingBalance,
      balancePercentage
    };
  }

  async getAllLeaves(): Promise<LeaveRequest[]> {
    const leavesData = await db
      .select()
      .from(leaves)
      .orderBy(desc(leaves.createdAt));
    
    // Fetch user details for each leave
    const leavesWithUserDetails = await Promise.all(
      leavesData.map(async (leave) => {
        const [userDetails] = await db
          .select()
          .from(users)
          .where(eq(users.id, leave.userId));
        
        return {
          ...leave,
          duration: differenceInDays(
            new Date(leave.endDate),
            new Date(leave.startDate)
          ) + 1,
          user: userDetails || { id: leave.userId }
        };
      })
    );
    
    return leavesWithUserDetails;
  }

  async createLeaveRequest(data: InsertLeaveRequest): Promise<LeaveRequest> {
    const [leave] = await db
      .insert(leaves)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    return {
      ...leave,
      duration: differenceInDays(
        new Date(leave.endDate),
        new Date(leave.startDate)
      ) + 1
    };
  }

  async updateLeaveStatus(id: number, status: string): Promise<LeaveRequest> {
    const [updatedLeave] = await db
      .update(leaves)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(leaves.id, id))
      .returning();
    
    return {
      ...updatedLeave,
      duration: differenceInDays(
        new Date(updatedLeave.endDate),
        new Date(updatedLeave.startDate)
      ) + 1
    };
  }

  // Comment operations
  async createComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    // Get user details
    const [userDetails] = await db
      .select()
      .from(users)
      .where(eq(users.id, comment.userId));
    
    return {
      ...comment,
      user: userDetails || { id: comment.userId }
    };
  }

  // Notification operations
  async getNotificationById(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notificationsData = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    return notificationsData;
  }

  async getAdminNotifications(): Promise<Notification[]> {
    const notificationsData = await db
      .select()
      .from(notifications)
      .where(
        and(
          isNull(notifications.userId),
          eq(notifications.forAdmin, true)
        )
      )
      .orderBy(desc(notifications.createdAt));
    
    return notificationsData;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    return notification;
  }

  async markNotificationRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return updatedNotification;
  }

  async markAllUserNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async markAllAdminNotificationsRead(): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          isNull(notifications.userId),
          eq(notifications.forAdmin, true)
        )
      );
  }

  // University updates operations
  async getUpdates(): Promise<Update[]> {
    const updatesData = await db
      .select()
      .from(updates)
      .orderBy(desc(updates.createdAt));
    
    return updatesData;
  }

  async createUpdate(data: InsertUpdate): Promise<Update> {
    const [update] = await db
      .insert(updates)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();
    
    return update;
  }
}

export const storage = new DatabaseStorage();
