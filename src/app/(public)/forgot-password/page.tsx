"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1 font-headline-sm text-2xl font-bold text-primary italic mb-2">
            CampusMart <span className="font-mono text-xs not-italic text-tertiary">AI</span>
          </div>
          <span className="block font-label-caps text-xs text-secondary tracking-widest uppercase mb-1">
            Account Recovery
          </span>
          <h1 className="font-headline-md text-3xl font-semibold text-on-background">
            Reset password
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2">
            Enter your institutional email address and we&apos;ll send instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
            </div>
            <h3 className="font-headline-sm text-lg font-medium text-on-surface">
              Check your university inbox
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto">
              We have sent a verification code to <span className="font-semibold text-on-surface">{email}</span>. Follow the link in the email to set a new password.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body-sm text-xs font-medium text-on-surface-variant mb-1" htmlFor="email">
                College Email address
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-5 text-sm font-button-text gap-2 mt-2"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>

            {/* Trust box */}
            <div className="mt-6 p-4 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed/40 flex items-start gap-3 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0 mt-0.5">
                shield
              </span>
              <div>
                <span className="font-medium text-on-surface block mb-0.5">Secure recovery</span>
                Password reset tokens are time-limited and can only be used with official university email accounts.
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/20 pt-4">
              <Link href="/login" className="text-secondary font-medium hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
