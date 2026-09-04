import { Kafka } from "kafkajs";
import kafka from ".";

async function createConsumer(groupId: string, topic: string, message: any) {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({ eachMessage: message });

    console.log(`[Kafka] Consumer subscribed to ${topic}`);
}

export { createConsumer };