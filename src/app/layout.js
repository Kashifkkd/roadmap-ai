"use client";

import { Geist, Geist_Mono, Noto_Serif, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { usePathname } from "next/navigation";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="flex flex-col h-full  overflow-hidden">{children}</div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 bg-gray-50 overflow-y-auto h-full w-full">
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${notoSerif.variable} ${inter.variable} antialiased 
        h-[100vh] w-[100vw]`}
      >
        <PreviewModeProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </PreviewModeProvider>
      </body>
    </html>
  );
}
