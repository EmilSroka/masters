import { Consumer, Kafka, Producer } from "kafkajs";
import { Offer } from "mes-proto-ts";

const OFFERS_TOPIC = 'offers';

const kafka = new Kafka({
    clientId: 'scraping',
    brokers: ['kafka:9092']
});

Offer.encode(Offer.create()).finish()

export interface OffersPersistence {
    publishOffer: (offer: Offer) => void
    getPublishedOfferIds: () => Promise<Set<string>>
}

export class KafkaOffersPersistence implements OffersPersistence {
    private consumer: Consumer;
    private producer: Producer;

    constructor() {
        this.consumer = kafka.consumer({ groupId: 'id-loader' });
        this.producer = kafka.producer();

        this.producer.connect();
        this.consumer.connect();
    }

    async publishOffer(offer: Offer) {
        await this.producer.send({
            topic: OFFERS_TOPIC,
            messages: [
                { key: offer.id, value: Buffer.from(Offer.encode(offer).finish().buffer) },
            ],
        })
    }

    async getPublishedOfferIds(): Promise<Set<string>> {
        const result: Set<string> = new Set();
        const start = new Date();
        await this.consumer.subscribe({ topic: OFFERS_TOPIC, fromBeginning: true });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (message.key) {
                    result.add(message.key.toString('utf-8'));
                }

                console.log('TTTTTTTTTT', message.timestamp)
                if (new Date(message.timestamp) > start) {
                    await this.consumer.stop();
                }
            }
        });
        return result;
    }
}