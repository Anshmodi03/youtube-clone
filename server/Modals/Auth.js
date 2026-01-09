import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumSince: { type: Date },
  subscriptionPlan: { 
    type: String, 
    enum: ["free", "bronze", "silver", "gold"], 
    default: "free" 
  },
  subscriptionUpdatedAt: { type: Date },
});

export default mongoose.model("user", userschema);
