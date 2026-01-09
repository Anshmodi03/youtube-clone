import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };
  
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  // Email/Password sign in for testing (bypasses Firebase)
  const handleEmailPasswordSignin = async (email, password, name) => {
    try {
      // For testing purposes, we just need email and name
      // Password is not stored on backend, this is just for testing UI
      const payload = {
        email: email,
        name: name || email.split("@")[0],
        image: "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
      return { success: true };
    } catch (error) {
      console.error("Email sign in error:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Check localStorage first for email/password users
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, handlegooglesignin, handleEmailPasswordSignin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
