import { Offer } from "mes-proto-ts";
import { PipelineError } from "./errors";

export async function offerToJSONProcessor(offer: Offer): Promise<[string, string]> {
    if (!offer.id) {
        throw PipelineError.OfferNoId(`Offer does not contain id: content "${JSON.stringify(Offer.toJSON(offer))}"`);
    }
    if (!offer.apartment?.address) {
        throw PipelineError.OfferNoAddress(`Offer's apartment does not contain address: content """\n${JSON.stringify(Offer.toJSON(offer))}\n"""`);
    }
    if (!offer.apartment?.price) {
        throw PipelineError.OfferNoPrice(`Offer's apartment does not contain price: content """\n${JSON.stringify(Offer.toJSON(offer))}\n"""`);
    }
    if (!offer.apartment?.size) {
        throw PipelineError.OfferNoSize(`Offer's apartment does not contain size: content """\n${JSON.stringify(Offer.toJSON(offer))}\n"""`);
    }
    return [offer.id, Offer.toJSON(offer) as string] as [string, string];
}