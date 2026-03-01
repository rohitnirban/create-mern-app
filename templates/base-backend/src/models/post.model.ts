import mongoose, { Schema } from "mongoose";
import { IPost } from "../types/post.types";

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>("Post", postSchema);
