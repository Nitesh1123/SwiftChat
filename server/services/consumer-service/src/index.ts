import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../api-service/.env") });

import { prisma } from "@zolo/prisma";
import { createConsumer } from "@zolo/kafka";
import { publishMessage } from "@zolo/redis";

const CONSUMER_GROUP = "chat-consumer-group";
const TOPIC = "chat-messages";

async function messageHandler(payload: any) {
    try {
        const { message, topic } = payload;
        if (!message || !message.value) return;
        
        const parsedMessage = JSON.parse(message.value.toString());
        console.log(`[Consumer] Processing new message from ${parsedMessage.senderId} for conversation ${parsedMessage.conversationId}`);

        await prisma.message.create({
            data: {
                id: parsedMessage.id,
                conversationId: parsedMessage.conversationId,
                senderId: parsedMessage.senderId,
                content: parsedMessage.content,
                type: parsedMessage.type,
                createdAt: parsedMessage.createdAt ? new Date(parsedMessage.createdAt) : undefined,
                updatedAt: parsedMessage.updatedAt ? new Date(parsedMessage.updatedAt) : undefined,
                readBy: {
                    create: [{ userId: parsedMessage.senderId }]
                }
            }
        });

        await prisma.conversation.update({
            where: { id: parsedMessage.conversationId },
            data: { lastMessageId: parsedMessage.id }
        });

        const pubPayload = {
            room: `conversation:${parsedMessage.conversationId}`,
            event: "message:new",
            data: parsedMessage
        };

        await publishMessage("socket:emit", pubPayload);
        console.log(`[Consumer] Forwarded message to socket bus!`);

    } catch (err: any) {
        console.error("[Consumer] Error processing message:", err);
        require('fs').appendFileSync('trace.log', err.stack + '\n');
    }
}

async function start() {
    console.log("🚀 Starting consumer service...");
    await createConsumer(CONSUMER_GROUP, TOPIC, messageHandler);
}

start();