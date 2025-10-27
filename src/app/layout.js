"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="flex flex-col h-full overflow-hidden">{children}</div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-[80px]">
      <Header />
      <div className="flex-1 bg-gray-50 overflow-y-auto">{children}</div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
