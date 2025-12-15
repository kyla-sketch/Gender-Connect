import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertLikeSchema, type User } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import createMemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";

const MemoryStore = createMemoryStore(session);

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "amour-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  // Auth middleware to get current user
  async function getCurrentUser(req: any): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await storage.getUser(req.session.userId);
    return user || null;
  }

  // Require auth middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // ============ AUTH ROUTES ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  // ============ USER ROUTES ============

  // Get profiles (filtered by opposite gender)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get opposite gender
      const targetGender = currentUser.gender === "male" ? "female" : "male";
      
      const users = await storage.getUsersByGender(targetGender, currentUser.id);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // ============ LIKE ROUTES ============

  // Like a user
  app.post("/api/likes", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = insertLikeSchema.parse({
        ...req.body,
        likerId: currentUser.id,
      });

      // Check if already liked
      const alreadyLiked = await storage.hasLike(currentUser.id, data.likedId);
      if (alreadyLiked) {
        return res.status(400).json({ message: "Already liked this user" });
      }

      const like = await storage.createLike(data);

      // Check if it's a match (mutual like)
      const isMatch = await storage.hasLike(data.likedId, currentUser.id);
      
      res.json({ like, isMatch });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to like user" });
    }
  });

  // Get matches for current user
  app.get("/api/matches", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const matches = await storage.getMatches(currentUser.id);
      
      // Remove passwords from response
      const matchesWithoutPasswords = matches.map(({ password, ...user }) => user);
      
      res.json(matchesWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch matches" });
    }
  });

  // Get conversation with a specific user
  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { userId } = req.params;
      const conversation = await storage.getConversation(currentUser.id, userId);
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { receiverId, text, type = 'text' } = req.body;
      
      let messageData: any = {
        senderId: currentUser.id,
        receiverId,
        type,
      };

      if (type === 'image' && req.file) {
        // Handle image upload
        const imageUrl = `/uploads/${req.file.filename}`;
        messageData.imageUrl = imageUrl;
        messageData.text = text || ''; // Optional caption
      } else if (type === 'text' || type === 'emoji') {
        if (!text) {
          return res.status(400).json({ message: "Text is required for text/emoji messages" });
        }
        messageData.text = text;
      } else {
        return res.status(400).json({ message: "Invalid message type" });
      }

      const data = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(data);
      
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to send message" });
    }
  });

  // Get all conversations (list of user IDs with whom current user has exchanged messages)
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const partnerIds = await storage.getUserConversations(currentUser.id);
      
      // Get full user details for each partner
      const partners = await Promise.all(
        partnerIds.map(id => storage.getUser(id))
      );

      // Filter out undefined and remove passwords
      const validPartners = partners
        .filter((p): p is User => p !== undefined)
        .map(({ password, ...user }) => user);

      res.json(validPartners);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch conversations" });
    }
  });

  return httpServer;
}
