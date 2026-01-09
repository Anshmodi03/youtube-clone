import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../server/.env" });

// Mock video data
const mockVideo = {
  videotitle: "Sample Video - Testing Comments",
  filename: "sample_video.mp4",
  filepath: "uploads/sample_video.mp4",
  filetype: "video/mp4",
  filesize: "10485760",
  videochanel: "Test Channel",
  uploader: "TestUser",
  Like: 0,
  views: 100,
};

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

const addMockVideo = async () => {
  try {
    const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/youtube-clone";
    console.log("Connecting to MongoDB:", DB_URL);
    
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");

    // Check if mock video already exists
    const existingVideo = await Video.findOne({ videotitle: mockVideo.videotitle });
    
    if (existingVideo) {
      console.log("Mock video already exists with ID:", existingVideo._id);
    } else {
      const newVideo = new Video(mockVideo);
      await newVideo.save();
      console.log("Mock video added successfully!");
      console.log("Video ID:", newVideo._id);
    }

    // List all videos
    const allVideos = await Video.find();
    console.log("\nAll videos in database:");
    allVideos.forEach((v, i) => {
      console.log(`${i + 1}. ${v.videotitle} (ID: ${v._id})`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

addMockVideo();
