import React from "react";

export default function SectionHeader({ title, children }) {
  return (
    <div className="px-6 py-2 bg-primary-50 rounded-md flex justify-between items-center">
      <div className="flex items-center gap-2 text-xl">
        <h1 className="font-serif font-bold text-primary-700">{title}</h1>
      </div>
      {children}
    </div>
  );
}
