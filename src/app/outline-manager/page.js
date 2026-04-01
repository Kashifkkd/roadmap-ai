"use client";

import OutlineManagerLayout from "@/components/outline-manager/OutlineManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function OutlineManagerPage() {
  return (
    <ProtectedRoute>
      <OutlineManagerLayout />
    </ProtectedRoute>
  );
}
