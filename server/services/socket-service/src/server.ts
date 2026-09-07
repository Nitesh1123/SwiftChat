import 'dotenv/config';
import http from 'http'
import { Application } from "express";
import express from 'express';
import cors from 'cors'
import { initSocket } from './socket';


const app: Application = express();
const server = http.createServer(app);
const port = process.env.PORT || process.env.SOCKET_PORT || 8001;
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://swiftchat-app-nine.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

initSocket(server);

app.get('/', (req, res) => {
  res.send("Socket server running.");
})

server.listen(port, () => {
  console.log(`Socket server running on: ${port}`)
})
