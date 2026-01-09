import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Crown, Check, Loader2, CreditCard, Shield, Zap } from "lucide-react";

interface PremiumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

const PremiumDialog: React.FC<PremiumDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"info" | "payment" | "success">("info");
  
  // Random pricing between 99 and 499
  const [price] = useState(() => {
    const prices = [99, 149, 199, 249, 299, 349, 399, 449, 499];
    return prices[Math.floor(Math.random() * prices.length)];
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep("payment");
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock payment success
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setPaymentStep("success");
    setIsProcessing(false);
    
    // Wait a bit to show success, then complete
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSuccess(mockPaymentId);
  };

  const handleClose = () => {
    setPaymentStep("info");
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            {paymentStep === "success" ? "Welcome to Premium!" : "Upgrade to Premium"}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === "info" && "Unlock unlimited video downloads and more!"}
            {paymentStep === "payment" && "Processing your payment..."}
            {paymentStep === "success" && "Your payment was successful!"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "info" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited video downloads</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Ad-free experience</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Download in HD quality</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
              <Shield className="w-3 h-3" />
              <span>Secure payment powered by Razorpay</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePayment} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ₹{price}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === "payment" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600">Please wait while we process your payment...</p>
            <p className="text-xs text-gray-400 mt-2">Do not close this window</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Payment Successful!</p>
            <p className="text-sm text-gray-600 mt-1">You now have unlimited downloads</p>
            <div className="flex items-center gap-1 text-yellow-600 mt-3">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Active</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
