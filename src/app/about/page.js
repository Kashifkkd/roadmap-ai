"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(100%_120%_at_50%_100%,rgba(115,103,240,0.70)_0%,rgba(255,255,255,1)_60%)] flex items-start justify-center px-4 pt-32">
      <div className="text-center space-y-6 max-w-md">
        {/* <Image src="/logo.png" alt="Kyper Logo" width={140} height={64} className="mx-auto" /> */}
        <h1 className="text-3xl font-semibold text-primary-900 font-serif">About Us</h1>
        <p className="text-gray-500 text-base">
          This page is currently unavailable. We're working on it and will be back soon.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
