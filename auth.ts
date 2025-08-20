import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import RedditProvider from "next-auth/providers/reddit";
import SendgridProvider from "next-auth/providers/sendgrid";
import CustomPrismaAdapter from "@/lib/prisma/adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: CustomPrismaAdapter,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "database",
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
