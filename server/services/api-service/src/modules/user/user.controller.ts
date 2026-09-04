import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { getUsers, setUserNameService } from "./user.service";

export const setUserName = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { username } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const result = await setUserNameService({
      userId,
      username,
    });
    return res.status(200).json({
      success: true,
      message: "Username set successfully.",
      data: result,
    });
  } catch (error: any) {
    switch (error.message) {
      case "USERNAME_TOO_SHORT":
        error.statusCode = 400;
        error.message = "Username must be at least 3 characters.";
        break;

      case "USERNAME_ALREADY_SET":
        error.statusCode = 400;
        error.message = "Username is already set and cannot be changed.";
        break;

      case "USERNAME_TAKEN":
        error.statusCode = 409;
        error.message = "Username is already taken.";
        break;

      case "INVALID_USERNAME":
        error.statusCode = 400;
        error.message = "Username must be 3–20 characters and can contain letters, numbers, _ or .";
        break;

      case "USER_NOT_FOUND":
        error.statusCode = 404;
        error.message = "User not found.";
        break;

      default:
        console.error("Set username error:", error);
    }
    next(error);
  }
};
export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const q = typeof req.query.q === "string" ? req.query.q : "";
    const users = await getUsers(q, userId);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })

  } catch (error: any) {
    console.error("Search users error:", error);
    next(error);
  }
}