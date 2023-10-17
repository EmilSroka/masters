import { Apartment, Currency, DecimalNumber, LatLang, Money, Offer } from "mes-proto-ts";
import { CheerioAPI, load } from 'cheerio';
import { BaseScraper, OfferListNavigator, OfferScraper } from "../scraper/base";
import { ScrapingError, isScrapingError } from "../scraper/errors";
import { getFirstChildrenText, getFirstElement, getFirstElementText, getLastElementText, getOnlyElement, getOnlyElementAttribute, getValuesUsingTemplate, noWhiteSpace, numberFromDigits, template } from "../scraper/utils";
import { OffersPersistence } from "../persistence/persistence";

export const createMorizonOfferScraper = async (persistance: OffersPersistence) => new BaseScraper({
    page: {
        offerScraper: new MorizonOfferScraper(),
        offerListNavigator: new MorizonOfferListNavigator(),
        entryOfferListUrl: new URL('https://www.morizon.pl/mieszkania/warszawa/'),
    },
    scrapedOffersIds: new Set(),
    publish: async (offer: Offer) => await persistance.publishOffer(offer),
});

class MorizonOfferScraper implements OfferScraper {
    getData(html: string): Offer {
        const $ = load(html);
        const required = this.extractRequiredFields(html, $);
        return Offer.create({
            ...this.getOptionalOfferFileds(html, $),
            id: required.id,
            apartment: Apartment.create({
                ...this.getOptionalApartmentFileds(html, $),
                price: required.price,
                size: required.size,
                address: required.address,
            }),
            
        })
    }

    getPageId(html: string): string {
        return this.extractId(html);
    }


    /* required fileds extractors */

    private extractRequiredFields(html: string, $: CheerioAPI) {
        const skipSymbol = Symbol();
        const errors: Error[] = [];
        const namesAndExtractors = [
            ['id', () => this.extractId(html)],
            ['price', () => this.extractPrice($)],
            ['size', () => this.extractSize($)],
            ['address', () => this.extractAddress($)],
        ] as const;
        const output = namesAndExtractors.map(([name, extractor]) => {
            try {
                return [name, extractor()] as const;
            } catch(error) {
                if (isScrapingError(error)) {
                    errors.push(error);
                } else {
                    errors.push(new Error(String(error)));
                }
                return [name, skipSymbol] as const;
            }
        }).reduce((acc, [name, value]) => {
            if (value !== skipSymbol) {
                acc[name] = value;
            }
            return acc;
        }, {} as Record<'id' | 'price' | 'size' | 'address', any>);
        if (errors.length > 0) {
            throw ScrapingError.CannotScrapOffer('One of required fileds {id | price | size | address} is not present.', ...errors);
        }
        return output;
    }

