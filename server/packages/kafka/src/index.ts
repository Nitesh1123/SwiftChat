import { Kafka } from "kafkajs";

// const kafka: Kafka = new Kafka({
//     clientId: "zolo-kafka",
//     brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
// });

const kafka = new Kafka({
  clientId: "zolo-kafka",
  brokers: [process.env.KAFKA_BROKERS!],

  ssl: true,

  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },
});

export default kafka;
export * from "./producer";
export * from "./consumer";