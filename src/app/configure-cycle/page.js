import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ConfigureCyclePage() {
  return (
    <ProtectedRoute>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <Suspense>
        <DashboardLayout />
      </Suspense>
    </ProtectedRoute>
  );
}
