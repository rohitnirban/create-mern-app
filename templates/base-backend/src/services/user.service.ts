import { User } from "../models/user.model";
import { IUserDocument, IUserResponse } from "../types/user.types";
import { AppError } from "../utils/AppError";

function sanitizeUser(user: IUserDocument): IUserResponse {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const getMe = async (userId: string): Promise<IUserResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return sanitizeUser(user);
};

