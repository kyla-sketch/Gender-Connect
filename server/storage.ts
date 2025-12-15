import { type User, type InsertUser, type Message, type InsertMessage, type Like, type InsertLike, users, messages, likes } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, ne, inArray } from "drizzle-orm";

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
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  hasLike(likerId: string, likedId: string): Promise<boolean>;
  getMatches(userId: string): Promise<User[]>;
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

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
    return like;
  }

  async hasLike(likerId: string, likedId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.likerId, likerId), eq(likes.likedId, likedId)));
    return !!existingLike;
  }

  async getMatches(userId: string): Promise<User[]> {
    // Get users who liked the current user
    const likers = await db
      .select({ userId: likes.likerId })
      .from(likes)
      .where(eq(likes.likedId, userId));

    // Get users who the current user liked
    const likedUsers = await db
      .select({ userId: likes.likedId })
      .from(likes)
      .where(eq(likes.likerId, userId));

    // Find mutual likes (matches)
    const likerIds = new Set(likers.map(l => l.userId));
    const likedIds = new Set(likedUsers.map(l => l.userId));
    
    const matchIds = Array.from(likerIds).filter(id => likedIds.has(id));

    if (matchIds.length === 0) {
      return [];
    }

    // Get full user details for matches
    const matches = await db
      .select()
      .from(users)
      .where(inArray(users.id, matchIds));

    return matches;
  }
}

export const storage = new DatabaseStorage();
