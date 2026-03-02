import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { csrfProtection } from "../middleware/csrf";
import { uploadMiddleware } from "../middleware/multerUpload";
import * as uploadController from "../controllers/upload.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  csrfProtection,
  uploadMiddleware,
  uploadController.uploadFile
);

export default router;
