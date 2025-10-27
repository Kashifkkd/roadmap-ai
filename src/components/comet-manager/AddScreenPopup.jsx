"use client";

import React from "react";
import { X } from "lucide-react";

export default function AddScreenPopup({
  isOpen,
  onClose,
  onAddScreen,
  screenTypes,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add New Screen
              </h2>
              <p className="text-gray-600 mt-1">
                Choose the type of screen you want to add
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {screenTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onAddScreen(type)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${type.color} hover:scale-105`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 text-gray-700">{type.icon}</div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {type.name}
                  </h3>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
