"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("VIT Vellore");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await signUp({ name: fullName, email, password, campus });
      setSuccess(true);
      setTimeout(() => {
        router.push("/marketplace");
      }, 1200);
    } catch {
      setError("Account creation failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1 font-headline-sm text-2xl font-bold text-primary italic mb-2">
            CampusMart <span className="font-mono text-xs not-italic text-tertiary">AI</span>
          </div>
          <span className="block font-label-caps text-xs text-secondary tracking-widest uppercase mb-1">
            Join CampusMart
          </span>
          <h1 className="font-headline-md text-3xl font-semibold text-on-background">
            Create student account
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2">
            Join your verified university community to buy and sell on campus.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/30 border border-error/20 rounded-lg flex items-center gap-2 text-error text-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-primary-container/30 border border-primary/20 rounded-lg flex items-center gap-2 text-on-primary-container text-xs">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Account created successfully! Redirecting to marketplace...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
            />
          </div>

          <div>
            <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="email">
              College Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu or .ac.in"
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
            />
          </div>

          <div>
            <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="campus">
              College / Campus
            </label>
            <select
              id="campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="VIT Vellore">VIT Vellore</option>
              <option value="VIT Chennai">VIT Chennai</option>
              <option value="State University">State University</option>
              <option value="Other Campus">Other University</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
              />
            </div>
            <div>
              <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-sm text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/40"
              />
            </div>
          </div>

          <div className="text-[11px] text-on-surface-variant/70 pt-1">
            Must be at least 8 characters with upper, lower, and numeric characters.
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-sm font-button-text gap-2 mt-4"
          >
            {loading ? "Creating account..." : "Complete Registration"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant border-t border-outline-variant/20 pt-4">
          <span>Already registered? </span>
          <Link href="/login" className="text-secondary font-medium hover:text-primary transition-colors underline underline-offset-4">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
