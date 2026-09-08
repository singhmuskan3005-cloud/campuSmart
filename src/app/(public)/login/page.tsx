"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("aarav.sharma@vit.ac.in");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError(null);
  setLoading(true);

  try {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    await signIn(email, password, role);

    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/marketplace");
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Login failed.";

    setError(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Brand & Titles */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1 font-headline-sm text-2xl font-bold text-primary italic mb-2">
            CampusMart <span className="font-mono text-xs not-italic text-tertiary">AI</span>
          </div>
          <span className="block font-label-caps text-xs text-secondary tracking-widest uppercase mb-1">
            Welcome Back
          </span>
          <h1 className="font-headline-md text-3xl font-semibold text-on-background">
            Sign in to CampusMart
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2">
            Access your curated campus marketplace with your university account.
          </p>
        </div>

        {/* Demo Role Switcher for seamless Pair Programming testability */}
        <div className="mb-6 p-2 bg-surface-container-low rounded-xl flex items-center gap-2 border border-outline-variant/20 text-xs">
          <span className="font-label-caps text-[10px] text-on-surface-variant px-2">Role:</span>
          <button
            type="button"
            onClick={() => {
              setRole("STUDENT");
              setEmail("aarav.sharma@vit.ac.in");
            }}
            className={`flex-1 py-1.5 rounded-lg font-button-text transition-colors ${
              role === "STUDENT"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("ADMIN");
              setEmail("admin@campusmart.edu");
            }}
            className={`flex-1 py-1.5 rounded-lg font-button-text transition-colors ${
              role === "ADMIN"
                ? "bg-secondary text-on-secondary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/30 border border-error/20 rounded-lg flex items-center gap-2 text-error text-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="email">
              University Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="font-body-sm text-xs font-medium text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-secondary hover:text-primary transition-colors underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-sm font-button-text gap-2 mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In as {role === "ADMIN" ? "Admin" : "Student"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant border-t border-outline-variant/20 pt-4">
          <span>New to CampusMart? </span>
          <Link href="/signup" className="text-secondary font-medium hover:text-primary transition-colors underline underline-offset-4">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
