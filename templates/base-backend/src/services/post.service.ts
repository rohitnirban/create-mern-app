import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { IPostResponse, toPostResponse } from "../types/post.types";
import { AppError } from "../utils/AppError";
import { PaginatedData } from "../types/api.types";

const SAMPLE_TITLES = [
  "Getting started with React Query",
  "Understanding TanStack Table",
  "Building scalable APIs with Node.js",
  "Authentication best practices",
  "Database indexing strategies",
  "TypeScript tips for backend devs",
  "REST vs GraphQL in 2024",
  "Cookie-based auth deep dive",
  "Server-side pagination patterns",
  "Optimizing MongoDB queries",
];

const SAMPLE_BODIES = [
  "In this post we explore key concepts and share practical examples.",
  "Learn how to structure your data and handle edge cases effectively.",
  "Performance and security go hand in hand. Here is how.",
  "A step-by-step guide with code samples you can run locally.",
  "Common pitfalls and how to avoid them in production.",
];

interface CreatePostInput {
  title: string;
  body: string;
  authorId: string;
}

interface GetPostsInput {
  page: number;
  limit: number;
  search?: string;
  authorId?: string;
}

export const createPost = async (
  input: CreatePostInput
): Promise<IPostResponse> => {
  const post = await Post.create({
    title: input.title,
    body: input.body,
    author: input.authorId,
  });
  const doc = await Post.findById(post._id).populate("author", "name email").lean();
  if (!doc?.author) throw new AppError(500, "Failed to create post");
  return toPostResponse(doc);
};

export const getPosts = async ({
  page,
  limit,
  search,
  authorId,
}: GetPostsInput): Promise<PaginatedData<IPostResponse>> => {
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  }

  if (authorId) {
    filter.author = authorId;
  }

  const [docs, totalItems] = await Promise.all([
    Post.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const items = docs.filter((d) => d.author).map(toPostResponse);

  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getPostById = async (postId: string): Promise<IPostResponse | null> => {
  const doc = await Post.findById(postId).populate("author", "name email").lean();
  if (!doc?.author) return null;
  return toPostResponse(doc);
};

/**
 * Generate sample posts for seeding. Uses first user in DB as author.
 * Inserts in batches to avoid memory issues.
 */
export const seedPosts = async (count: number): Promise<{ created: number }> => {
  const author = await User.findOne().select("_id").lean();
  if (!author) {
    throw new AppError(400, "No users in database. Create a user first.");
  }
  const authorId = author._id;
  const batchSize = 500;
  let created = 0;
  for (let offset = 0; offset < count; offset += batchSize) {
    const size = Math.min(batchSize, count - offset);
    const docs = Array.from({ length: size }, (_, i) => {
      const idx = (offset + i) % SAMPLE_TITLES.length;
      const bodyIdx = (offset + i) % SAMPLE_BODIES.length;
      return {
        title: `${SAMPLE_TITLES[idx]} #${offset + i + 1}`,
        body: SAMPLE_BODIES[bodyIdx],
        author: authorId,
      };
    });
    await Post.insertMany(docs);
    created += docs.length;
  }
  return { created };
};
