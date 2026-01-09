import User from "../Modals/Auth.js";

// Plan configurations
const PLANS = {
  free: { name: "Free", price: 0, watchTimeMinutes: 5 },
  bronze: { name: "Bronze", price: 10, watchTimeMinutes: 7 },
  silver: { name: "Silver", price: 50, watchTimeMinutes: 10 },
  gold: { name: "Gold", price: 100, watchTimeMinutes: -1 }, // -1 = unlimited
};

// Send mock invoice email (logs to console)
const sendInvoiceEmail = (email, plan, amount, paymentId) => {
  const invoiceDate = new Date().toLocaleDateString("en-IN");
  const invoiceNumber = `INV-${Date.now()}`;
  
  console.log("\n========================================");
  console.log("📧 INVOICE EMAIL SENT!");
  console.log("========================================");
  console.log(`To: ${email}`);
  console.log(`Date: ${invoiceDate}`);
  console.log(`Invoice #: ${invoiceNumber}`);
  console.log("----------------------------------------");
  console.log(`Plan: ${plan.toUpperCase()}`);
  console.log(`Amount: ₹${amount}`);
  console.log(`Payment ID: ${paymentId}`);
  console.log(`Status: PAID ✓`);
  console.log("----------------------------------------");
  console.log("Thank you for your subscription!");
  console.log("========================================\n");
  
  return { invoiceNumber, invoiceDate };
};

// Get plan configuration
export const getPlanConfig = async (req, res) => {
  try {
    return res.status(200).json({ plans: PLANS });
  } catch (error) {
    console.error("Get plan config error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's subscription status
export const getSubscriptionStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = user.subscriptionPlan || "free";
    const planConfig = PLANS[plan];

    return res.status(200).json({
      subscriptionPlan: plan,
      planName: planConfig.name,
      watchTimeMinutes: planConfig.watchTimeMinutes,
      subscriptionUpdatedAt: user.subscriptionUpdatedAt,
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Upgrade subscription plan
export const upgradeSubscription = async (req, res) => {
  const { userId } = req.params;
  const { plan, paymentId } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in" });
    }

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    if (plan === "free") {
      return res.status(400).json({ message: "Cannot upgrade to free plan" });
    }

    const planConfig = PLANS[plan];

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: plan,
        subscriptionUpdatedAt: new Date(),
        isPremium: plan !== "free", // Keep backwards compatibility
        premiumSince: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send invoice email
    const invoice = sendInvoiceEmail(user.email, plan, planConfig.price, paymentId);

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${planConfig.name} plan!`,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        channelname: user.channelname,
        description: user.description,
        image: user.image,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionUpdatedAt: user.subscriptionUpdatedAt,
        isPremium: user.isPremium,
      },
      invoice: invoice,
      watchTimeMinutes: planConfig.watchTimeMinutes,
    });
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get watch time limit for user
export const getWatchTimeLimit = async (req, res) => {
  const { userId } = req.params;

  try {
    let watchTimeMinutes = PLANS.free.watchTimeMinutes; // Default to free

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const plan = user.subscriptionPlan || "free";
        watchTimeMinutes = PLANS[plan].watchTimeMinutes;
      }
    }

    return res.status(200).json({ watchTimeMinutes });
  } catch (error) {
    console.error("Get watch time limit error:", error);
    return res.status(500).json({ message: "Server error", watchTimeMinutes: 5 });
  }
};
