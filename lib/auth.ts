import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUserByEmail } from "@/services/users.service";

type GoogleClientSecretsFile = {
  web?: {
    client_id?: string;
    client_secret?: string;
  };
};

type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

function getCredentialsFromEnv(): GoogleCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

function getCredentialsFromClientSecretFile(): GoogleCredentials | null {
  const root = process.cwd();
  const explicitPath = process.env.GOOGLE_CLIENT_SECRET_FILE;
  const candidateFiles = explicitPath
    ? [path.resolve(root, explicitPath)]
    : fs
        .readdirSync(root)
        .filter((fileName) => /^client_secret_.*\.json$/i.test(fileName))
        .map((fileName) => path.join(root, fileName));

  for (const filePath of candidateFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as GoogleClientSecretsFile;
      const clientId = parsed.web?.client_id;
      const clientSecret = parsed.web?.client_secret;

      if (clientId && clientSecret) {
        return { clientId, clientSecret };
      }
    } catch {
      // Try next candidate file.
    }
  }

  return null;
}

function loadGoogleCredentials(): GoogleCredentials {
  const fromEnv = getCredentialsFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  const fromFile = getCredentialsFromClientSecretFile();
  if (fromFile) {
    return fromFile;
  }

  throw new Error(
    "Google OAuth credentials not found. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET or provide client_secret_*.json in the project root.",
  );
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
