import express from "express";
import { 
  checkCanDownload, 
  recordDownload, 
  getDownloadHistory, 
  upgradeToPremium,
  getPremiumStatus 
} from "../controllers/download.js";

const router = express.Router();

// Check if user can download a video
router.post("/check/:videoId", checkCanDownload);

// Record a download
router.post("/:videoId", recordDownload);

// Get user's download history
router.get("/history/:userId", getDownloadHistory);

// Upgrade to premium (mock payment)
router.post("/premium/:userId", upgradeToPremium);

// Get premium status
router.get("/premium/:userId", getPremiumStatus);

export default router;
