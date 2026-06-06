import React from "react";

export default function SectionHeader({ title, children, titleSlot }) {
  return (
    <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-2 bg-primary-50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {titleSlot ??
          (title ? (
            <h4 className="text-[24px] font-medium text-[#574EB6] font-serif">
              {title}
            </h4>
          ) : null)}
      </div>
      {children && (
        <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
