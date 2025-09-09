import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Providers } from "./providers";

const custom = Geist_Mono({
  variable: "--font-custom",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Qalam",
  description: "Crafted by Ayush Singh",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${custom.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
            <ModeToggle />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
