import { create } from "zustand";
import type { CreateListingInput, Listing } from "@/types/listing";
import { mockListings } from "@/lib/mock/listings";

const CURRENT_USER_ID = "user-101";

interface ListingStore {
  listings: Listing[];
  addListing: (input: CreateListingInput) => void;
}

export const useListingStore = create<ListingStore>((set) => ({
  listings: mockListings,

  addListing: (input) => {
    const now = new Date();

    const newListing: Listing = {
      listingId: `listing-${Date.now()}`,
      sellerId: CURRENT_USER_ID,
      sellerName: "Aarav Sharma",
      sellerCampus: "VIT Vellore",
      title: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      condition: input.condition,
      images: input.images,
      campusLocation: "VIT Vellore",
      status: "ACTIVE",
      createdAt: now.toISOString(),
      expiresAt: new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    set((state) => ({
      listings: [...state.listings, newListing],
    }));
  },
}));