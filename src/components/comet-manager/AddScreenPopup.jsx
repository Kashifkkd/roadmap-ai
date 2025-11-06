"use client";

import React from "react";
import { X } from "lucide-react";

export default function AddScreenPopup({
  isOpen,
  onClose,
  onAddScreen,
  screenTypes,
  screenTypeGroups,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-2">
          <div className="flex justify-between items-center ">
            <div>
              <h2 className="text-xl font-bold text-gray-900 ">
                Add New Screen
              </h2>
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
          {Array.isArray(screenTypeGroups) && screenTypeGroups.length > 0 ? (
            <div className="space-y-6">
              {screenTypeGroups.map((group) => (
                <div key={group.group}>
                  <div className="text-sm font-semibold text-gray-800 bg-gray-100 rounded px-3 py-2 mb-3">
                    {group.group}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {group.items.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => onAddScreen(type)}
                        className={`p-2 transition-all hover:shadow-md hover:scale-105`}
                      >
                        <div className="flex flex-row items-center text-left">
                          <div
                            className={`mb-2 text-gray-700 ${type.color} rounded-xl py-2 px-1 mr-2`}
                          >
                            {type.icon}
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {type.name}
                            </h3>
                            <p className="text-xs font-medium">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(screenTypes || []).map((type) => (
                <button
                  key={type.id}
                  onClick={() => onAddScreen(type)}
                  className={`p-4 transition-all hover:shadow-md  hover:scale-105`}
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
          )}
        </div>
      </div>
    </div>
  );
}
