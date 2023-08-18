export enum ScrapingErrorTypes {
    /* Base scrapping */
    NoElement = 'NoElement',
    MultipleElements = 'MultipleElements',
    NoAttribute = 'NoAttribute',
    NoChild = 'NoChild',
    /* Other Extractors */
    InvalidTemplate = 'InvalidTemplate',
    NoTemplateMatchFound = 'NoTemplateMatchFound',
    /* Offer scrapping */
    NoOfferId = 'NoOfferId',
    NoOfferPrice = 'NoOfferPrice',
    NoOfferSize = 'NoOfferSize',
    NoOfferAddress = 'NoOfferAddress',
    NoOfferOptionalAttribute = 'NoOfferOptionalAttribute',
    NoApartmentOptionalAttribute = 'NoApartmentOptionalAttribute',
    /* Converters  */
    NoDigits = 'NoDigits',
    /* Top Level */
    CannotScrapOffer = 'CannotScrapOffer',
    CannotFetchPage = 'CannotFetchPage'
}

interface ErrorContructorParameter {
    type: ScrapingErrorTypes,
    reasons: Error[],
    message?: string
}

export class ScrapingError extends Error {
    type: ScrapingErrorTypes;
    reasons: Error[];

    constructor({type, reasons, message}: ErrorContructorParameter) {
        super(message);
        this.type = type;
        this.reasons = reasons;
    }

    static NoId(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoOfferId,
            message,
            reasons
        });
    }

    static NoElement(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoElement,
            message,
            reasons
        });
    }

    static MultipleElements(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.MultipleElements,
            message,
            reasons
        });
    }

    static NoAttribute(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoAttribute,
            message,
            reasons
        });
    }

    static NoOfferPrice(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoOfferPrice,
            message,
            reasons
        });
    }

    static NoDigits(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoDigits,
            message,
            reasons
        });
    }

    static NoOfferSize(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoDigits,
            message,
            reasons
        });
    }

    static InvalidTemplate(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.InvalidTemplate,
            message,
            reasons
        });
    }

    static NoTemplateMatchFound(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoTemplateMatchFound,
            message,
            reasons
        });
    }

    static NoOfferOptionalAttribute(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoOfferOptionalAttribute,
            message,
            reasons
        });
    }

    static NoApartmentOptionalAttribute(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoApartmentOptionalAttribute,
            message,
            reasons
        });
    }

    static CannotScrapOffer(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.CannotScrapOffer,
            message,
            reasons
        });
    }

    static NoOfferAddress(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.NoOfferAddress,
            message,
            reasons
        });
    }

    static CannotFetchPage(message?: string, ...reasons: Error[]) {
        return new ScrapingError({
            type: ScrapingErrorTypes.CannotFetchPage,
            message,
            reasons
        });
    }

    toString() {
        const reasons = this.reasons.map((error, idx) => `\n        ${idx}: ${error} \n`).join('');
        const callStack = this.stack ? `\n    CallStack: ${this.stack}` : '';
        const reason = this.reasons.length > 0 ? `\n    Reasons: [${reasons}\n]` : '';
        return `ScrapingError of type ${this.type}: ${this.message}${callStack}${reason}`
    }
}

export function isScrapingError(variable: any): variable is ScrapingError {
    return variable && typeof variable === 'object' && variable instanceof ScrapingError;
}
