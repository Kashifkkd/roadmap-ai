import React from "react";

/**
 * SectionHeader Component - Responsive section header with title and optional children
 *
 * Responsive improvements:
 * - Padding scales from mobile (px-3) to desktop (px-6)
 * - Title text scales smoothly using clamp() for responsive font sizing
 * - Flexbox layout wraps on small screens for better mobile experience
 * - Gap spacing adapts to screen size
 */
export default function SectionHeader({ title, children }) {
  return (
    <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-primary-50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <h1
          className="font-serif font-bold text-primary-700"
          style={{
            fontSize: "clamp(1rem, 4vw, 1.25rem)",
            lineHeight: "1.5",
          }}
        >
          {title}
        </h1>
      </div>
      {children && (
        <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
