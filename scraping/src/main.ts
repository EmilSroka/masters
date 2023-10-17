import { EVERY_2_HOURS, createMorizonScraperJob } from './jobs/jobs';

createMorizonScraperJob({ schedule: EVERY_2_HOURS, startOnCreation: true });
