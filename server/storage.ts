import { type User, type InsertUser, type Message, type InsertMessage, users, messages } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, ne } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByGender(gender: string, excludeUserId: string): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsersByGender(gender: string, excludeUserId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        eq(users.gender, gender),
        ne(users.id, excludeUserId)
      ));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUserConversations(userId: string): Promise<string[]> {
    const sentMessages = await db
      .selectDistinct({ partnerId: messages.receiverId })
      .from(messages)
      .where(eq(messages.senderId, userId));

    const receivedMessages = await db
      .selectDistinct({ partnerId: messages.senderId })
      .from(messages)
      .where(eq(messages.receiverId, userId));

    const partnerIds = new Set([
      ...sentMessages.map(m => m.partnerId),
      ...receivedMessages.map(m => m.partnerId)
    ]);

    return Array.from(partnerIds);
  }
}

export const storage = new DatabaseStorage();
