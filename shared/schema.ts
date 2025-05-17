import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  date,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("student").notNull(), // student or admin
  leaveBalance: integer("leave_balance").default(20).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave requests table
export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // sick, vacation, personal, academic
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  contactInfo: varchar("contact_info").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected, cancelled
  documents: jsonb("documents"), // Array of document URLs and names
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments on leave requests
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  leaveId: integer("leave_id").notNull().references(() => leaves.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications for users
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // NULL for admin notifications
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // comment, status, alert
  read: boolean("read").default(false).notNull(),
  forAdmin: boolean("for_admin").default(false).notNull(), // Whether the notification is for admins
  relatedId: integer("related_id"), // Related leave request or comment ID
  createdAt: timestamp("created_at").defaultNow(),
});

// University updates/announcements
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  leaves: many(leaves),
  comments: many(comments),
  notifications: many(notifications),
}));

export const leavesRelations = relations(leaves, ({ one, many }) => ({
  user: one(users, {
    fields: [leaves.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  leave: one(leaves, {
    fields: [comments.leaveId],
    references: [leaves.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export const leaveRequestSchema = createInsertSchema(leaves).omit({ 
  id: true, 
  userId: true, 
  status: true,
  documents: true,
  createdAt: true,
  updatedAt: true
});
export const commentSchema = createInsertSchema(comments).pick({
  content: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export const updateSchema = createInsertSchema(updates).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertLeaveRequest = typeof leaves.$inferInsert;
export type LeaveRequest = typeof leaves.$inferSelect & {
  duration?: number;
  user?: User;
  comments?: Comment[];
};

export type InsertComment = typeof comments.$inferInsert;
export type Comment = typeof comments.$inferSelect & {
  user?: User;
};

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export type InsertUpdate = typeof updates.$inferInsert;
export type Update = typeof updates.$inferSelect;
