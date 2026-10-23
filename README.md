# SwiftChat

A real-time chat app with direct messages, group chats and online status, built with React, Node.js, Socket.IO, PostgreSQL and Redis.

**Live demo:** https://swiftchat-app-nine.vercel.app

The backend runs on Render's free tier, so the first request after a quiet period can take 30 to 60 seconds while the server wakes up.

## What it does

- Sign up and log in with email and password
- Search for people and start a one-to-one chat, or create a group
- Messages arrive instantly for everyone in the chat, including people who haven't opened it yet
- See who is online and when someone was last seen, correctly across several open tabs
- Unread counts per conversation
- Message history is saved, and the API can return it in pages (`?limit=&before=`)

## How it works

The backend is split into small services that talk to each other through Redis.

```mermaid
flowchart LR
    browser["Browser<br/>(React app on Vercel)"]
    api["api-service<br/>Express REST API"]
    socket["socket-service<br/>Socket.IO"]
    pg[("PostgreSQL<br/>Neon")]
    redis[("Redis<br/>Upstash")]

    browser -- "/api requests" --> api
    browser -- "WebSocket" --> socket
    api --> pg
    api -- "publish events" --> redis
    redis -- "subscribe" --> socket
    socket --> pg
```

When you send a message:

1. The browser sends `POST /api/messages` to the API.
2. The API checks that you belong to the conversation, saves the message in PostgreSQL and returns it to you.
3. The API publishes a `message:new` event to Redis, addressed to every participant.
4. Each socket-service instance is subscribed to Redis. It receives the event and pushes it to those users' open connections.
5. The receiving browser adds the message to the chat. If the chat is new to them, it reloads the conversation list so the chat appears.

Because events travel through Redis, you can run several socket-service instances and a user on one instance can still chat with a user on another.

**Optional Kafka path.** The repo also has a `consumer-service` and a Kafka setup in `docker-compose.production.yml`. With `KAFKA_BROKERS` set, the API also puts messages on a Kafka topic for the consumer to process, which helps absorb heavy write traffic. The live deployment runs without Kafka.

## Authentication

- Passwords are hashed with bcrypt.
- Logging in sets two HTTP-only cookies: an access token that lasts 15 minutes and a refresh token that lasts 7 days. JavaScript on the page can't read them.
- When the access token expires, the frontend calls `/api/auth/refresh-token` once and retries the request. Refresh tokens are stored on the user and replaced on every refresh, so logging out ends the session.
- In production the frontend calls `/api` on its own domain and Vercel forwards those requests to the API on Render. This keeps the cookies first-party, since most browsers now block cookies from a different site.
- The WebSocket lives on a different domain, so before connecting the browser fetches a short-lived token from `/api/auth/socket-token` and sends it in the handshake.

There are no app-wide roles; every account is a normal user. In group chats the creator is recorded as the group admin.

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Radix UI, React Router, React Hook Form + Zod, Axios, socket.io-client |
| API | Node.js 20, Express 5, Prisma, JSON Web Tokens, bcrypt, Joi, helmet |
| Real-time | Socket.IO with the Redis adapter, ioredis |
| Data | PostgreSQL (Neon), Redis (Upstash) |
| Optional queue | Kafka (kafkajs) |
| Hosting | Vercel (frontend), Render with Docker (API and socket server) |

## Project structure

```
client/                      React frontend
server/
  services/
    api-service/             REST API: auth, users, conversations, messages
    socket-service/          WebSocket server: live delivery and presence
    consumer-service/        Kafka consumer (only used when Kafka is on)
  packages/
    prisma/                  Database schema, migrations and shared client
    redis/                   Shared Redis clients and pub/sub helpers
    kafka/                   Shared Kafka producer and consumer
    types/                   Types shared between services
  Dockerfile                 One image used by every service
  docker-compose.production.yml   Full stack on one machine, including Kafka and nginx
```

The server is an npm workspace, so all services share the packages under `server/packages`.

## Running it locally

You need Node.js 20 or later, a PostgreSQL database and a Redis instance. Free Neon and Upstash accounts work.

**1. Backend**

Create `server/services/api-service/.env` and `server/services/socket-service/.env`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
REDIS_URL=rediss://default:password@host:6379
ACCESS_TOKEN_SECRET=any-long-random-string
REFRESH_TOKEN_SECRET=another-long-random-string
```

Leave `KAFKA_BROKERS` unset unless you are running Kafka.

```bash
cd server
npm install
npx prisma migrate deploy --schema=packages/prisma/schema.prisma
npm run dev
```

The API listens on port 5000 and the socket server on port 8001.

**2. Frontend**

Create `client/.env`:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:8001
```

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server forwards `/api` to `VITE_API_BASE_URL`, the same way Vercel does in production.

## Deployment

Pushing to `main` deploys everything:

- **Vercel** builds `client/` and serves it. `client/vercel.json` forwards `/api/*` to the Render API and sends every other path to `index.html`.
- **Render** builds `server/Dockerfile` twice, once per service. The API starts with `tsx services/api-service/src/server.ts` and the socket server with `tsx services/socket-service/src/server.ts`. Each needs the environment variables listed above.

To run the whole system on a single server instead, including Kafka and the consumer, use `deploy.sh`. It starts `server/docker-compose.production.yml` behind nginx.

## Known limitations

- Group admins are recorded, but there are no admin actions yet, such as adding or removing members.
- Typing indicators and live read receipts aren't built yet. The database already tracks which messages each user has read.
- Image and file messages are in the schema but not in the interface.
- With Kafka turned on, the API and the consumer both save each message, so that path needs an idempotent write before it is used.
