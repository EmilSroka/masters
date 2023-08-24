import { ProcessingResult } from "./pipeline";

export enum PipelineErrorTypes {
    /* Kafka */
    KafkaMessageNoValue = 'KafkaMessageNoValue',
    CannotParseKafkaMessage = 'CannotParseKafkaMessage',
    /* Processing */
    OfferNoId = 'OfferNoId',
    OfferNoAddress = 'OfferNoAddress',
    OfferNoPrice = 'OfferNoPrice',
    OfferNoSize = 'OfferNoSize',
    /* Postgres */
    CannotInsertRow = 'CannotInsertRow',
    /* Other */
    UnknownError = 'UnknownError',
}

interface ErrorContructorParameter {
    type: PipelineErrorTypes,
    reasons: Error[],
    message?: string
}

export class PipelineError extends Error {
    type: PipelineErrorTypes;
    reasons: Error[];

    constructor({type, reasons, message}: ErrorContructorParameter) {
        super(message);
        this.type = type;
        this.reasons = reasons ?? [];
    }

    static KafkaMessageNoValue(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.KafkaMessageNoValue,
            message,
            reasons
        });
    }

    static CannotParseKafkaMessage(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.CannotParseKafkaMessage,
            message,
            reasons
        });
    }

    static CannotInsertRow(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.CannotInsertRow,
            message,
            reasons
        });
    }

    static OfferNoId(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.OfferNoId,
            message,
            reasons
        });
    }

    static OfferNoAddress(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.OfferNoAddress,
            message,
            reasons
        });
    }

    static OfferNoPrice(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.OfferNoPrice,
            message,
            reasons
        });
    }

    static OfferNoSize(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.OfferNoSize,
            message,
            reasons
        });
    }

    static UnknownError(message?: string, ...reasons: any[]) {
        return new PipelineError({
            type: PipelineErrorTypes.UnknownError,
            message,
            reasons
        });
    }

    toString() {
        const reasons = this.reasons.map((error, idx) => `\n        ${idx}: ${error} \n`).join('');
        const callStack = this.stack ? `\n    CallStack: ${this.stack}` : '';
        const reason = this.reasons.length > 0 ? `\n    Reasons: [${reasons}\n]` : '';
        return `PipelineError of type ${this.type}: ${this.message}${callStack}${reason}`
    }

    getType() {
        return this.type;
    }
}

function isPipelineError(variable: any): variable is PipelineError {
    return variable && typeof variable === 'object' && variable instanceof PipelineError;
}

const typeToCount = new Map<PipelineErrorTypes, number>();
let count = 0;
export function pipelineErrorHandler(error: any) {
    if (!isPipelineError(error)) {
        error = PipelineError.UnknownError('Unknown error while processing', error);
    }
    typeToCount.set(error.getType(), (typeToCount.get(error.getType()) ?? 0) + 1);
    console.log(error);
    count += 1;
    if (count === 100) {
        console.log(`Pipeline errors per type: """${JSON.stringify([...typeToCount])}"""`);
        count = 0;
    }
    return ProcessingResult.FailedSkip;
}
