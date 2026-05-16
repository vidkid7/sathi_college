import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});

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
  providers: [
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error custom field
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-expect-error custom field
      session.user.role = token.role;
      return session;
    }
  }
};
