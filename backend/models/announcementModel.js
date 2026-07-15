import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, enum: ["all", "customer", "vendor"], default: "all" },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

const announcementModel = mongoose.models.announcement || mongoose.model("announcement", announcementSchema);
export default announcementModel;
