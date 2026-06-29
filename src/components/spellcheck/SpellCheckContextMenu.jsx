"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SpellCheckContextMenu({
  open,
  loading,
  position,
  word,
  suggestions,
  onSelect,
  onIgnore,
  onClose,
}) {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useLayoutEffect(() => {
    if (!open) {
      setAdjustedPosition(position);
      return;
    }

    const menu = menuRef.current;
    if (!menu) {
      setAdjustedPosition(position);
      return;
    }

    const rect = menu.getBoundingClientRect();
    const padding = 8;
    let x = position.x;
    let y = position.y;

    if (x + rect.width > window.innerWidth - padding) {
      x = Math.max(padding, window.innerWidth - rect.width - padding);
    }

    if (y + rect.height > window.innerHeight - padding) {
      y = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    setAdjustedPosition({ x, y });
  }, [open, position, suggestions.length, word, loading]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Spelling suggestions"
      className="fixed z-[99999] min-w-[200px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-xl"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="border-b border-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
        Spelling suggestions
      </div>
      {loading ? (
        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
      ) : suggestions.length > 0 ? (
        suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            role="menuitem"
            className="block w-full px-3 py-1.5 text-left text-sm text-gray-900 hover:bg-primary-50 hover:text-primary-700"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">No suggestions found</div>
      )}
      {onIgnore ? (
        <button
          type="button"
          role="menuitem"
          className="block w-full border-t border-gray-100 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onIgnore}
        >
          Ignore &quot;{word}&quot;
        </button>
      ) : null}
      <div className="border-t border-gray-100 px-3 py-1.5 text-xs text-gray-400">
        {word}
      </div>
    </div>,
    document.body
  );
}
