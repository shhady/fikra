import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  translations: {
    en: {
      title: { type: String, required: true },
      content: { type: String, required: true }
    },
    ar: {
      title: { type: String, required: true },
      content: { type: String, required: true }
    },
    he: {
      title: { type: String, required: true },
      content: { type: String, required: true }
    }
  },
  coverImage: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    default: "فريق فكرة نوفا"
  },
  tags: [{ type: String }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Automatically update the `updatedAt` field
BlogSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
