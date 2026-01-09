import express from "express";
import {
  getPlanConfig,
  getSubscriptionStatus,
  upgradeSubscription,
  getWatchTimeLimit,
} from "../controllers/subscription.js";

const router = express.Router();

// Get all plan configurations
router.get("/plans", getPlanConfig);

// Get user's subscription status
router.get("/status/:userId", getSubscriptionStatus);

// Upgrade user's subscription
router.post("/upgrade/:userId", upgradeSubscription);

// Get watch time limit for a user
router.get("/watchtime/:userId", getWatchTimeLimit);

export default router;
