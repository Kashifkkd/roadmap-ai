"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

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
      <LoginForm open={isOpen} onOpenChange={handleOpenChange} />
    </div>
  );
}
