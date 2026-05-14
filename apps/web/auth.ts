import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import RedditProvider from "next-auth/providers/reddit";
import SendgridProvider from "next-auth/providers/sendgrid";
import { createCustomPrismaAdapter } from "@kk/db/auth-adapter";
import { webBearer } from "@/lib/auth/web-bearer-service";
import { getRedis } from "@/lib/redis";

const adapter = createCustomPrismaAdapter({ getRedis });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "database",
  },
  events: {
    async signOut(message) {
      if ("session" in message && message.session?.sessionToken) {
        await webBearer.revokeWebBearersForSession(
          message.session.sessionToken,
        );
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider,
    RedditProvider,
    SendgridProvider({
      from: "no-reply@kitchenkin.app",
    }),
  ],
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
});
