/**
 * Get city name from IP address using ipapi.co (free service)
 * @param {string} ip - IP address
 * @returns {Promise<string>} - City name
 */
export const getCityFromIP = async (ip) => {
  try {
    // Handle localhost/development IPs - always get user's public IP
    const isLocalIP = 
      ip === "127.0.0.1" || 
      ip === "::1" || 
      ip === "localhost" || 
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip === "::ffff:127.0.0.1";

    if (isLocalIP) {
      // For local development, get location based on public IP
      const response = await fetch("https://ipapi.co/json/", {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error("Geolocation API error:", response.status);
        return "Local";
      }
      
      const data = await response.json();
      console.log("Geolocation data for local user:", data.city, data.country);
      return data.city || "Local";
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error("Geolocation API error:", response.status);
      return "Unknown";
    }
    
    const data = await response.json();
    console.log("Geolocation data:", data.city, data.country);
    return data.city || "Unknown";
  } catch (error) {
    console.error("Geolocation error:", error.message);
    return "Local";
  }
};

/**
 * Extract client IP from request
 * @param {object} req - Express request object
 * @returns {string} - Client IP address
 */
export const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "127.0.0.1";
  
  console.log("Client IP detected:", ip);
  return ip;
};
