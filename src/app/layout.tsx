import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Central School of Commerce - Typing Tests", // Fallback if a sub-page has no title defined
    template: "%s | Central School of Commerce", // If a page sets its title to "Dashboard", it renders as "Dashboard | Central School of Commerce"
  },
  description: "Master your typing skills with our professional typing test platform",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Tailwind arbitrary class for standard pointer + fallback SVG.
        Note: The underscores (_) convert into spaces in compiled CSS!
      */}
      <body className="min-h-full flex flex-col cursor-[url('/my-cursor.png'),_url('/my-cursor.svg'),_auto]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}