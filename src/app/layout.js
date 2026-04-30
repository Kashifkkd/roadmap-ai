"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono, Noto_Serif, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { usePathname } from "next/navigation";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import { CometSettingsProvider } from "@/contexts/CometSettingsContext";
import { Toaster } from "@/components/ui/toast";
import QueryProvider from "@/providers/QueryProvider";
import CloudfrontCookieManager from "@/components/auth/CloudfrontCookieManager";

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

const APP_NAME = "Kyper Studio";

const getCycleDisplayTitle = (sessionData) => {
  if (!sessionData || typeof sessionData !== "object") return "";
  const basicInfo = sessionData?.cycle_creation_data?.["Basic Information"];
  return (
    basicInfo?.["Cycle Title"] ||
    basicInfo?.["Comet Title"] ||
    (typeof sessionData?.cometTitle === "string" ? sessionData.cometTitle : "") ||
    ""
  );
};

const getTitleForPathname = (pathname, cycleTitle = "") => {
  const cycleSuffix = cycleTitle ? ` - ${cycleTitle}` : "";
  const staticTitles = {
    "/": APP_NAME,
    "/about": `About - ${APP_NAME}`,
    "/contact": `Contact - ${APP_NAME}`,
    "/login": `Login - ${APP_NAME}`,
    "/register": `Register - ${APP_NAME}`,
    "/cycles": `All Cycles - ${APP_NAME}`,
    "/chat": `Chat - ${APP_NAME}`,
    "/dashboard": `Dashboard${cycleSuffix} - ${APP_NAME}`,
    "/create-cycle": `Create Cycle - ${APP_NAME}`,
    "/create-comet": `Create Cycle - ${APP_NAME}`,
    "/configure-cycle": `Configure Cycle${cycleSuffix} - ${APP_NAME}`,
    "/outline-manager": `Outline Manager${cycleSuffix} - ${APP_NAME}`,
    "/cycle-manager": `Cycle Manager${cycleSuffix} - ${APP_NAME}`,
    "/comet-manager": `Cycle Manager${cycleSuffix} - ${APP_NAME}`,
  };

  return staticTitles[pathname] || APP_NAME;
};

function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDocumentTitle = () => {
      let cycleTitle = "";
      try {
        const raw = localStorage.getItem("sessionData");
        const parsed = raw ? JSON.parse(raw) : null;
        cycleTitle = getCycleDisplayTitle(parsed);
      } catch {
        cycleTitle = "";
      }
      document.title = getTitleForPathname(pathname, cycleTitle);
    };

    updateDocumentTitle();
    window.addEventListener("storage", updateDocumentTitle);
    window.addEventListener("sessionDataChanged", updateDocumentTitle);
    window.addEventListener("sessionIdChanged", updateDocumentTitle);

    // Keep title in sync even when sessionData is updated without events.
    const syncIntervalId = window.setInterval(updateDocumentTitle, 300);

    return () => {
      window.removeEventListener("storage", updateDocumentTitle);
      window.removeEventListener("sessionDataChanged", updateDocumentTitle);
      window.removeEventListener("sessionIdChanged", updateDocumentTitle);
      window.clearInterval(syncIntervalId);
    };
  }, [pathname]);

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
      <head>
        <link rel="icon" href="/fav.svg" type="image/svg+xml" />
      </head>
      <body
        className={`font-sans ${notoSerif.variable} ${inter.variable} antialiased 
        h-[100vh] w-[100vw]`}
      >
        <QueryProvider>
          <CloudfrontCookieManager />
          <PreviewModeProvider>
            <CometSettingsProvider>
              <LayoutContent>{children}</LayoutContent>
              <Toaster />
            </CometSettingsProvider>
          </PreviewModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
