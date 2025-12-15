import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  location: text("location").notNull(),
  bio: text("bio").notNull().default(""),
  interests: text("interests").array().notNull().default([]),
  job: text("job").notNull().default(""),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  text: text("text"),
  type: text("type").notNull().default("text"), // "text", "image", "emoji"
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  likerId: varchar("liker_id").notNull().references(() => users.id),
  likedId: varchar("liked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(18).max(100),
  gender: z.enum(["male", "female"]),
  name: z.string().min(1),
  location: z.string().min(1),
  bio: z.string().optional(),
  job: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages, {
  text: z.string().optional(),
  type: z.enum(["text", "image", "emoji"]).default("text"),
  imageUrl: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
