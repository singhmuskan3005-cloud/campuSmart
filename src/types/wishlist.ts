import type { Listing } from "./listing";

export interface WishlistItem {
  userId: string;
  listingId: string;
  addedAt: string;
  listing?: Listing;
}
