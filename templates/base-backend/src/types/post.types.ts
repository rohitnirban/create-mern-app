import { Document, Types } from "mongoose";
import { IUserResponse } from "./user.types";

export interface IPost extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  title: string;
  body: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** Populated author (name, email) for post responses. */
export type IPostAuthor = Pick<IUserResponse, "_id" | "name" | "email">;

export interface IPostResponse extends Omit<Pick<IPost, "_id" | "title" | "body" | "createdAt" | "updatedAt">, "author"> {
  author: IPostAuthor;
}

/** Asserts a populated lean post doc to IPostResponse (avoids casting in services). */
export function toPostResponse(doc: Record<string, unknown>): IPostResponse {
  return doc as unknown as IPostResponse;
}

