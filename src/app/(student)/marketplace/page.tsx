"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";
import { getListings } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";

export default function Page() {
  const router = useRouter();
  const { status } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    async function loadListings() {
      try {
        setLoadingListings(true);
        setError(null);

        const data = await getListings();
        setListings(data);
      } catch (err) {
        console.error("Failed to load listings:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load marketplace listings."
        );
      } finally {
        setLoadingListings(false);
      }
    }

    loadListings();
  }, [status]);

  const activeListings = listings.filter(
    (listing) => listing.status === "ACTIVE"
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
            Marketplace
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Browse and discover active listings from students on your campus.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Sell an Item
        </Link>
      </div>

      {loadingListings && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted-foreground">
            Loading marketplace...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loadingListings && !error && activeListings.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No active listings found.
          </p>
        </div>
      )}

      {!loadingListings && !error && activeListings.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeListings.map((listing) => (
            <Link
              key={listing.listingId}
              href={`/marketplace/${listing.listingId}`}
              className="rounded-xl border bg-card p-5 transition hover:shadow-md"
            >
              <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-muted text-4xl">
                📦
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold">
                    {listing.title}
                  </h2>

                  <span className="whitespace-nowrap font-semibold">
                    ₹{listing.price}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{listing.category}</span>
                  <span>{listing.condition}</span>
                </div>

                <div className="border-t pt-3 text-sm text-muted-foreground">
                  {listing.sellerName || "Campus Student"} ·{" "}
                  {listing.campusLocation || "VIT Vellore"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}