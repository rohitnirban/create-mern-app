import { Document, Types } from "mongoose";

export type UserRole = "user" | "admin" | "manager";

export interface IUser {
  _id:Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
