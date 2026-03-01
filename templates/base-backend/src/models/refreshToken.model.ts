import mongoose, { Schema } from "mongoose";

export interface IRefreshTokenDocument {
  user: mongoose.Types.ObjectId;
  hashedToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hashedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: remove expired tokens automatically (optional)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema
);
