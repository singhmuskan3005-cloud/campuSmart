import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockListings } from "@/lib/mock/listings";

export const metadata: Metadata = {
  title: "Listing Details",
};

interface PageProps {
  params: Promise<{
    listingId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { listingId } = await params;

  const listing = mockListings.find(
    (item) => item.listingId === listingId
  );

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href="/marketplace"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Marketplace
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-6xl">
          📦
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-heading text-3xl font-semibold">
                {listing.title}
              </h1>

              <span className="text-2xl font-bold">
                ₹{listing.price}
              </span>
            </div>

            <div className="flex gap-3 text-sm text-muted-foreground">
              <span>{listing.category}</span>
              <span>•</span>
              <span>{listing.condition}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-lg font-semibold">
              Description
            </h2>

            <p className="text-muted-foreground">
              {listing.description}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-heading text-lg font-semibold">
              Seller
            </h2>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>{listing.sellerName}</p>
              <p>{listing.sellerCampus}</p>
            </div>
          </div>

          <Link
            href="/messages"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Contact Seller
          </Link>
        </div>
      </div>
    </div>
  );
}