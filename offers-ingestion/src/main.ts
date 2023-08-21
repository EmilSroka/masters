import { pipelineErrorHandler } from "./errors";
import { kafkaSubscriber } from "./kafka";
import { Pipeline } from "./pipeline";
import { savePostgresConstructor } from "./postgresql";
import { offerToJSONProcessor } from "./processor";

new Pipeline({
    inputSubscriber: kafkaSubscriber,
    process: offerToJSONProcessor,
    outputSaverConstructor: savePostgresConstructor,
    errorHandler: pipelineErrorHandler,
}).process();