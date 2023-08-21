import { PipelineError } from "./errors";

export type ProcessingFunction<I> = (input: I | undefined, errors: PipelineError | undefined) => Promise<ProcessingResult>

export enum ProcessingResult {
    Success = 'Success',
    FailedSkip = 'FailedSkip',
    FailedRetry = 'FailedRetry'
}

interface PipelieDetails<I, O> {
    inputSubscriber: (processingFunction: ProcessingFunction<I>) => Promise<() => Promise<void>>,
    process: (input: I) => Promise<O>,
    outputSaverConstructor: () => Promise<readonly [(output: O) => Promise<void>, () => Promise<void>]>,
    errorHandler: (error: any) => ProcessingResult
}

export class Pipeline<I, O> {
    details: PipelieDetails<I, O>;
    unsubscribe?: () => Promise<void>;
    close?: () => Promise<void>;
    

    constructor(details: PipelieDetails<I, O>) {
        this.details = details;
    }

    async process() {
        const [saveOutput, close] = await this.details.outputSaverConstructor();
        this.unsubscribe = await this.details.inputSubscriber(async (input, error) => {
            if (error) {
                return this.details.errorHandler(error);
            }
            try {
                if (input) {
                    let output = await this.details.process(input);
                    await saveOutput(output)
                    return ProcessingResult.Success;
                }
                return ProcessingResult.FailedSkip;
            } catch (error) {
                return this.details.errorHandler(error);
            }
        });
        this.close = close;
        
    }

    async stop() {
        await this.unsubscribe?.();
        await this.close?.();
    }

}
