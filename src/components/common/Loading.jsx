import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading({ isOpen, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-900">
          {message || "Generating your outline..."}
        </p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </div>
    </div>
  );
}
