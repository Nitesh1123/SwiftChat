import { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "./auth.service";
import jwt from "jsonwebtoken";
import { prisma } from "@zolo/prisma";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: { ...user, _id: user.id },
        });
    } catch (error: any) {
        next(error);
    }
};

export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUser(email, password);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: { ...user, _id: user.id },
        });
    } catch (error: any) {
        next(error);
    }
};

export const refreshAccessTokenController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        let decoded: { id: string };
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET as string
            ) as { id: string };
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }

        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Only fetch the fields we need for validation
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, refreshToken: true },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const newAccessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
        });
    } catch (error: any) {
        next(error);
    }
};

export const logoutController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.userId) {
            await prisma.user.update({
                where: { id: req.userId },
                data: { refreshToken: null },
            });
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error: any) {
        next(error);
    }
};

export const getMyProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
                isOnline: true,
                isBlocked: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true,
                // password and refreshToken are NOT included — safe to return
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: { ...user, _id: user.id },
        });
    } catch (error: any) {
        next(error);
    }
};
