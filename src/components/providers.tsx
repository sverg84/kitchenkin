"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

export default function Providers({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      {children}
    </ThemeProvider>
  );
}
