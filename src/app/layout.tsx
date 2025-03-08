import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ApolloProvider } from "@/lib/graphql/client/apollo-provider";
import { SessionProvider } from "next-auth/react";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme-provider";

const quicksand = Quicksand({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning={true}>
      <body className={quicksand.className}>
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          <SessionProvider>
            <ApolloProvider>
              <NextTopLoader color="#ff7b54" height={6} showSpinner={false} />
              <header className="border-b">
                <div className="mx-auto flex items-center justify-between px-4 py-4 max-w-7xl">
                  <Link href="/" className="text-2xl font-bold">
                    KitchenKin
                  </Link>
                  <UserMenu />
                </div>
              </header>
              {children}
            </ApolloProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
