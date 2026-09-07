"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/auth/use-auth";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [status, user, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar variant="student" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
          <LoadingSkeleton variant="grid" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="student" />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">{children}</main>
      <Footer />
    </div>
  );
}
