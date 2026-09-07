export type ListingStatus = "ACTIVE" | "EXPIRED" | "REMOVED" | "FLAGGED";
export type ListingCondition = "Brand New" | "Like New" | "Good" | "Fair";

export interface Listing {
  listingId: string;
  sellerId: string;
  sellerName?: string;
  sellerCampus?: string;
  sellerAvatar?: string;
  sellerRating?: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ListingCondition | string;
  images: string[];
  campusLocation?: string;
  status: ListingStatus;
  createdAt: string;
  expiresAt: string;
  updatedAt?: string;
}

export interface ListingFilters {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  campus?: string;
  status?: ListingStatus | "ALL";
  mine?: boolean;
  cursor?: string;
  limit?: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  campusLocation?: string;
  images: string[];
}

export type UpdateListingInput = Partial<CreateListingInput>;
