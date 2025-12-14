import type { User, InsertUser, Message, InsertMessage } from "@shared/schema";

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

  getConversations: async (): Promise<Omit<User, "password">[]> => {
    return fetchAPI("/conversations");
  },
};
