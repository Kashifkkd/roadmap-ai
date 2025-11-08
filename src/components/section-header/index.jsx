import React from "react";

export default function SectionHeader({ title, children }) {
  return (
    <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-primary-50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <h4
          className="text-[24px]  text-[#574EB6]"
          style={{
            fontFamily: "Noto Serif",
          }}
        >
          {title}
        </h4>
      </div>
      {children && (
        <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
