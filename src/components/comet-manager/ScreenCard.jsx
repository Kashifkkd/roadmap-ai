"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Expand } from "lucide-react";

export default function ScreenCard({
  screen,
  selectedScreen,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
  onAddScreen,
}) {
  const [showAddButton, setShowAddButton] = useState(false);

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
        onClick={() => onClick(screen)}
        onMouseEnter={() => setShowAddButton(true)}
        onMouseLeave={() => setShowAddButton(false)}
        className={`rounded-lg p-1.5 sm:p-2 flex flex-col justify-between items-center gap-1 sm:gap-2 text-xs
          min-w-[100px] sm:min-w-[140px] max-w-[140px] sm:max-w-[180px] shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-gray-400
          ${
            selectedScreen?.id === screen.id ? "bg-primary-700" : "bg-gray-100 "
          }
        `}
      >
        <div className="w-full flex justify-between items-center gap-2 text-xs">
          <div className="flex justify-between items-center gap-1 w-full">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-start gap-2  font-medium  w-full ${
                  selectedScreen?.id === screen.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {screen.name} {index + 1}
              </div>
              <div className="text-start w-full">
                <p
                  className={`text-base font-semibold ${
                    selectedScreen?.id === screen.id
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {screen.title}
                </p>
              </div>
              <img
                src="/screen-preview.png"
                alt=""
                className={`${
                  selectedScreen?.id === screen.id
                    ? "w-[100px] h-[140px] sm:w-[140px] sm:h-[200px]"
                    : "w-[80px] h-[110px] sm:w-[110px] sm:h-[150px]"
                }`}
              />
            </div>
          </div>
        </div>
        <div className=" w-full flex justify-between items-center">
          <Expand
            size={16}
            className={`cursor-grab active:cursor-grabbing ${
              selectedScreen?.id === screen.id ? "text-white" : "text-gray-500"
            }`}
          />
          <div
            className={`p-1 rounded ${
              selectedScreen?.id === screen.id
                ? "bg-primary-800"
                : "bg-background"
            }`}
          >
            <GripVertical
              size={16}
              className={`cursor-grab active:cursor-grabbing ${
                selectedScreen?.id === screen.id
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Add button that appears between cards */}
      {showAddButton && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddScreen(index + 1);
            }}
            className="border border-gray-300 hover:bg-gray-100 bg-white text-black rounded-full p-2 shadow-lg transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
