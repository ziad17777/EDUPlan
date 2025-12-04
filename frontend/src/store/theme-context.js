import React, { createContext, useContext } from "react";

const ThemeProviderContext = createContext({
  theme: "light",  // default theme
  setTheme: () => {},
});

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeProviderContext };
