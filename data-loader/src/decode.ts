import { Offer } from "mes-proto-ts";

export function transformFileContentToOffers(content: string): Offer[] {
    return content.split('\n\n\n')
        .map(text => transformOfferTextToOfferOrNull(text))
        .filter(text => text !== null) as Offer[];
}

function transformOfferTextToOfferOrNull(offerText: string) {
    try {
        const offer = Offer.fromJSON(JSON.parse(offerText));
        if (typeof offer.id !== 'string') {
            return null;
        }
        return offer;
    } catch(error) {
        console.log(`Cannot decode content """${offerText}""" -> error: """${error}"""`);
        return null;
    }
}