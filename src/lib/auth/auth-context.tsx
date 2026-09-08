"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  signOut as cognitoSignOut,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";

import type { User, UserRole } from "@/types/user";

export interface AuthContextType {
  status: "loading" | "authenticated" | "unauthenticated";
  user: User | null;

  signIn: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<void>;

  signUp: (input: {
    name: string;
    email: string;
    password: string;
    campus?: string;
  }) => Promise<void>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const [user, setUser] = useState<User | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const cognitoUser = await getCurrentUser();

      const attributes = await fetchUserAttributes();

      const appUser: User = {
        userId: cognitoUser.userId,
        email: attributes.email || "",
        name:
          attributes.name ||
          attributes.email?.split("@")[0] ||
          "CampusMart User",

        role: "STUDENT",

        campus: "VIT Vellore",

        status: "ACTIVE",

        createdAt: new Date().toISOString(),
      };

      setUser(appUser);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      _role: UserRole = "STUDENT"
    ) => {
      const result = await cognitoSignIn({
        username: email,
        password,
      });

      if (!result.isSignedIn) {
        throw new Error(
          `Sign-in requires additional step: ${result.nextStep.signInStep}`
        );
      }

      await loadUser();
    },
    [loadUser]
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      campus?: string;
    }) => {
      await cognitoSignUp({
        username: input.email,
        password: input.password,

        options: {
          userAttributes: {
            email: input.email,
            name: input.name,
          },
        },
      });
    },
    []
  );

  const signOut = useCallback(async () => {
    await cognitoSignOut();

    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}