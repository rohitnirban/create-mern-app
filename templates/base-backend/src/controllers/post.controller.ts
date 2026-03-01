import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as postService from "../services/post.service";
import { getPaginationParams, successResponse } from "../types/api.types";
import { AppError } from "../utils/AppError";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, body } = req.body;
  const userId = req.user!.userId;

  const post = await postService.createPost({ title, body, authorId: userId });
  res.status(201).json(successResponse({ post }, "Post created"));
});

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const search = (req.query.search as string | undefined)?.trim() || undefined;
  const authorId = (req.query.authorId as string | undefined)?.trim() || undefined;

  const { page, limit } = getPaginationParams(req.query, {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  });

  const { items: posts, pagination } = await postService.getPosts({
    page,
    limit,
    search,
    authorId,
  });

  res.status(200).json(successResponse({ posts, pagination }));
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const post = await postService.getPostById(id);
  if (!post) {
    throw new AppError(404, "Post not found");
  }
  res.status(200).json(successResponse({ post }));
});

/** Admin: paginated list for table (server-side pagination, scalable). */
export const getPostsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const search = (req.query.search as string | undefined)?.trim() || undefined;
  const authorId = (req.query.authorId as string | undefined)?.trim() || undefined;
  const { page, limit } = getPaginationParams(req.query, {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  });
  const { items: posts, pagination } = await postService.getPosts({
    page,
    limit,
    search,
    authorId,
  });
  res.status(200).json(successResponse({ posts, pagination }));
});

/** Admin: seed database with sample posts (default 10000). */
export const seedPosts = asyncHandler(async (req: Request, res: Response) => {
  const raw = (req.query.count as string | undefined) ?? "10000";
  const count = Math.min(Math.max(1, Number.parseInt(raw, 10) || 10000), 10000);
  const { created } = await postService.seedPosts(count);
  res.status(201).json(successResponse({ created }, `Created ${created} sample posts.`));
});
