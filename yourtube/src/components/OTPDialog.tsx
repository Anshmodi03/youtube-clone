import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Smartphone } from "lucide-react";

interface OTPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (success: boolean) => void;
  verificationType: "email" | "mobile";
  email?: string;
  mobile?: string;
}

const OTPDialog: React.FC<OTPDialogProps> = ({
  isOpen,
  onClose,
  onVerify,
  verificationType,
  email,
  mobile,
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mockOtp, setMockOtp] = useState("");

  // Generate mock OTP when dialog opens
  useEffect(() => {
    if (isOpen) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
      setOtp("");
      setError("");
      console.log("Mock OTP generated:", generatedOtp);
    }
  }, [isOpen]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate OTP verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otp === mockOtp) {
      onVerify(true);
    } else {
      setError("Invalid OTP. Please try again.");
    }
    
    setIsLoading(false);
  };

  const isEmailType = verificationType === "email";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Verify OTP
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* OTP sent indicator */}
          <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {isEmailType ? (
              <>
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  OTP sent to your email: {email}
                </span>
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  OTP sent to your mobile number
                </span>
              </>
            )}
          </div>

          {/* Mock OTP display for testing */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
              <strong>Test Mode:</strong> Your OTP is <span className="font-mono text-lg font-bold">{mockOtp}</span>
            </p>
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {isEmailType
              ? "Check your email inbox for the OTP"
              : "Check your SMS messages for the OTP"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPDialog;
