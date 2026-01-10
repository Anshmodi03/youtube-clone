import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useUser } from "@/lib/AuthContext";
import { useLocation } from "@/lib/LocationContext";
import { Mail, Lock, User } from "lucide-react";
import OTPDialog from "./OTPDialog";

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInDialog = ({ isOpen, onClose }: SignInDialogProps) => {
  const { handlegooglesignin, handleEmailPasswordSignin } = useUser();
  const { isSouthIndianLocation, state, loading: locationLoading } = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
  // OTP verification state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingSignIn, setPendingSignIn] = useState<{
    email: string;
    password: string;
    name: string;
    isGoogle: boolean;
  } | null>(null);

  const getVerificationType = (): "email" | "mobile" => {
    return isSouthIndianLocation ? "email" : "mobile";
  };

  const handleOTPVerified = async (success: boolean) => {
    if (success && pendingSignIn) {
      setShowOTPDialog(false);
      
      if (pendingSignIn.isGoogle) {
        try {
          await handlegooglesignin();
          onClose();
        } catch (err) {
          setError("Google sign in failed");
        }
      } else {
        const result = await handleEmailPasswordSignin(
          pendingSignIn.email,
          pendingSignIn.password,
          pendingSignIn.name
        );
        if (result.success) {
          onClose();
          setEmail("");
          setPassword("");
          setName("");
        } else {
          setError(result.error || "Sign in failed");
        }
      }
      setPendingSignIn(null);
    }
    setIsLoading(false);
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    
    // Wait for location if still loading
    if (locationLoading) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    console.log("Sign in - Location:", { isSouthIndianLocation, state });
    console.log("OTP Type:", getVerificationType());
    
    // Trigger OTP verification
    setPendingSignIn({ email: "", password: "", name: "", isGoogle: true });
    setShowOTPDialog(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    // Wait for location if still loading
    if (locationLoading) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    console.log("Sign in - Location:", { isSouthIndianLocation, state });
    console.log("OTP Type:", getVerificationType());
    
    // Trigger OTP verification
    setPendingSignIn({ email, password, name, isGoogle: false });
    setShowOTPDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen && !showOTPDialog} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Location indicator */}
            {!locationLoading && (
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                📍 Detected: {state || "Unknown"} | 
                OTP via: {isSouthIndianLocation ? "📧 Email" : "📱 Mobile"}
              </div>
            )}

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleGoogleClick}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  (Password is optional for testing)
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <OTPDialog
        isOpen={showOTPDialog}
        onClose={() => {
          setShowOTPDialog(false);
          setPendingSignIn(null);
          setIsLoading(false);
        }}
        onVerify={handleOTPVerified}
        verificationType={getVerificationType()}
        email={pendingSignIn?.email || email}
      />
    </>
  );
};

export default SignInDialog;

