"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, UserRole } from "@/types/user";

export interface AuthContextType {
  status: "loading" | "authenticated" | "unauthenticated";
  user: User | null;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string; campus?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default user for seamless preview/testing: student Aarav Sharma from VIT Vellore
const DEFAULT_STUDENT_USER: User = {
  userId: "user-101",
  email: "aarav.sharma@vit.ac.in",
  name: "Aarav Sharma",
  role: "STUDENT",
  campus: "VIT Vellore",
  status: "ACTIVE",
  profile: {
    major: "Electronics & Communication",
    hostel: "Block C",
    bio: "ECE Senior passionate about robotics, embedded systems, and reading.",
    year: "4th Year",
  },
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for saved session (for testing/preview)
    const stored = typeof window !== "undefined" ? localStorage.getItem("campusmart_user") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setStatus("authenticated");
      } catch {
        setUser(DEFAULT_STUDENT_USER);
        setStatus("authenticated");
      }
    } else {
      // Default to authenticated student for interactive preview
      setUser(DEFAULT_STUDENT_USER);
      setStatus("authenticated");
    }
  }, []);

  const signIn = useCallback(async (email: string, _password: string, role: UserRole = "STUDENT") => {
    const newUser: User = {
      userId: role === "ADMIN" ? "admin-001" : "user-101",
      email,
      name: role === "ADMIN" ? "Admin Moderator" : email.split("@")[0].replace(".", " "),
      role,
      campus: "VIT Vellore",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setStatus("authenticated");
    if (typeof window !== "undefined") {
      localStorage.setItem("campusmart_user", JSON.stringify(newUser));
    }
  }, []);

  const signUp = useCallback(async (input: { name: string; email: string; password: string; campus?: string }) => {
    const newUser: User = {
      userId: `user-${Date.now()}`,
      email: input.email,
      name: input.name,
      role: "STUDENT",
      campus: input.campus || "VIT Vellore",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setStatus("authenticated");
    if (typeof window !== "undefined") {
      localStorage.setItem("campusmart_user", JSON.stringify(newUser));
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined") {
      localStorage.removeItem("campusmart_user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
