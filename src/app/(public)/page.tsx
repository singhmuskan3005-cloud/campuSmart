import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const categories = [
    { name: "Textbooks", icon: "menu_book", count: "140+ listings", href: "/marketplace?category=Textbooks" },
    { name: "Electronics", icon: "devices", count: "85+ listings", href: "/marketplace?category=Electronics" },
    { name: "Hostel Essentials", icon: "bed", count: "60+ listings", href: "/marketplace?category=Hostel%20Essentials" },
    { name: "Bicycles & Commute", icon: "pedal_bike", count: "30+ listings", href: "/marketplace?category=Bicycles" },
    { name: "Lab Gear & Calculators", icon: "calculate", count: "45+ listings", href: "/marketplace?category=Other" },
  ];

  const features = [
    {
      title: "Verified Student Network",
      description: "Only students with verified campus email addresses can join, trade, and message.",
      icon: "verified_user",
    },
    {
      title: "Zero Shipping Hassle",
      description: "Meet directly at campus spots—library, food court, or hostel gates. No courier charges.",
      icon: "handshake",
    },
    {
      title: "Circular Campus Economy",
      description: "Pass on textbooks and essentials to junior batches, keep money within your student community.",
      icon: "recycling",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Editorial Hero Section */}
      <section className="relative px-4 sm:px-8 max-w-7xl mx-auto py-16 sm:py-24 overflow-hidden w-full">
        {/* Decorative blur elements */}
        <div className="absolute top-10 left-10 w-[280px] h-[280px] bg-secondary-container/40 pastel-circle pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[360px] h-[360px] bg-primary-container/30 pastel-circle pointer-events-none" />

        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          <div className="md:col-span-7 flex flex-col items-start gap-6">
            <span className="font-label-caps text-xs text-secondary tracking-widest uppercase bg-secondary-fixed/50 px-3 py-1 rounded-full">
              Exclusively for College Students
            </span>
            <h1 className="font-headline-lg text-4xl sm:text-5xl lg:text-6xl text-on-background font-bold tracking-tight leading-[1.15]">
              Your campus. <br />
              <span className="italic font-normal text-primary">Your marketplace.</span>
            </h1>
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Buy and sell textbooks, electronics, hostel essentials, lab gear, and everyday items safely within your university campus community.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/marketplace">
                <Button variant="default" size="lg" className="px-6 py-5 text-sm font-button-text gap-2 shadow-sm">
                  Browse Marketplace
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="px-6 py-5 text-sm font-button-text gap-2 bg-surface hover:bg-surface-container">
                  Sell an Item
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs text-on-surface-variant/70 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" /> Verified Campus Identity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" /> Hand-to-Hand Exchange
              </span>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/40" />
                  <div className="w-3 h-3 rounded-full bg-secondary/40" />
                  <div className="w-3 h-3 rounded-full bg-tertiary/40" />
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider">
                  CAMPUS HIGHLIGHTS
                </span>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">menu_book</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">Engineering Mathematics 44th Ed.</div>
                    <div className="text-xs text-on-surface-variant">Aarav S. • VIT Vellore</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">₹450</div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">headphones</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">Noise Cancelling Headphones</div>
                    <div className="text-xs text-on-surface-variant">Rohan M. • Block D</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">₹1,800</div>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">light</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-on-surface truncate">Adjustable LED Study Lamp</div>
                    <div className="text-xs text-on-surface-variant">Priya K. • Ladies Hostel</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">₹350</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-surface-container-low/40 border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
                Browse by Category
              </span>
              <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface font-semibold mt-1">
                Everything for academic & campus life
              </h2>
            </div>
            <Link href="/marketplace" className="text-xs font-button-text text-primary hover:underline flex items-center gap-1">
              Explore all categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="bg-surface border border-outline-variant/30 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group flex flex-col justify-between h-36"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-on-surface group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why CampusMart Features */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase">
            Designed for Campus
          </span>
          <h2 className="font-headline-lg text-3xl sm:text-4xl text-on-surface font-semibold mt-2">
            Why students choose CampusMart
          </h2>
          <p className="text-on-surface-variant font-body-md text-sm sm:text-base mt-3">
            A frictionless alternative to chaotic social media groups and scam-prone public marketplaces.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="bg-surface border border-outline-variant/30 rounded-2xl p-8 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-[26px]">{feat.icon}</span>
              </div>
              <h3 className="font-headline-sm text-xl text-on-surface font-medium mb-3">
                {feat.title}
              </h3>
              <p className="text-on-surface-variant font-body-sm text-sm leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & CTA Section */}
      <section className="bg-surface-container-low border-t border-outline-variant/30 py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-headline-lg text-3xl sm:text-4xl text-on-surface font-semibold">
            Ready to declutter or find campus bargains?
          </h2>
          <p className="font-body-lg text-on-surface-variant text-base sm:text-lg max-w-xl mx-auto">
            Join thousands of verified students buying and selling textbooks, tech, and hostel gear today.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/signup">
              <Button size="lg" className="px-8 font-button-text">
                Create Free Account
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="px-8 font-button-text bg-surface">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
