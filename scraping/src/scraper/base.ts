import { Offer } from "mes-proto-ts";
import { OffersPersistence } from "../persistence/persistence";
import { FetchRetry } from "./utils";

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

export interface Scraper {
    scrap(persistance?: OffersPersistence): Promise<void>
}

class UrlToHtmlCache {
    private cache: Map<URL, string> = new Map();
    private fetch = new FetchRetry();

    async get(url: URL, removeAfterMs: number = 10000): Promise<string> {
        const maybeValue = this.cache.get(url)
        if (maybeValue) {
            return maybeValue;
        }
        const html = await this.fetch.handleRequest(url);
        this.cache.set(url, html);
        setTimeout(() => {
            this.cache.delete(url);
        }, removeAfterMs);
        return html;
    }
} 

interface BaseScraperConstructorInput {
    page: Page,
    scrapedOffersIds: Set<string>,
    publish: (offer: Offer) => Promise<void>
}

export class BaseScraper implements Scraper {
    urlToHtml: UrlToHtmlCache;
    scrapedOffersIds: Set<string>;
    publish: BaseScraperConstructorInput['publish'];
    page: Page;

    constructor({ page, scrapedOffersIds, publish }: BaseScraperConstructorInput) {
        this.page = page;
        this.publish = publish;
        this.scrapedOffersIds = scrapedOffersIds;
        this.urlToHtml = new UrlToHtmlCache();
    }

    async scrap() {
        let currentListUrl = this.page.entryOfferListUrl;
        do {
            const [offers, hasNextPage, nextPageUrlOrUndefined] = await this.handleListPage(currentListUrl);
            for (const offer of offers) {
                await this.publish(offer);
            }
            if (!hasNextPage) {
                return;
            }
            currentListUrl = nextPageUrlOrUndefined;
        } while (true);
    }

    async handleListPage(listPageUrl: URL): Promise<([Offer[], true, URL] | [Offer[], false, undefined])> {
        try {
            const pageHtml = await this.urlToHtml.get(listPageUrl);
            const offers = await this.scrapPageOffers(pageHtml, listPageUrl);
            const hasNextPage = offers.length > 0 && await this.page.offerListNavigator.hasNextPage(pageHtml, listPageUrl);
            if (hasNextPage) {
                return [offers, hasNextPage, this.page.offerListNavigator.getNextPageLink(pageHtml, listPageUrl)];
            } else {
                return [offers, hasNextPage, undefined];
            }
        } catch (error) {
            // TODO: error logging
            console.log(error);
            return [[], false, undefined]
        }
        
    }

    async scrapPageOffers(html: string, url: URL) {
        const result: Offer[] = [];
        const offersUrls = this.page.offerListNavigator.getOffersLinks(html, url);
        const fistNotScrappedIdx = await this.findFirstNotScrappedIndex(offersUrls);
        for (let i=0; i<=fistNotScrappedIdx; i++) {
            try {
                const offerPageHtml = await this.urlToHtml.get(offersUrls[i]);
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

    private async findFirstNotScrappedIndex(offersUrls: URL[]) {
        let left = 0;
        let right = offersUrls.length - 1;
        while (left <= right) {
            const mid = left + Math.floor((right - left) / 2);
            if (!await this.isScrapped(offersUrls[mid])) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return right;
    }

    private async isScrapped(url: URL) {
        try {
            const midOfferPageHtml = await this.urlToHtml.get(url);
            const offerId = this.page.offerScraper.getPageId(midOfferPageHtml);
            return this.scrapedOffersIds.has(offerId);
        } catch (error) {
            // TODO: error logging
            console.log(error);
            return false;
        }
    }
}
