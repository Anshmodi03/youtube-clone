import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "./LocationContext";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { isSouthIndianLocation, loading } = useLocation();
  const [theme, setTheme] = useState("dark"); // Default to dark

  useEffect(() => {
    if (loading) return;

    const calculateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // White theme: South India AND 10 AM to 12 PM (10:00-11:59)
      const isWhiteThemeTime = hour >= 10 && hour < 12;
      
      console.log("Theme calculation:", {
        hour,
        isSouthIndianLocation,
        isWhiteThemeTime,
        shouldBeLight: isSouthIndianLocation && isWhiteThemeTime,
      });

      if (isSouthIndianLocation && isWhiteThemeTime) {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    calculateTheme();

    // Recalculate theme every minute to handle time changes
    const interval = setInterval(calculateTheme, 60000);
    return () => clearInterval(interval);
  }, [isSouthIndianLocation, loading]);

  // Apply theme to document root
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    console.log("Theme applied:", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
