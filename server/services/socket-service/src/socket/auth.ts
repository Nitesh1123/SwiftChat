import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

interface AccessTokenPayload extends JwtPayload {
  id: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const socketAuth = (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const rawCookies = socket.handshake.headers.cookie || "";

    const cookies: Record<string, string> = Object.fromEntries(
      rawCookies.split("; ").filter(Boolean).map((c: string) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      })
    );

    const token =
      cookies["accessToken"] || socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as AccessTokenPayload;

    socket.userId = decoded.id;

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};