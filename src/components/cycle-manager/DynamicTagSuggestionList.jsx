"use client";

import { createPortal } from "react-dom";

export function DynamicTagSuggestionList({ menu, onSelect }) {
  if (!menu || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[9999] min-w-[200px] rounded-lg border border-[#D5D7DA] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
      style={{ top: menu.top, left: menu.left }}
      role="listbox"
      aria-label="Dynamic email tags"
      onMouseDown={(e) => e.preventDefault()}
    >
      {menu.items.map((tag, index) => (
        <button
          key={tag}
          type="button"
          role="option"
          aria-selected={index === menu.activeIndex}
          className={`block w-full px-3 py-1.5 text-left text-sm font-medium ${
            index === menu.activeIndex
              ? "bg-[#F1F0FE] text-[#7367F0]"
              : "text-[#181D27] hover:bg-gray-50"
          }`}
          onClick={() => onSelect(tag)}
        >
          {tag}
        </button>
      ))}
    </div>,
    document.body
  );
}
