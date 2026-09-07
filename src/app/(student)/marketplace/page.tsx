import type { Metadata } from "next";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = {
  title: "Marketplace",
};

export default async function Page() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">Marketplace</h1>
        <p className="max-w-2xl text-muted-foreground">Browse and search active campus listings.</p>

      </div>
      <EmptyState
        title="Coming soon"
        description="This page structure is in place. Marketplace functionality will be implemented in a later phase."
      />
    </div>
  );
}
