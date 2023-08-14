import { createMorizonOfferScraper } from './pages/morizon';

console.log('Morizon scrapper demo');

createMorizonOfferScraper().scrap(new Set()).then(console.log);
