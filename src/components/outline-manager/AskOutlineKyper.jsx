"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Grid3x3,
  Lightbulb,
  Zap,
  Search,
  ArrowUp,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Stars from "@/components/icons/Stars";

export default function AskOutlineKyper({
  focusedField,
  fieldPosition,
  onClose,
  onAskKyper,
  onPopupInteract,
  isLoading = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const popupRef = useRef(null);

  // Reset the state whenever the popup reopens 
  useEffect(() => {
    setIsExpanded(false);
    setQuery("");
  }, [focusedField]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!focusedField) return;

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsExpanded(false);
        setQuery("");
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [focusedField, onClose]);

  const position = useMemo(() => {
    if (!fieldPosition) {
      return { bottom: "1.5rem", right: "1.5rem" };
    }

    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;

    let left = fieldPosition.left;
    const popupWidth = 450;
    if (left + popupWidth > viewportWidth) {
      left = viewportWidth - popupWidth - 20;
    }

    let top = fieldPosition.top;
    const popupHeight = isExpanded ? 100 : 60;
    if (top + popupHeight > viewportHeight) {
      top = fieldPosition.top - popupHeight - 20;
      if (top < 20) {
        top = 20;
      }
    }

    if (left < 20) {
      left = 20;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  }, [fieldPosition, isExpanded]);

  if (!focusedField) return null;

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      await onAskKyper(query);
      setQuery("");
      setIsExpanded(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery("");
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 animate-in slide-in-from-bottom-4"
      style={position}
      onMouseEnter={(e) => {
        e.stopPropagation();
        if (onPopupInteract) onPopupInteract();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (onPopupInteract) onPopupInteract();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-100 rounded-2xl shadow-2xl border border-gray-200 min-w-[450px] transition-all duration-200">
        {!isExpanded && (
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Options"
              >
                <GripVertical className="w-5 h-5 text-gray-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
                title="Suggestions"
              >
                <Lightbulb className="w-5 h-5 text-gray-600" />
                {/* <Zap className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" fill="currentColor" /> */}
              </button>
            </div>

            <Button
              onClick={handleExpand}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors flex-1"
            >
              <Stars width={18} height={18} />
              <span className="font-semibold">Ask Kyper</span>
              <Stars width={18} height={18} />
            </Button>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="p-3">
            <div className="relative">
              <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setQuery("");
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Back"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => onPopupInteract?.()}
                    disabled={isLoading}
                    placeholder="Ask me anything..."
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
