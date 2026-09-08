import type { Metadata } from "next";
import Link from "next/link";
import { mockListings } from "@/lib/mock/listings";

export const metadata: Metadata = {
  title: "My Listings",
};

const CURRENT_USER_ID = "user-101";

export default function Page() {
  const myListings = mockListings.filter(
    (listing) => listing.sellerId === CURRENT_USER_ID
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
            My Listings
          </h1>

          <p className="text-muted-foreground">
            Manage the items you have listed for sale.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Sell an Item
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <h2 className="font-heading text-xl font-semibold">
            No listings yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            You have not created any listings yet.
          </p>

          <Link
            href="/sell"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((listing) => (
            <div
              key={listing.listingId}
              className="rounded-xl border bg-card p-5"
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

                <div className="border-t pt-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status: {listing.status}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href={`/marketplace/${listing.listingId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    View
                  </Link>

                  <Link
                    href={`/listings/${listing.listingId}/edit`}
                    className="text-sm font-medium hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}