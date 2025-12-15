import type { User, InsertUser, Message, InsertMessage, Like, InsertLike } from "@shared/schema";

const API_BASE = "/api";

async function fetchAPI(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (data: InsertUser): Promise<Omit<User, "password">> => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string): Promise<Omit<User, "password">> => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<void> => {
    return fetchAPI("/auth/logout", { method: "POST" });
  },

  getCurrentUser: async (): Promise<Omit<User, "password">> => {
    return fetchAPI("/auth/me");
  },
};

// Users API
export const usersAPI = {
  getProfiles: async (): Promise<Omit<User, "password">[]> => {
    return fetchAPI("/users");
  },
};

// Messages API
export const messagesAPI = {
  getConversation: async (userId: string): Promise<Message[]> => {
    return fetchAPI(`/messages/${userId}`);
  },

  sendMessage: async (data: Omit<InsertMessage, "senderId">): Promise<Message> => {
    return fetchAPI("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  sendImageMessage: async (receiverId: string, imageFile: File, caption?: string): Promise<Message> => {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('image', imageFile);
    formData.append('type', 'image');
    if (caption) {
      formData.append('text', caption);
    }

    const response = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  sendEmojiMessage: async (receiverId: string, emoji: string): Promise<Message> => {
    return fetchAPI("/messages", {
      method: "POST",
      body: JSON.stringify({
        receiverId,
        text: emoji,
        type: 'emoji',
      }),
    });
  },

  getConversations: async (): Promise<Omit<User, "password">[]> => {
    return fetchAPI("/conversations");
  },
};

// Likes API
export const likesAPI = {
  likeUser: async (likedId: string): Promise<{ like: Like; isMatch: boolean }> => {
    return fetchAPI("/likes", {
      method: "POST",
      body: JSON.stringify({ likedId }),
    });
  },
};

// Matches API
export const matchesAPI = {
  getMatches: async (): Promise<Omit<User, "password">[]> => {
    return fetchAPI("/matches");
  },
};
