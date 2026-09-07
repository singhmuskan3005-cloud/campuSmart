import type { Metadata } from "next";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function Page() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">Notifications</h1>
        <p className="max-w-2xl text-muted-foreground">Stay up to date with marketplace activity.</p>

      </div>
      <EmptyState
        title="Coming soon"
        description="This page structure is in place. Marketplace functionality will be implemented in a later phase."
      />
    </div>
  );
}
