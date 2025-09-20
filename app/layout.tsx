import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggleButton } from "@/components/ui/mode-toggle";

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
          <Toaster />
          {children}
          <div className="fixed bottom-2 right-2 cursor-pointer z-50">
            <ThemeToggleButton start="bottom-right" blur={true} variant="circle-blur" />
          </div>
        </ThemeProvider>
        {/* <div
          className="fixed top-0 left-0 h-[100vh] w-[100vw] border-8 border-secondary dark:brightness-60 brightness-98 z-10 pointer-events-none"
        />
        <div
          className="fixed top-0 left-0 h-[100vh] w-[100vw] border-8 border-secondary dark:brightness-60 brightness-98 rounded-4xl z-10 pointer-events-none"
        /> */}
        {/* <div className="fixed inset-0 pointer-events-none z-2">
          <div
            className="absolute inset-x-0 top-0 h-6 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, var(--background), transparent)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to top, var(--background), transparent)',
            }}
          />
        </div> */}
      </body>
    </html>
  );
}
