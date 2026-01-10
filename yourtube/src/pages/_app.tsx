import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { LocationProvider } from "../lib/LocationContext";
import { ThemeProvider } from "../lib/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LocationProvider>
      <ThemeProvider>
        <UserProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <title>Your-Tube Clone</title>
            <Header />
            <Toaster />
            <div className="flex">
              <Sidebar />
              <Component {...pageProps} />
            </div>
          </div>
        </UserProvider>
      </ThemeProvider>
    </LocationProvider>
  );
}
