import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../server/.env" });

// External video URLs - these are sample public videos (5+ minutes each)
const externalVideos = [
  {
    videotitle: "Big Buck Bunny - Animated Short Film",
    filename: "big_buck_bunny.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    filetype: "video/mp4",
    filesize: "158008374",
    videochanel: "Blender Foundation",
    uploader: "BlenderOrg",
    Like: 1520,
    views: 50000,
  },
  {
    videotitle: "Sintel - Open Movie",
    filename: "sintel.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    filetype: "video/mp4",
    filesize: "129906793",
    videochanel: "Blender Foundation",
    uploader: "BlenderOrg",
    Like: 2340,
    views: 75000,
  },
  {
    videotitle: "Tears of Steel - Sci-Fi Short",
    filename: "tears_of_steel.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    filetype: "video/mp4",
    filesize: "185906043",
    videochanel: "Blender Foundation",
    uploader: "BlenderOrg",
    Like: 890,
    views: 32000,
  },
  {
    videotitle: "Elephant Dream - First Open Movie",
    filename: "elephant_dream.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    filetype: "video/mp4",
    filesize: "64657027",
    videochanel: "Blender Foundation",
    uploader: "BlenderOrg",
    Like: 1200,
    views: 45000,
  },
  {
    videotitle: "For Bigger Blazes - Action Clip",
    filename: "for_bigger_blazes.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    filetype: "video/mp4",
    filesize: "2067075",
    videochanel: "Google Developers",
    uploader: "GoogleDev",
    Like: 450,
    views: 18000,
  },
  {
    videotitle: "For Bigger Escape - Adventure",
    filename: "for_bigger_escape.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    filetype: "video/mp4",
    filesize: "2299653",
    videochanel: "Google Developers",
    uploader: "GoogleDev",
    Like: 320,
    views: 12000,
  },
  {
    videotitle: "For Bigger Fun - Entertainment",
    filename: "for_bigger_fun.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    filetype: "video/mp4",
    filesize: "2676348",
    videochanel: "Google Developers",
    uploader: "GoogleDev",
    Like: 275,
    views: 9500,
  },
  {
    videotitle: "For Bigger Joyrides - Racing",
    filename: "for_bigger_joyrides.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    filetype: "video/mp4",
    filesize: "2509420",
    videochanel: "Google Developers",
    uploader: "GoogleDev",
    Like: 380,
    views: 14000,
  },
  {
    videotitle: "SubaruOutbackOnStreet - Car Review",
    filename: "subaru_outback.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    filetype: "video/mp4",
    filesize: "47888631",
    videochanel: "Auto Reviews",
    uploader: "CarChannel",
    Like: 650,
    views: 28000,
  },
  {
    videotitle: "Volkswagen GTI Review",
    filename: "volkswagen_gti.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    filetype: "video/mp4",
    filesize: "48401973",
    videochanel: "Auto Reviews",
    uploader: "CarChannel",
    Like: 720,
    views: 31000,
  },
  {
    videotitle: "WeAreGoingOnBullrun - Rally Racing",
    filename: "bullrun.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    filetype: "video/mp4",
    filesize: "51503270",
    videochanel: "Racing Channel",
    uploader: "RallyFan",
    Like: 890,
    views: 42000,
  },
  {
    videotitle: "What Car Can You Get For A Grand",
    filename: "car_for_grand.mp4",
    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    filetype: "video/mp4",
    filesize: "37203586",
    videochanel: "Auto Reviews",
    uploader: "CarChannel",
    Like: 1100,
    views: 55000,
  },
];

const videoSchema = mongoose.Schema(
  {
    videotitle: { type: String, required: true },
    filename: { type: String, required: true },
    filetype: { type: String, required: true },
    filepath: { type: String, required: true },
    filesize: { type: String, required: true },
    videochanel: { type: String, required: true },
    Like: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    uploader: { type: String },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("videofiles", videoSchema);

const addExternalVideos = async () => {
  try {
    const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/youtube-clone";
    console.log("Connecting to MongoDB:", DB_URL);
    
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB\n");

    let addedCount = 0;
    let skippedCount = 0;

    for (const videoData of externalVideos) {
      // Check if video already exists
      const existingVideo = await Video.findOne({ videotitle: videoData.videotitle });
      
      if (existingVideo) {
        console.log(`⏭️  Skipped: "${videoData.videotitle}" (already exists)`);
        skippedCount++;
      } else {
        const newVideo = new Video(videoData);
        await newVideo.save();
        console.log(`✅ Added: "${videoData.videotitle}"`);
        addedCount++;
      }
    }

    console.log(`\n========================================`);
    console.log(`Added: ${addedCount} videos`);
    console.log(`Skipped: ${skippedCount} videos (already existed)`);
    console.log(`========================================\n`);

    // List all videos
    const allVideos = await Video.find();
    console.log("All videos in database:");
    allVideos.forEach((v, i) => {
      const isExternal = v.filepath.startsWith("http");
      console.log(`${i + 1}. ${v.videotitle} ${isExternal ? "🌐" : "📁"}`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

addExternalVideos();
