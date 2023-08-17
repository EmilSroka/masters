import { createMorizonOfferScraper } from './pages/morizon';
import { KafkaOffersPersistence, OffersPersistence } from './persistence/persistence';
import { BaseScraper } from './scraper/base';

console.log('Morizon scrapper demo');

async function main() {
    const persitance: OffersPersistence = new KafkaOffersPersistence();
    const scrapped = await persitance.getPublishedOfferIds();
    const scraper: BaseScraper = createMorizonOfferScraper(persitance)
    return await scraper.scrap(scrapped);
}

main().then(console.log);