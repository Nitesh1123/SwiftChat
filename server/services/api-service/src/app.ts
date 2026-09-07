import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import conversationRoutes from "./modules/conversation/conversation.routes";
import messagesRoutes from "./modules/messages/message.routes"
import userRoutes from "./modules/user/user.routes"
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import morgan from "morgan";

const app: Application = express();

// CORS must be first — before any routes
app.use(
  cors({
    origin: [
      "https://swiftchat-app-nine.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/user", userRoutes)

app.get("/", (req, res) => {
  res.send("Backend running");
});

// Error handler MUST be last — after all routes
app.use(errorHandler);

export default app;

