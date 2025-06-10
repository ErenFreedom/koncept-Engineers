import React, { createContext, useContext, useState } from "react";

const MODES = {
  ENGINEERING: "engineering",
  OPERATIONAL: "operational",
};

const ModeContext = createContext({
  mode: MODES.ENGINEERING,
  setMode: () => {},
});

// Custom hook to access context
export const useMode = () => useContext(ModeContext);

// Context provider
export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || MODES.ENGINEERING;
  });

  const updateMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: updateMode, MODES }}>
      {children}
    </ModeContext.Provider>
  );
};
