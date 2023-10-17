import { CronJob } from "cron";
import { createMorizonOfferScraper } from "../pages/morizon";
import { KafkaOffersPersistence, OffersPersistence } from "../persistence/persistence";
import { Scraper } from "../scraper/base";

export const EVERY_20_MINUTES = '*/20 * * * *';
export const EVERY_2_HOURS = '0 */2 * * *';

interface JobSettings {
    schedule: string,
    startOnCreation: boolean,
}

const defaultJobSettings: JobSettings = {
    schedule: EVERY_20_MINUTES,
    startOnCreation: true,
}

export function createMorizonScraperJob(settings: Partial<JobSettings>) {
    return jobBase(settings, async () => {
        const persitance: OffersPersistence = new KafkaOffersPersistence();
        const scraper: Scraper = await createMorizonOfferScraper(persitance);
        await scraper.scrap(persitance);
    }, 'Morizon').start();
};


function jobBase(inputSettings: Partial<JobSettings>, job: () => Promise<void>, name: string) {
    console.log(`Scraping Job "${name}" scheduled at "${new Date()}"`);
    const settings = {...defaultJobSettings, ...inputSettings}
    const wrapper = async () => {
        const startTime = new Date();
        console.log(`Scraping Job "${name}" starts at "${startTime}"`);
        await job();
        console.log(`Scraping Job "${name}" from "${startTime}" finished at "${new Date()}"`);
    };
    if (settings.startOnCreation) {
        wrapper();
    }
    return new CronJob({
        cronTime: settings.schedule,
        onTick: wrapper
    });
}
