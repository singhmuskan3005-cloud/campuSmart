import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      title="Not found"
      description="This resource could not be found."
      action={
        <Button nativeButton={false} render={<Link href="/marketplace" />}>
          Back to marketplace
        </Button>
      }
    />
  );
}
