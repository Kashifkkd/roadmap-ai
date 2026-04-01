import CreateComet from "@/components/create-comet";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CreateCometPage() {
  return (
    <ProtectedRoute>
      <CreateComet />
    </ProtectedRoute>
  );
}
