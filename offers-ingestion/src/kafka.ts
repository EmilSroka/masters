import { Kafka } from "kafkajs";
import { Offer } from "mes-proto-ts";
import { ProcessingFunction, ProcessingResult } from "./pipeline";
import { PipelineError } from "./errors";

const OFFERS_TOPIC = 'offers';

const kafka = new Kafka({
    clientId: 'scraping',
    brokers: ['kafka:9092']
});

export async function kafkaSubscriber(processingFunction: ProcessingFunction<Offer>) {
    const consumer = kafka.consumer({ groupId: 'offers-ingestion' });
    await consumer.connect();
    await consumer.subscribe({ topic: OFFERS_TOPIC, fromBeginning: true });
    consumer.run({
        eachMessage: async ({ message }) => {
            console.log(`Start processing message with key ${message.key}`);
            let error, offer;

            if (message.value === null) {
                error = PipelineError.KafkaMessageNoValue(`Message with key ${message.key} does not contain value`);              
            }

            try {
                if (message.value !== null) {
                    offer = Offer.decode(new Uint8Array(message.value));
                }
            } catch(error) {
                error = PipelineError.CannotParseKafkaMessage(`Cannot decode message with key ${message.key}`, error);
            }

            const status = await processingFunction(offer, error);

            if (status === ProcessingResult.FailedRetry) {
                console.log(`Faild to process message with key ${message.key} - retring`);
                throw undefined;
            }
            if (status === ProcessingResult.Success) {
                console.log(`Sucesfully finished processing message with key ${message.key}`);
            }
            if (status === ProcessingResult.FailedSkip) {
                console.log(`Faild to process message with key ${message.key} - skip`);
            }
        }
    });
    return async () => {
        await consumer.disconnect();
    }
}