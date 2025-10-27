import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen bg-gray-50 mt-20">
      <ChatWindow context="dashboard" />
    </div>
  );
}
