import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ApolloProvider } from "@/lib/graphql/client/apollo-provider";
import { SessionProvider } from "next-auth/react";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipe App",
  description: "A delicious collection of recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ApolloProvider>
            <NextTopLoader color="#007700" height={6} showSpinner={false} />
            <header className="border-b">
              <div className="mx-auto flex items-center justify-between px-4 py-4 max-w-7xl">
                <Link href="/" className="text-2xl font-bold">
                  Recipe App
                </Link>
                <UserMenu />
              </div>
            </header>
            {children}
          </ApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
