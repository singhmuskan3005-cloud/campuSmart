import { fetchAuthSession } from "aws-amplify/auth";
import type { Listing } from "@/types/listing";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function getListings(): Promise<Listing[]> {
  const session = await fetchAuthSession();

  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("User is not authenticated.");
  }

  const response = await fetch(`${API_URL}/listings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listings.");
  }

  const data = await response.json();

  return data.items;
}