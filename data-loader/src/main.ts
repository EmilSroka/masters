import { loadFiles } from './file-loader';
import { transformFileContentToOffers } from './decode';
import { publishAll } from './kafka';

loadFiles('propertly-offers-30-', '.txt', async content => await publishAll(await transformFileContentToOffers(content)));



