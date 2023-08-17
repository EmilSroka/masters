import { error } from "console";
import { Offer } from "mes-proto-ts";
import { OffersPersistence } from "../persistence/persistence";

export interface Page {
    offerScraper: OfferScraper,
    offerListNavigator: OfferListNavigator,
    entryOfferListUrl: URL,
}

export interface OfferScraper {
    getData: (html: string) => Offer
    getPageId: (html: string) => string
}

export interface OfferListNavigator {
    getNextPageLink: (html: string, url: URL) => URL,
    hasNextPage: (html: string, url: URL) => boolean,
    getOffersLinks: (html: string, url: URL) => URL[]
}

class UrlToHtmlCache {
    private cache: Map<URL, string> = new Map();

    async get(url: URL): Promise<string> {
        const maybeValue = this.cache.get(url)
        if (maybeValue) {
            return maybeValue;
        }
        const html = await fetch(url).then(response => response.text());
        this.cache.set(url, html);
        return html;
    }

} 

export class BaseScraper {
    offerPersistance?: OffersPersistence;
    urlToHtml: UrlToHtmlCache;
    page: Page;

    constructor(page: Page, offerPersistance?: OffersPersistence) {
        this.page = page;
        this.urlToHtml = new UrlToHtmlCache();
        this.offerPersistance = offerPersistance;
    }

    async scrap(scrapedOffersIds: Set<string>) {
        const result: Offer[] = [];
        let currentListUrl = this.page.entryOfferListUrl;
        let scrapNext;
        do {
            const pageHtml = await this.urlToHtml.get(currentListUrl);
            const offers = await this.scrapPageOffers(pageHtml, scrapedOffersIds, currentListUrl);
            result.push(...offers);
            if (this.offerPersistance) {
                for (const offer of offers) {
                    this.offerPersistance?.publishOffer(offer);
                }
            }
            scrapNext = offers.length > 0 && await this.page.offerListNavigator.hasNextPage(pageHtml, currentListUrl);
        } while (scrapNext);
        return result;
    }

    async scrapPageOffers(html: string, scrapedOffersIds: Set<string>, url: URL) {
        const result: Offer[] = [];
        const offersUrls = this.page.offerListNavigator.getOffersLinks(html, url);
        const fistNotScrappedIdx = await this.findFirstNotScrappedIndex(offersUrls, scrapedOffersIds);
        for (let i=0; i<=fistNotScrappedIdx; i++) {
            const offerPageHtml = await this.urlToHtml.get(offersUrls[i]);
            try {
                const offer = this.page.offerScraper.getData(offerPageHtml);
                result.push(offer);
                // TODO: delete log
                console.log('Scrapped: ', offer.id);
            } catch(error) {
                // TODO: error logging
                console.log(error);
            }
        }
        return result;
    }

     private async findFirstNotScrappedIndex(offersUrls: URL[], scrapedOffersIds: Set<string>) {
        let left = 0;
        let right = offersUrls.length - 1;
        while (left <= right) {
            const mid = left + Math.floor((right - left) / 2);
            const offerUrl = offersUrls[mid];
            const midOfferPageHtml = await this.urlToHtml.get(offerUrl);
            const offerId = this.page.offerScraper.getPageId(midOfferPageHtml);
            if (!scrapedOffersIds.has(offerId)) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return right;
    }
}
