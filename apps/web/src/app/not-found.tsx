import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { FrownIcon, ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="container flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <FrownIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          404
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h2>
        <p className="text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been muted, renamed, or doesn&apos;t exist.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
