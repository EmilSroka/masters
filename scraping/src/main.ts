import { createMorizonOfferScraper } from './pages/morizon';
import { KafkaOffersPersistence, OffersPersistence } from './persistence/persistence';
import { Scraper } from './scraper/base';

async function main() {
    const persitance: OffersPersistence = new KafkaOffersPersistence();
    const scraper: Scraper = await createMorizonOfferScraper(persitance);
    return await scraper.scrap(persitance);
}

main().then(() => console.log('Finished!'));