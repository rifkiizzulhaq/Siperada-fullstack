import { Geist, Geist_Mono } from "next/font/google";
import { NextProgress } from "@/src/providers/ProgressProvider";
import QueryProvider from "@/src/providers/QueryProvider";

import "@workspace/ui/globals.css";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { ThemeProvider } from "@/src/components/darkmode/theme-provider";
import { AuthProvider } from "@/src/providers/AuthProvider";
import { SessionErrorHandler } from "@/src/providers/SessionErrorHandler";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SessionErrorHandler />
            <QueryProvider>
              <TooltipProvider>
                <NextProgress>{children}</NextProgress>
              </TooltipProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
