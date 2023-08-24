import { Offer } from "mes-proto-ts";

export function transformFileContentToOffers(content: string): Offer[] {
    return content.split('\n\n\n')
        .map(text => transformOfferTextToOfferOrNull(text))
        .filter(text => text !== null) as Offer[];
}

function transformOfferTextToOfferOrNull(offerText: string) {
    try {
        const numberArray = offerText.split(',').map(Number);
        const uint8Array = new Uint8Array(numberArray);
        const offer = Offer.decode(uint8Array);
        if (typeof offer.id !== 'string') {
            return null;
        }
        return Offer.decode(uint8Array);
    } catch(error) {
        console.log(`Cannot decode content """${offerText}""" -> error: """${error}"""`);
        return null;
    }
}