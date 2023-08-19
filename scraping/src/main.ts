import { EVERY_20_MINUTES, createMorizonScraperJob } from './jobs/jobs';

createMorizonScraperJob({ schedule: EVERY_20_MINUTES, startOnCreation: true });
