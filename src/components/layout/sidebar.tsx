"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: "dashboard" },
    { href: "/admin/listings", label: "Listings", icon: "inventory_2" },
    { href: "/admin/reports", label: "Reports", icon: "flag" },
    { href: "/admin/users", label: "Users", icon: "group" },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant/30 hidden lg:flex flex-col py-6 px-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="mb-6 px-3">
        <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
          Admin Portal
        </span>
      </div>
      <nav className="flex flex-col gap-1 font-button-text text-sm">
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-on-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-outline-variant/20 px-3">
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Switch to Marketplace</span>
        </Link>
      </div>
    </aside>
  );
}
