import 'dotenv/config';
import http from 'http'
import { Application } from "express";
import express from 'express';
import cors from 'cors'
import { initSocket } from './socket';


const app: Application = express();
const server = http.createServer(app);
const port = process.env.SOCKET_PORT;
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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