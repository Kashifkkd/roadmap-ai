import AllComet from "@/components/cycles/page";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CometsPage() {
  return (
    <ProtectedRoute>
      <AllComet />
    </ProtectedRoute>
  );
}

