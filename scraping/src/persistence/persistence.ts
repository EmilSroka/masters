import { randomUUID } from "crypto";
import { Consumer, Kafka, Producer } from "kafkajs";
import { Offer } from "mes-proto-ts";
import { wait } from "../scraper/utils";

const OFFERS_TOPIC = 'offers';

const kafka = new Kafka({
    clientId: 'scraping',
    brokers: ['kafka:9092']
});

export interface OffersPersistence {
    publishOffer: (offer: Offer) => void
    getPublishedOfferIds: () => Promise<Set<string>>
}

export class KafkaOffersPersistence implements OffersPersistence {
    private consumer: Consumer;
    private producer: Producer;

    constructor() {
        // each time new consumer to get messages from beggining of topics
        this.consumer = kafka.consumer({ groupId: `id-loader-${randomUUID()}` });
        this.producer = kafka.producer();
    }

    async publishOffer(offer: Offer) {
        try {
            await this.publishOfferInKafkaTopic(OFFERS_TOPIC, offer);
        } catch (error) {
            console.log(`Cannot publish offer ${offer.id} to topic ${OFFERS_TOPIC}`, error);
        }
    }

    async getPublishedOfferIds(): Promise<Set<string>> {
        try {
            return await this.getMessegesIdsFromKafkaTopic(OFFERS_TOPIC);
        } catch (error) {
            // TODO: error logging
            console.log("Cannot get offers from topic", error);
            return new Set();
        }
    }

    private async publishOfferInKafkaTopic(topic: string, offer: Offer) {
        await this.producer.connect();
        await this.producer.send({
            topic: OFFERS_TOPIC,
            messages: [
                { key: offer.id, value: Buffer.from(Offer.encode(offer).finish().buffer) },
            ],
        });
    }

    private async getMessegesIdsFromKafkaTopic(topic: string) {
        const result: Set<string> = new Set();
        const start = new Date();
        await this.consumer.connect();
        await this.consumer.subscribe({ topic, fromBeginning: true });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (message.key) {
                    result.add(message.key.toString('utf-8'));
                }
                if (new Date(message.timestamp) > start) {
                    await this.consumer.stop();
                    await this.consumer.disconnect();
                }
            }
        });
        // this.consumer.run is async, and we don't have finish condition,
        // so just wait 10 seconds for all messages
        await wait(10_000);
        await this.consumer.disconnect();
        return result;
    }
}