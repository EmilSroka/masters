import { Kafka } from "kafkajs";
import { Offer } from "mes-proto-ts";

const OFFERS_TOPIC = 'offers';

const kafka = new Kafka({
    clientId: 'scraping',
    brokers: ['kafka:9092']
});

const producer = kafka.producer();

export async function publishAll(offers: Offer[]) {
    for (const offer of offers) {
        try {
            await sendKafka(offer);
        } catch(error) {
            console.log(`Cannot send offer with id "${offer.id}" -> error: """${error}"""`);
        }
    }
}

async function sendKafka(offer: Offer) {
    await producer.connect();
    await producer.connect();
    await producer.send({
        topic: OFFERS_TOPIC,
        messages: [
            { key: offer.id, value: JSON.stringify(Offer.toJSON(offer)) },
        ],
    });
    console.log(`Published offer with id: "${offer.id}"`);
}