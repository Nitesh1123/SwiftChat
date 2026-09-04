import { Producer, Message, Partitioners } from "kafkajs";

let producer: Producer | null = null;
let kafkaEnabled = false;

async function startProducer() {
    if (!process.env.KAFKA_BROKERS) {
        console.warn('[Kafka] KAFKA_BROKERS not set — running without Kafka (direct DB mode).');
        return;
    }
    try {
        const kafka = (await import(".")).default;
        if (!producer) {
            producer = kafka.producer({
                createPartitioner: Partitioners.LegacyPartitioner,
            });
        }
        await producer.connect();
        kafkaEnabled = true;
        console.log("Kafka producer started.");
    } catch (error) {
        console.error('[Kafka] Producer failed to connect — continuing without Kafka:', error);
    }
}

async function sendMessage(topic: string, messages: Message[]) {
    if (!kafkaEnabled) {
        console.log(`[Kafka] Skipped (Kafka disabled) — topic: ${topic}`);
        return;
    }
    try {
        if (!producer) throw new Error("Producer not initialized");
        await producer.send({ topic, messages });
    } catch (err) {
        console.error(`[Kafka] Failed to send to topic ${topic}:`, err);
        throw err;
    }
}

export { startProducer, sendMessage };
