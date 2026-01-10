import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

// South Indian states list
const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

// Helper function to check if location is South India
export const isSouthIndia = (state) => {
  if (!state) return false;
  return SOUTH_INDIAN_STATES.includes(state.toLowerCase());
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState({
    state: null,
    city: null,
    country: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Using free IP geolocation API
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        console.log("Location detected:", data);
        
        setUserLocation({
          state: data.region || null,
          city: data.city || null,
          country: data.country_name || null,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Location detection failed:", error);
        // Default to non-South India on error
        setUserLocation({
          state: null,
          city: null,
          country: null,
          loading: false,
          error: "Could not detect location",
        });
      }
    };

    detectLocation();
  }, []);

  const isSouthIndianLocation = isSouthIndia(userLocation.state);

  return (
    <LocationContext.Provider value={{ ...userLocation, isSouthIndianLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
