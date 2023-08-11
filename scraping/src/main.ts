import { Apartment, Currency, DecimalNumber, LatLang, Money, Offer } from 'mes-proto-ts'

console.log('Hello There!');

console.log('Protobuf types demo');

const test = Offer.create({
    id: 'asdasd',
    description: 'Test description',
    title: 'Test title',
    timeScraped: new Date(),
    apartment: Apartment.create({
        size: DecimalNumber.create({
            value: 10000,
            scale: 2
        }),
        price: Money.create({
            value: DecimalNumber.create({
                value: 100_000_00,
                scale: 2
            }),
            currency: Currency.PLN
        })   
    })
})

console.log(test);
console.log(Offer.toJSON(test));
console.log((test.apartment?.price?.value?.value ?? 1) * 10 ** -(test.apartment?.price?.value?.scale ?? 2))

import { load } from 'cheerio';
import { createMorizonOfferScraper } from './pages/morizon';

console.log('Scrapping morizon offer demo');

const scrape = async (url: string) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);
    const tmpX = $('div.detailed-information__row:contains("Pow. całkowita")').first().children('.detailed-information__cell--value').first().text();

    const yearBuilt = Number($('div.detailed-information__row:contains("Rok budowy")').first().children('.detailed-information__cell--value').first().text());

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

    const result = Offer.create({
        id: `morizon:${$('.property-page').first().attr('id')}`,
        apartment: Apartment.create({
            price: Money.create({
                value: DecimalNumber.create({
                    value: Number($('.price-row__price').first().text().replace(/\D/g, '')) * 100,
                    scale: 2,
                }),
                currency: Currency.PLN,
            }),
            size: DecimalNumber.create({
                value: Number(tmpX.replace(/\D/g, '')),
                scale: 2,
            }),
            location: LatLang.create({
                latitude, longitude
            }),
            address: $('.basic-info__location').first().text().replace(/\s+/g, ''),
            yearBuilt: yearBuilt,
            roomCount: Number($('.details-row .details-row__text').first().text().replace(/\D/g, '')),
            floor: floorNumber
        }),
        title: $('.description__title').first().text(),
        description: $('.description-text').first().text(),
        timeScraped: new Date(),
    })
    console.log(result);
}

scrape('https://www.morizon.pl/oferta/sprzedaz-mieszkanie-warszawa-mokotow-bialej-koniczyny-5-95m2-mzn2041954676');

console.log('Scrapper demo');

createMorizonOfferScraper().scrap(new Set()).then(console.log);