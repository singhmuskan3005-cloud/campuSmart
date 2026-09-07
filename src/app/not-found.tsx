import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="font-label-caps text-xs text-secondary tracking-widest uppercase mb-2">
        404 — Page Not Found
      </span>
      <h1 className="font-headline-lg text-4xl sm:text-5xl text-on-background mb-4">
        Lost in the library?
      </h1>
      <p className="font-body-lg text-on-surface-variant max-w-md mb-8">
        The page or listing you are looking for does not exist or has been moved.
      </p>
      <Link href="/marketplace">
        <Button variant="default" className="gap-2">
          Back to marketplace
        </Button>
      </Link>
    </div>
  );
}
