import "dotenv/config";

import http from "http";
import app from "./app";
import connectDB from "./config/db";

import { startProducer } from "@zolo/kafka";

connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);


startProducer();

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});