"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenManager } from "@/lib/api-client";
import { ClientAccessGuard } from "@/components/auth/ClientAccessGuard";

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const auth = tokenManager.isAuthenticated();
      setIsAuthenticated(auth);
      setIsLoading(false);

      if (!auth) {
        const redirectPath = encodeURIComponent(pathname);
        router.push(`/login?redirect=${redirectPath}`);
      }
    };

    checkAuth();
  }, [router, pathname]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }

  // Once auth passes, gate access on whether the user's selected client is
  // still visible in Kyper. This blocks direct-URL hits to /cycle-manager,
  // /configure-cycle, /cycles, etc. for clients that 1st90 has just hidden.
  return <ClientAccessGuard>{children}</ClientAccessGuard>;
}

