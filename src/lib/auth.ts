import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { clearRateLimit, getClientIp, rateLimit } from "./security";
import { z } from "zod";

const SESSION_MAX_AGE = 60 * 60 * 4;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 20 * 60 * 1000;
const LOGIN_LIMIT = 5;
const dummyPasswordHash = bcrypt.hashSync("sathicollege-invalid-password", 10);
const secureCookies = process.env.NEXTAUTH_URL
  ? process.env.NEXTAUTH_URL.startsWith("https://")
  : process.env.NODE_ENV === "production";
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const hasGoogleConfig = Boolean(
  googleClientId &&
  googleClientSecret &&
  googleClientId !== "..." &&
  googleClientSecret !== "..." &&
  googleClientId.endsWith(".apps.googleusercontent.com") &&
  googleClientSecret.length > 20
);

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(creds, req) {
      const parsed = credentialsSchema.safeParse(creds);
      if (!parsed.success) return null;

      const email = parsed.data.email.toLowerCase();
      const ip = getClientIp(req);
      const limiterKey = `login:${ip}:${email}`;
      const allowed = rateLimit(limiterKey, {
        limit: LOGIN_LIMIT,
        windowMs: LOGIN_WINDOW_MS,
        blockMs: LOGIN_BLOCK_MS
      });
      if (!allowed.ok) return null;

      const user = await db.user.findUnique({ where: { email } });
      const ok = await bcrypt.compare(parsed.data.password, user?.password ?? dummyPasswordHash);
      if (!user || !ok) return null;
      clearRateLimit(limiterKey);
      return { id: user.id, email: user.email, name: user.name ?? user.email, role: user.role } as any;
    }
  })
];

if (hasGoogleConfig) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE, updateAge: 15 * 60 },
  jwt: { maxAge: SESSION_MAX_AGE },
  useSecureCookies: secureCookies,
  cookies: {
    sessionToken: {
      name: secureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: secureCookies,
        maxAge: SESSION_MAX_AGE
      }
    }
  },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;
      await db.user.upsert({
        where: { email: user.email.toLowerCase() },
        update: { name: user.name ?? user.email },
        create: {
          email: user.email.toLowerCase(),
          name: user.name ?? user.email,
          role: "USER"
        }
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = user.email ? await db.user.findUnique({ where: { email: user.email.toLowerCase() } }) : null;
        token.id = dbUser?.id || (user as any).id;
        token.email = dbUser?.email || user.email;
        token.name = dbUser?.name || user.name;
        token.role = (user as any).role || dbUser?.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string | undefined;
      session.user.email = (token.email as string | undefined) || session.user.email;
      session.user.name = (token.name as string | undefined) || session.user.name;
      session.user.role = (token.role as any) || "USER";
      return session;
    }
  }
};
