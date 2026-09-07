import type { Metadata } from "next";
import { EmptyState } from "@/components/feedback/empty-state";

interface PageProps {
  params: Promise<{ listingId: string } | { threadId: string }>;
}


export const metadata: Metadata = {
  title: "Edit Listing",
};

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  const resourceId = "listingId" in resolved ? resolved.listingId : resolved.threadId;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">Edit Listing</h1>
        <p className="max-w-2xl text-muted-foreground">Update your listing details and images.</p>
          <p className="text-sm text-muted-foreground">Resource ID: {resourceId}</p>
      </div>
      <EmptyState
        title="Coming soon"
        description="This page structure is in place. Marketplace functionality will be implemented in a later phase."
      />
    </div>
  );
}
