import Download from "../Modals/download.js";
import User from "../Modals/Auth.js";
import Video from "../Modals/video.js";

// Check if user can download (1 per day for free, unlimited for premium)
export const checkCanDownload = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in to download", canDownload: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", canDownload: false });
    }

    // Premium users can download unlimited
    if (user.isPremium) {
      return res.status(200).json({ canDownload: true, isPremium: true });
    }

    // Check if user already downloaded today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayDownloads = await Download.countDocuments({
      userId: userId,
      downloadedAt: { $gte: startOfDay }
    });

    if (todayDownloads >= 1) {
      return res.status(200).json({ 
        canDownload: false, 
        isPremium: false,
        message: "You've reached your daily download limit. Upgrade to Premium for unlimited downloads!"
      });
    }

    return res.status(200).json({ canDownload: true, isPremium: false });
  } catch (error) {
    console.error("Check download error:", error);
    return res.status(500).json({ message: "Server error", canDownload: false });
  }
};

// Record a download
export const recordDownload = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in to download" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check daily limit for non-premium users
    if (!user.isPremium) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const todayDownloads = await Download.countDocuments({
        userId: userId,
        downloadedAt: { $gte: startOfDay }
      });

      if (todayDownloads >= 1) {
        return res.status(403).json({ 
          message: "Daily limit reached. Upgrade to Premium!",
          needsPremium: true
        });
      }
    }

    // Record the download
    const download = new Download({
      userId: userId,
      videoId: videoId,
      downloadedAt: new Date()
    });
    await download.save();

    return res.status(200).json({ 
      success: true, 
      message: "Download recorded",
      videoPath: video.filepath
    });
  } catch (error) {
    console.error("Record download error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's download history
export const getDownloadHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in" });
    }

    const downloads = await Download.find({ userId: userId })
      .sort({ downloadedAt: -1 })
      .populate("videoId");

    const videosWithDownloadInfo = downloads
      .filter(d => d.videoId) // Filter out any null videoIds
      .map(d => ({
        ...d.videoId.toObject(),
        downloadedAt: d.downloadedAt
      }));

    return res.status(200).json({ downloads: videosWithDownloadInfo });
  } catch (error) {
    console.error("Get history error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mock Premium Upgrade
export const upgradeToPremium = async (req, res) => {
  const { userId } = req.params;
  const { paymentId } = req.body; // Mock payment ID

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in" });
    }

    // In a real implementation, you would verify the payment with Razorpay here
    // For mock, we just accept any paymentId

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isPremium: true, 
        premiumSince: new Date() 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Upgraded to Premium successfully!",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        channelname: user.channelname,
        description: user.description,
        image: user.image,
        isPremium: user.isPremium,
        premiumSince: user.premiumSince
      }
    });
  } catch (error) {
    console.error("Premium upgrade error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's premium status
export const getPremiumStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Please sign in" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      isPremium: user.isPremium,
      premiumSince: user.premiumSince
    });
  } catch (error) {
    console.error("Get premium status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
