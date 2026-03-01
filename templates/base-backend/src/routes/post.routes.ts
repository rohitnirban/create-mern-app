import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { csrfProtection } from "../middleware/csrf";
import { validateBody } from "../middleware/validate";
import { createPostSchema } from "../validations/post.validation";

const router = Router();

router.get("/", postController.getPosts);
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  postController.getPostsAdmin
);
router.post(
  "/seed",
  authenticate,
  authorize("admin"),
  csrfProtection,
  postController.seedPosts
);
router.get("/:id", postController.getPostById);
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  csrfProtection,
  validateBody(createPostSchema),
  postController.createPost
);

export default router;
