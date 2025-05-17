import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sseManager } from "./sse";
import { z } from "zod";
import { 
  leaveRequestSchema, 
  commentSchema,
  insertNotificationSchema,
  updateSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // SSE route for real-time notifications
  app.get("/api/notifications/events", (req, res) => {
    sseManager.createConnection(req, res);
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update user profile route
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = req.body;
      
      const user = await storage.updateUserProfile(userId, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Set user as admin (self-service for demo)
  app.patch('/api/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      const { role } = req.body;
      
      // Only allow users to update their own role (for demo purposes)
      if (userId !== currentUserId) {
        const currentUser = await storage.getUser(currentUserId);
        // Only admins can update other users' roles
        if (currentUser?.role !== 'admin') {
          return res.status(403).json({ message: "Permission denied" });
        }
      }
      
      if (role !== 'admin' && role !== 'student') {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Leave requests routes
  app.get("/api/leaves", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leaves = await storage.getLeavesByUserId(userId);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.get("/api/leaves/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leaves = await storage.getRecentLeavesByUserId(userId, 5);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching recent leaves:", error);
      res.status(500).json({ message: "Failed to fetch recent leave requests" });
    }
  });

  app.get("/api/leaves/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getLeaveStatsByUserId(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching leave stats:", error);
      res.status(500).json({ message: "Failed to fetch leave statistics" });
    }
  });

  app.get("/api/leaves/:id", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const leave = await storage.getLeaveById(leaveId);
      
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if user is admin or the leave owner
      const user = await storage.getUser(userId);
      if (leave.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access to this leave request" });
      }

      res.json(leave);
    } catch (error) {
      console.error("Error fetching leave:", error);
      res.status(500).json({ message: "Failed to fetch leave request" });
    }
  });

  app.post("/api/leaves", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = leaveRequestSchema.parse(req.body);
      
      const leaveRequest = await storage.createLeaveRequest({
        ...validatedData,
        userId,
        status: "pending"
      });

      // Notify admins about the new leave request
      const user = await storage.getUser(userId);
      
      // Create notification for admins
      const notification = await storage.createNotification({
        userId: null, // For admin notifications
        title: "New Leave Request",
        message: `${user?.firstName} ${user?.lastName} submitted a ${validatedData.type} leave request`,
        type: "comment",
        read: false,
        forAdmin: true,
        relatedId: leaveRequest.id
      });

      // Send real-time notification to admins
      sseManager.sendToAdmins({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        id: notification.id,
        createdAt: notification.createdAt
      });

      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error("Error creating leave request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.post("/api/leaves/:id/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const leave = await storage.getLeaveById(leaveId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to cancel this leave request" });
      }

      if (leave.status !== "pending") {
        return res.status(400).json({ message: "Only pending leave requests can be cancelled" });
      }

      const updatedLeave = await storage.updateLeaveStatus(leaveId, "cancelled");

      res.json(updatedLeave);
    } catch (error) {
      console.error("Error cancelling leave request:", error);
      res.status(500).json({ message: "Failed to cancel leave request" });
    }
  });
  
  // Submit leave request to admin for review
  app.post("/api/leaves/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const leave = await storage.getLeaveById(leaveId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to submit this leave request" });
      }

      if (leave.status !== "pending") {
        return res.status(400).json({ message: "Only pending leave requests can be submitted for review" });
      }
      
      // Get user details for the notification
      const user = await storage.getUser(userId);
      
      // Create notification for admins about the submitted leave request
      const notification = await storage.createNotification({
        userId: null, // For admin notifications
        title: "Leave Request Submitted",
        message: `${user?.firstName} ${user?.lastName} has submitted a ${leave.type} leave request for review`,
        type: "alert",
        read: false,
        forAdmin: true,
        relatedId: leaveId
      });
      
      // Send real-time notification to admins
      sseManager.sendToAdmins({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        id: notification.id,
        createdAt: notification.createdAt
      });
      
      // We're just sending the notification without changing the status,
      // as the request is already in 'pending' status

      res.json({ success: true, message: "Leave request submitted to admin for review" });
    } catch (error) {
      console.error("Error submitting leave request to admin:", error);
      res.status(500).json({ message: "Failed to submit leave request" });
    }
  });

  app.post("/api/leaves/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = commentSchema.parse(req.body);
      
      const leave = await storage.getLeaveById(leaveId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      // Check if user is admin or the leave owner
      const user = await storage.getUser(userId);
      if (leave.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to comment on this leave request" });
      }

      const comment = await storage.createComment({
        leaveId,
        userId,
        content: validatedData.content
      });

      // Create notification
      let notificationUserId;
      if (userId === leave.userId) {
        // If comment by student, notify admins
        notificationUserId = null; // For admin notifications
      } else {
        // If comment by admin, notify student
        notificationUserId = leave.userId;
      }

      const notification = await storage.createNotification({
        userId: notificationUserId,
        title: "New Comment",
        message: `${user?.firstName} ${user?.lastName} commented on your leave request`,
        type: "comment",
        read: false,
        forAdmin: userId === leave.userId,
        relatedId: leaveId
      });

      // Send real-time notification
      if (notificationUserId === null) {
        // For admin
        sseManager.sendToAdmins({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          id: notification.id,
          createdAt: notification.createdAt
        });
      } else {
        // For student
        sseManager.sendToUser(notificationUserId, {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          id: notification.id,
          createdAt: notification.createdAt
        });
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let notifications;
      if (user?.role === "admin") {
        notifications = await storage.getAdminNotifications();
      } else {
        notifications = await storage.getUserNotifications(userId);
      }
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/read/:id", isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const notification = await storage.getNotificationById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Verify ownership or admin status for the notification
      const user = await storage.getUser(userId);
      if (notification.userId !== userId && !notification.forAdmin && user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this notification" });
      }

      const updatedNotification = await storage.markNotificationRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === "admin") {
        await storage.markAllAdminNotificationsRead();
      } else {
        await storage.markAllUserNotificationsRead(userId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // University updates routes
  app.get("/api/updates", isAuthenticated, async (req, res) => {
    try {
      const updates = await storage.getUpdates();
      res.json(updates);
    } catch (error) {
      console.error("Error fetching updates:", error);
      res.status(500).json({ message: "Failed to fetch university updates" });
    }
  });

  // Admin routes
  app.get("/api/admin/leaves", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const leaves = await storage.getAllLeaves();
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching all leaves for admin:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/admin/leaves/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const adminId = req.user.claims.sub;
      
      // Verify admin status
      const admin = await storage.getUser(adminId);
      if (admin?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const leave = await storage.getLeaveById(leaveId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.status !== "pending") {
        return res.status(400).json({ message: "Only pending leave requests can be approved" });
      }

      const updatedLeave = await storage.updateLeaveStatus(leaveId, "approved");

      // Create notification for the student
      const notification = await storage.createNotification({
        userId: leave.userId,
        title: "Leave Request Approved",
        message: `Your ${leave.type} leave request has been approved`,
        type: "status",
        read: false,
        forAdmin: false,
        relatedId: leaveId
      });

      // Send real-time notification
      sseManager.sendToUser(leave.userId, {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        id: notification.id,
        createdAt: notification.createdAt
      });

      res.json(updatedLeave);
    } catch (error) {
      console.error("Error approving leave request:", error);
      res.status(500).json({ message: "Failed to approve leave request" });
    }
  });

  app.post("/api/admin/leaves/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const leaveId = parseInt(req.params.id);
      const adminId = req.user.claims.sub;
      
      // Verify admin status
      const admin = await storage.getUser(adminId);
      if (admin?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const leave = await storage.getLeaveById(leaveId);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.status !== "pending") {
        return res.status(400).json({ message: "Only pending leave requests can be rejected" });
      }

      const updatedLeave = await storage.updateLeaveStatus(leaveId, "rejected");

      // Create notification for the student
      const notification = await storage.createNotification({
        userId: leave.userId,
        title: "Leave Request Rejected",
        message: `Your ${leave.type} leave request has been rejected`,
        type: "alert",
        read: false,
        forAdmin: false,
        relatedId: leaveId
      });

      // Send real-time notification
      sseManager.sendToUser(leave.userId, {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        id: notification.id,
        createdAt: notification.createdAt
      });

      res.json(updatedLeave);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      res.status(500).json({ message: "Failed to reject leave request" });
    }
  });
  
  // Admin updates management
  app.post("/api/admin/updates", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      
      // Verify admin status
      const admin = await storage.getUser(adminId);
      if (admin?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const validatedData = updateSchema.parse(req.body);
      const update = await storage.createUpdate(validatedData);
      
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating update:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create update" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
