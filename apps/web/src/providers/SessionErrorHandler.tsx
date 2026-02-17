"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signOut();
    }
  }, [session?.error, session]);

  return null;
}