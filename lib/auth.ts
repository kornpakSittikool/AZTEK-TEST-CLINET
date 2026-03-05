import "server-only";

import { createHash } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUserByEmail } from "@/services/users.service";

type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

function loadGoogleCredentials(): GoogleCredentials {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth credentials not found. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.",
    );
  }

  return { clientId, clientSecret };
}

const googleCredentials = loadGoogleCredentials();

const configuredSecret = process.env.NEXTAUTH_SECRET;
if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("NEXTAUTH_SECRET is required in production.");
}

const fallbackSecret = createHash("sha256")
  .update(`${googleCredentials.clientId}:${googleCredentials.clientSecret}`)
  .digest("hex");

export const authOptions: NextAuthOptions = {
  secret: configuredSecret ?? fallbackSecret,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: googleCredentials.clientId,
      clientSecret: googleCredentials.clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        await upsertUserByEmail(user.email);

        return true;
      } catch (error) {
        console.error("Failed to upsert user on sign-in", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return `${baseUrl}/dashboard`;
    },
  },
};
