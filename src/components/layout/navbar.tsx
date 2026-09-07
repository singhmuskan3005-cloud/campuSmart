"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "public" | "student" | "admin";
}

export function Navbar({ variant = "student" }: NavbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentLinks = [
    { href: "/marketplace", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/listings", label: "My Listings" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/messages", label: "Messages" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/listings", label: "Listings" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/users", label: "Users" },
  ];

  const links = variant === "admin" ? adminLinks : studentLinks;

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-colors">
      <div className="flex justify-between items-center h-16 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={variant === "public" ? "/" : variant === "admin" ? "/admin" : "/marketplace"}
            className="flex items-center gap-1.5"
          >
            <span className="font-headline-sm text-2xl font-bold tracking-tight text-primary italic">
              CampusMart
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-container text-tertiary font-bold tracking-wider">
              AI
            </span>
          </Link>
          {variant === "admin" && (
            <span className="text-[11px] font-label-caps bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        {variant !== "public" ? (
          <nav className="hidden md:flex items-center gap-6 font-button-text text-sm">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/marketplace" && link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-200 py-1 ${
                    isActive
                      ? "text-primary font-semibold border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 font-button-text text-sm">
            <Link href="/marketplace" className="text-on-surface-variant hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/sell" className="text-on-surface-variant hover:text-primary transition-colors">
              Sell
            </Link>
          </nav>
        )}

        {/* Trailing Actions */}
        <div className="hidden md:flex items-center gap-4">
          {variant === "public" ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-button-text">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="font-button-text">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              {variant === "student" && (
                <Link
                  href="/notifications"
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors relative"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
                </Link>
              )}
              <Link
                href={variant === "admin" ? "/admin" : "/profile"}
                className="flex items-center gap-2 p-1 pl-2 pr-3 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors border border-outline-variant/30 text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-button-text text-xs">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="font-medium text-xs max-w-[100px] truncate">
                  {user?.name || (variant === "admin" ? "Admin" : "Student")}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-xs text-on-surface-variant hover:text-error"
              >
                Sign out
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface px-4 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          {variant !== "public" ? (
            <div className="flex flex-col gap-3 font-button-text">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {variant === "student" && (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Settings
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-outline-variant/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-error border-error/20"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 font-button-text">
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-primary text-on-primary text-center rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
