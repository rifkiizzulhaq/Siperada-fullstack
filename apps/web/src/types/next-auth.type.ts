import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: { id: number; name: string }[];
    } & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }

  interface User {
    role: string;
    permissions: { id: number; name: string }[];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: { id: number; name: string }[];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
