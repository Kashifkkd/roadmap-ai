import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <Suspense>
      <DashboardLayout />
    </Suspense>
  );
}
