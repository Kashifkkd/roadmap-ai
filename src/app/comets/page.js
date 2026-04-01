import AllComet from "@/components/comets/page";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CometsPage() {
  return (
    <ProtectedRoute>
      <AllComet />
    </ProtectedRoute>
  );
}

