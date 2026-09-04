import { Producer, Message, Partitioners } from "kafkajs";
import kafka from ".";

let producer: Producer;

async function startProducer() {
    try {
        if (!producer) {
            producer = kafka.producer({
                createPartitioner: Partitioners.LegacyPartitioner,
            });
        }
        await producer.connect();
        console.log("Kafka started.");
    } catch (error) {
        console.error('[Kafka] Producer failed to connect:', error);
        process.exit(1);
    }
}

async function sendMessage(topic: string, messages: Message[]) {
  try {
    if (!producer) {
        producer = kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner,
        });
        await producer.connect();
    }
    await producer.send({ topic, messages });
  } catch (err) {
    console.error(`[Kafka] Failed to send to topic ${topic}:`, err);
    throw err; 
  }
}

export { startProducer, sendMessage };