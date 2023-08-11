import { Apartment, Currency, DecimalNumber, LatLang, Money, Offer } from "mes-proto-ts";
import { CheerioAPI, load } from 'cheerio';
import { BaseScraper, OfferListNavigator, OfferScraper } from "../scraper/base";

export const createMorizonOfferScraper = () => new BaseScraper({
    offerScraper: new MorizonOfferScraper(),
    offerListNavigator: new MorizonOfferListNavigator(),
    entryOfferListUrl: new URL('https://www.morizon.pl/mieszkania/warszawa/'),
});

class MorizonOfferScraper implements OfferScraper {
    PAGE_ID_SELECTOR = '.property-page';

    getData(html: string): Offer {
        const $ = load(html);

        const floorString = ($('.details-row .details-row__text').last().text().split('/')[0] ?? '')
        const floorNumber = floorString.includes('parter') ? 0 : Number(floorString.replace(/\D/g, ''))

        const regex = /latitude:([\d.]+),longitude:([\d.]+)/;
        const match = html.match(regex);
        let latitude = 0;
        let longitude = 0;
        if (match) {
            latitude = parseFloat(match[1]);
            longitude = parseFloat(match[2]);
        }

        return Offer.create({
            id: `morizon:${$(this.PAGE_ID_SELECTOR).first().attr('id')}`,
            apartment: Apartment.create({
                price: Money.create({
                    value: DecimalNumber.create({
                        value: Number(deleteNotDigits(getFirstText('.price-row__price', $))) * 100,
                        scale: 2,
                    }),
                    currency: Currency.PLN,
                }),
                size: DecimalNumber.create({
                    value: Number(deleteNotDigits(detailRow('Pow. całkowita', $))),
                    scale: 2,
                }),
                location: LatLang.create({
                    latitude, longitude
                }),
                address: /* getFirstText('.basic-info__location', $) */ deleteWhite(getFirstText('.basic-info__location', $)),
                yearBuilt: Number(detailRow('Rok budowy', $)),
                roomCount: Number(deleteNotDigits(getFirstText('.details-row .details-row__text', $))),
                floor: floorNumber
            }),
            title: $('.description__title').first().text(),
            description: $('.description-text').first().text(),
            timeScraped: new Date(),
        })
    }

    getPageId(html: string): string {
        const $ = load(html);
        return `morizon:${$(this.PAGE_ID_SELECTOR).first().attr('id')}`
    }
}

class MorizonOfferListNavigator implements OfferListNavigator {
    NEXT_PAGE_SELECTOR = '.pagination__main-button a';

    getNextPageLink(_: string, url: URL): URL {
        const page = Number([...url.searchParams.values()][0] ?? '0');
        const nextPage = Math.min(page + 1, 200);
        return new URL(`/mieszkania/warszawa/?page=${nextPage}`, url.hostname);
    }

    hasNextPage(_: string, url: URL): boolean {
        const page = Number([...url.searchParams.values()][0] ?? '0');
        return page < 200;
    }

    getOffersLinks(html: string, url: URL): URL[] {
        const $ = load(html);
        return $('a.offer__outer')
            .toArray()
            .filter(element => !!$(element).attr('href'))
            .map(element => new URL($(element).attr('href')!, url.origin));
    }
    
}

function detailRow(contains: string, $: CheerioAPI) {
    return $(`div.detailed-information__row:contains("${contains}")`).first().children('.detailed-information__cell--value').first().text();
}

function deleteNotDigits(value: string) {
    return value.replace(/\D/g, '');
}

function deleteWhite(value: string) {
    return value.replace(/\s+/g, '');
}

function getFirstText(selector: string, $: CheerioAPI) {
    return $(selector).first().text();
}

function getLastText(selector: string, $: CheerioAPI) {
    return $(selector).first().text();
}