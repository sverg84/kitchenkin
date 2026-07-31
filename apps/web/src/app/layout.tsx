import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Providers } from "@/app/providers";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import Brand from "./brand";

const quicksand = Quicksand({
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "KitchenKin",
  description: "A delicious collection of recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <Providers>
          <NextTopLoader color="#ff7b54" height={6} showSpinner={false} />
          <header className="border-b">
            <div className="mx-auto flex items-center justify-between px-4 py-4 max-w-7xl">
              <Link
                href="/"
                className="flex gap-x-2 items-center text-2xl font-bold"
              >
                <Brand />
                KitchenKin
              </Link>
              <UserMenu />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
