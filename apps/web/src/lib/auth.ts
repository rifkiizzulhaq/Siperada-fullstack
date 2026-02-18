import NextAuth, { CredentialsSignin, Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

class CustomAuthError extends CredentialsSignin {
  code = "custom_error"; 

  constructor(message: string) {
    super();
    this.code = message;
    this.message = message;
  }
}

type RefreshTokenResult = 
  | { accessToken: string; refreshToken: string; expiresAt: number }
  | { error: string };

let refreshPromise: Promise<RefreshTokenResult> | null = null;
const refreshedTokens = new Map<string, { result: RefreshTokenResult, timestamp: number }>();

async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
  const cached = refreshedTokens.get(refreshToken);
  if (cached && Date.now() - cached.timestamp < 10000) { 
    return cached.result;
  }

  if (refreshPromise) {
     return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/refresh", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken }),
      });
      
      if (!res.ok) throw new Error("Failed to refresh");
      const data = await res.json();

      if (!data.data || !data.data.accessToken || !data.data.refreshToken) {
        throw new Error("Invalid refresh token response structure");
      }
      
      const newTokens = {
        accessToken: data.data.accessToken, 
        refreshToken: data.data.refreshToken, 
        expiresAt: Date.now() + 15 * 60 * 1000,
      };
      refreshedTokens.set(refreshToken, { result: newTokens, timestamp: Date.now() });
      
      return newTokens;
    } catch (error) {
      return { error: `RefreshTokenError ${error}` };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch("http://localhost:3000/api/v1/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            const errorMessage = Array.isArray(data.message) 
              ? data.message[0] 
              : data.message;
            throw new CustomAuthError(errorMessage);
          }

          return {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: data.data.user.role.name,
            permissions: data.data.user.permissions,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          };

        } catch (error: unknown) {
          if (error instanceof CustomAuthError) {
            throw error;
          }
          throw new CustomAuthError("Terjadi kesalahan koneksi ke server");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        return {
          ...token,
          id: user.id ?? "",
          role: user.role,
          permissions: user.permissions,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: Date.now() + 15 * 60 * 1000,
        }
      }

      if (token.error) {
        return token;
      }

      const shouldRefresh = token.expiresAt && Date.now() > token.expiresAt;
      
      if (shouldRefresh && token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        
        if ("error" in refreshed) {
          return { ...token, error: refreshed.error };
        }
        
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
          error: undefined,
        };
      }

      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
});