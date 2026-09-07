import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline-variant/20 pb-8">
          <div>
            <span className="font-headline-sm text-xl text-primary font-bold italic">
              CampusMart AI
            </span>
            <p className="text-xs text-on-surface-variant mt-1">
              Curated, trusted student marketplace powered by AWS serverless architecture.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 font-label-caps text-xs text-on-surface-variant">
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/sell" className="hover:text-primary transition-colors">
              Sell
            </Link>
            <Link href="/wishlist" className="hover:text-primary transition-colors">
              Wishlist
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant/60 font-body-sm">
          <p>© {new Date().getFullYear()} CampusMart AI. Exclusively for college students.</p>
          <p className="font-mono text-[11px]">Strictly Serverless • Built on AWS</p>
        </div>
      </div>
    </footer>
  );
}