    private extractId(html: string): string {
        try {
            const id = getValuesUsingTemplate({
                content: html,
                template: template`-mzn${'id'}">`
            })['id'];
            return `morizon:mzn${id}`;
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoId('Cannot extract morizon offer id', error);
            }
            throw ScrapingError.NoId('Unknown error');
        }
    }

    private extractPrice($: CheerioAPI): Money {
        try {
            const elementText = getFirstElementText({ selector: '#basic-info-price-row > div:first-child > span:first-child', $});
            return Money.create({
                /* Morizon shows values as 599 000 zł so we convert it to  -> 59900000 with scale 2 */
                value: DecimalNumber.create({
                    value: numberFromDigits(elementText) * 100, 
                    scale: 2,
                }),
                currency: Currency.PLN,
            });
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoOfferPrice('Cannot extract morizon offer price', error);
            }
            throw ScrapingError.NoOfferPrice('Unknown error');
        }
    }

    private extractSize($: CheerioAPI): DecimalNumber {
        try {
            const elementText = extractMorizonDetailRowValue({contains: 'Pow. całkowita', $});
            return DecimalNumber.create({
                /* Morizon shows price as 66,98 m² so we convert it to  -> 6698 with scale 2 */
                value: elementText.includes(',') ? numberFromDigits(elementText) : (numberFromDigits(elementText) * 100), 
                scale: 2,
            });
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoOfferSize('Cannot extract morizon offer size', error);
            }
            throw ScrapingError.NoOfferSize(`Unknown error: ${error}`);
        }
    }

    private extractAddress($: CheerioAPI): string {
        try {
            return noWhiteSpace(getFirstElementText({ selector: '.container-with-sidebar > section:first-child > div:nth-child(3)', $}));
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoOfferAddress('Cannot extract morizon offer address', error);
            }
            throw ScrapingError.NoOfferAddress(`Unknown error: ${error}`);
        }
    }


    /* optional offer fileds extractors */

    private getOptionalOfferFileds(html: string, $: CheerioAPI) {
        const namesAndExtractors = [
            ['title', () => getFirstElementText({ selector: '.puB8QH', $})],
            ['description',() => this.extractMorizonDescription(html)],
            ['timeScraped', () => new Date()]
        ] as [keyof Offer, () => any][];
        return namesAndExtractors.reduce((acc, [name, extractor]) => {
            let value;
            try {
                value = extractor();
                acc[name] = value;
                return acc;
            } catch(error) {
                // TODO: error logging
                console.log(error);
                return acc;
            }
        }, {} as Record<keyof Offer, any>);
    }

    private extractMorizonDescription(html: string) {
        try {
            const result = getValuesUsingTemplate({
                content: html,
                template: template`description","${'description'}"`
            });
            return result.description;
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoOfferOptionalAttribute('Cannot find a latitude and longitude on the page', error);
            }
            throw ScrapingError.NoOfferOptionalAttribute(`Unknown error: ${error}`);
        }
    }


    /* optional apartment fileds extractors */

    private getOptionalApartmentFileds(html: string, $: CheerioAPI) {
        const namesAndExtractors = [
            ['location', () => this.extractMorizonLatLang(html)],
            ['yearBuilt', () => this.extractMorizonYearBuilt($)],
            ['roomCount', () => this.extractMorizonRoomCount($)],
            ['floor', () => this.extractMorizonFloor($)]
        ] as [keyof Apartment, () => any][];
        return namesAndExtractors.reduce((acc, [name, extractor]) => {
            let value;
            try {
                value = extractor();
                acc[name] = value;
                return acc;
            } catch(error) {
                // TODO: error logging
                console.log(error);
                return acc;
            }
        }, {} as Record<keyof Apartment, any>);
    }

    private extractMorizonLatLang(html: string) {
        try {
            const result = getValuesUsingTemplate({
                content: html,
                template: template`"latitude":${'latid'},"longitude":${'longid'}},${'latitude'},${'longitude'},`
            });
            const latitude = Number(result.latitude);
            const longitude = Number(result.longitude);
            if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                throw ScrapingError.NoApartmentOptionalAttribute(`Found latitude "${result.latitude}" or longitude "${result.longitude}" is not a number`);
            }
            return LatLang.create({latitude, longitude});
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoApartmentOptionalAttribute('Cannot find a latitude and longitude on the page', error);
            }
            throw ScrapingError.NoApartmentOptionalAttribute(`Unknown error: ${error}`);
        }
    }

    private extractMorizonYearBuilt($: CheerioAPI) {
        try {
            return numberFromDigits(extractMorizonDetailRowValue({contains: 'Rok budowy', $}));
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoApartmentOptionalAttribute('Cannot find a built year on the page', error);
            }
            throw ScrapingError.NoApartmentOptionalAttribute(`Unknown error: ${error}`);
        }
    }

    private extractMorizonRoomCount($: CheerioAPI) {
        try {
            return numberFromDigits(getFirstElementText({ selector: '.FN9jgE ._0mnFnL', $ }));
        } catch(error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoApartmentOptionalAttribute('Cannot find a room count on the page', error);
            }
            throw ScrapingError.NoApartmentOptionalAttribute(`Unknown error: ${error}`);
        }
    }

    private extractMorizonFloor($: CheerioAPI) {
        try {
            const floorText = getLastElementText({ selector: '.FN9jgE ._0mnFnL', $});
            if (!floorText.includes('/')) {
                throw ScrapingError.NoApartmentOptionalAttribute('Cannot parse floor value. Text does not include "/" character');
            }
            const firstPart = floorText.split('/')[0];
            if (firstPart.includes('parter')) {
                return 0;
            }
            return numberFromDigits(firstPart);
        } catch (error) {
            if (isScrapingError(error)) {
                throw ScrapingError.NoApartmentOptionalAttribute('Cannot find a floor on the page', error);
            }
            throw ScrapingError.NoApartmentOptionalAttribute(`Unknown error: ${error}`);
        }
    }    
}

class MorizonOfferListNavigator implements OfferListNavigator {
    NEXT_PAGE_SELECTOR = '.pagination__main-button a';

    getNextPageLink(_: string, url: URL): URL {
        const page = Number([...url.searchParams.values()][0] ?? '1');
        const nextPage = Math.min(page + 1, 200);
        return new URL(`https://${url.hostname}/mieszkania/warszawa?page=${nextPage}`);
    }

    hasNextPage(_: string, url: URL): boolean {
        const page = Number([...url.searchParams.values()][0] ?? '0');
        return page < 200;
    }

    getOffersLinks(html: string, url: URL): URL[] {
        const $ = load(html);
        return $('a.card__outer')
            .toArray()
            .filter(element => !!$(element).attr('href'))
            .map(element => new URL($(element).attr('href')!, url.origin));
    }
}

function extractMorizonDetailRowValue({contains, $} : {contains: string; $: CheerioAPI}) {
    const element = getFirstElement({
        selector: `div.zyVm89:contains("${contains}")`, $
    });
    return getFirstChildrenText({
        selector: '.EEGlsn',
        element, $
    });
}
