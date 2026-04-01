import ChatWindow from "@/components/chat/ChatWindow";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-50 mt-20">
        <ChatWindow context="dashboard" />
      </div>
    </ProtectedRoute>
  );
}
