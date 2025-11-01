"use client";

import React, { createContext, useContext, useState } from "react";

const PreviewModeContext = createContext();

export function PreviewModeProvider({ children }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <PreviewModeContext.Provider value={{ isPreviewMode, setIsPreviewMode }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error("usePreviewMode must be used within a PreviewModeProvider");
  }
  return context;
}
