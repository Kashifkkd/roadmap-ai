"use client";

import CometManagerLayout from "@/components/comet-manager/CometManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CometManagerPage() {
  return (
    <ProtectedRoute>
      <CometManagerLayout />
    </ProtectedRoute>
  );
}
