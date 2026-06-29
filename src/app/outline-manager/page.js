"use client";

import OutlineManagerLayout from "@/components/outline-manager/OutlineManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

export default function OutlineManagerPage() {
  return (
    <ProtectedRoute>
      <RouteErrorBoundary routeName="outline-manager">
        <OutlineManagerLayout />
      </RouteErrorBoundary>
    </ProtectedRoute>
  );
}
