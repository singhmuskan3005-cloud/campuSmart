"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/auth/use-auth";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar variant="admin" />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 sm:p-8">
            <LoadingSkeleton variant="table" />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="admin" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
