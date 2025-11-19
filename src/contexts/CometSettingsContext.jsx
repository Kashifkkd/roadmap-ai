"use client";

import React, { createContext, useContext, useState } from "react";

const CometSettingsContext = createContext();

export const useCometSettings = () => {
  const context = useContext(CometSettingsContext);
  if (!context) {
    throw new Error(
      "useCometSettings must be used within a CometSettingsProvider"
    );
  }
  return context;
};

export const CometSettingsProvider = ({ children }) => {
  const [isCometSettingsOpen, setIsCometSettingsOpen] = useState(false);

  return (
    <CometSettingsContext.Provider
      value={{ isCometSettingsOpen, setIsCometSettingsOpen }}
    >
      {children}
    </CometSettingsContext.Provider>
  );
};
