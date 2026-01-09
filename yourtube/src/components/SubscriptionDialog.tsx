import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Crown, Check, Loader2, CreditCard, Shield } from "lucide-react";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: string, paymentId: string) => void;
  currentPlan?: string;
}

const PLANS = [
  {
    id: "bronze",
    name: "Bronze",
    price: 10,
    watchTime: "7 minutes",
    color: "from-amber-600 to-amber-700",
    bgColor: "from-amber-50 to-orange-50",
    borderColor: "border-amber-300",
  },
  {
    id: "silver",
    name: "Silver",
    price: 50,
    watchTime: "10 minutes",
    color: "from-gray-400 to-gray-500",
    bgColor: "from-gray-50 to-slate-100",
    borderColor: "border-gray-300",
    popular: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 100,
    watchTime: "Unlimited",
    color: "from-yellow-400 to-yellow-500",
    bgColor: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-300",
  },
];

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlan = "free",
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "payment" | "success">("select");

  const handlePayment = async (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan.id);
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
    onSuccess(plan.id, mockPaymentId);
  };

  const handleClose = () => {
    setPaymentStep("select");
    setSelectedPlan(null);
    setIsProcessing(false);
    onClose();
  };

  const getPlanRank = (plan: string) => {
    const ranks: Record<string, number> = { free: 0, bronze: 1, silver: 2, gold: 3 };
    return ranks[plan] || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            {paymentStep === "success" ? "Upgrade Complete!" : "Choose Your Plan"}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === "select" && "Unlock more watch time with our subscription plans"}
            {paymentStep === "payment" && "Processing your payment..."}
            {paymentStep === "success" && "Your subscription has been activated!"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "select" && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {PLANS.map((plan) => {
                const isCurrentOrLower = getPlanRank(plan.id) <= getPlanRank(currentPlan);
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg p-4 border-2 transition-all ${
                      isCurrentOrLower
                        ? "opacity-50 cursor-not-allowed bg-gray-100"
                        : `bg-gradient-to-r ${plan.bgColor} ${plan.borderColor} hover:shadow-md cursor-pointer`
                    } ${plan.popular ? "ring-2 ring-blue-400" : ""}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-4 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${plan.color}`}
                          ></span>
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Watch videos for <strong>{plan.watchTime}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₹{plan.price}</div>
                        <Button
                          size="sm"
                          disabled={isCurrentOrLower}
                          onClick={() => handlePayment(plan)}
                          className={`mt-1 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
                        >
                          {isCurrentOrLower ? "Current/Lower" : "Upgrade"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 justify-center pt-2">
              <Shield className="w-3 h-3" />
              <span>Secure payment • Invoice sent to email</span>
            </div>

            <p className="text-center text-sm text-gray-500">
              Current plan: <strong className="capitalize">{currentPlan}</strong>
              {currentPlan === "free" && " (5 min watch time)"}
            </p>
          </div>
        )}

        {paymentStep === "payment" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600">Processing payment for {selectedPlan?.toUpperCase()} plan...</p>
            <p className="text-xs text-gray-400 mt-2">Do not close this window</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Payment Successful!</p>
            <p className="text-sm text-gray-600 mt-1">
              You're now on the <strong className="capitalize">{selectedPlan}</strong> plan
            </p>
            <p className="text-xs text-gray-500 mt-2">📧 Invoice sent to your email</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
