"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginFormWrapper({ isOpen, onOpenChange }) {
  return <LoginForm open={isOpen} onOpenChange={onOpenChange} />;
}

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = (open) => {
    setIsOpen(open);
    // If dialog is closed on login page, redirect to home
    if (!open) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#363636] p-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      }>
        <LoginFormWrapper isOpen={isOpen} onOpenChange={handleOpenChange} />
      </Suspense>
    </div>
  );
}
