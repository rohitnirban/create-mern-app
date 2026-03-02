import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { uploadToS3 } from "../services/upload.service";
import { successResponse } from "../types/api.types";
import { AppError } from "../utils/AppError";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, "No file uploaded. Use field name 'file'.");
  }

  const ext = path.extname(req.file.originalname) || ".bin";
  const key = `uploads/${req.user!.userId}/${randomUUID()}${ext}`;

  const result = await uploadToS3(
    req.file.buffer,
    key,
    req.file.mimetype
  );

  res.status(201).json(
    successResponse(
      { key: result.key, url: result.url, bucket: result.bucket },
      "File uploaded successfully"
    )
  );
});
