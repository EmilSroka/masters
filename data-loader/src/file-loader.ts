import { readFileSync } from "fs";

export async function loadFiles(prefix: string, suffix: string, process: (content: string) => Promise<void>) {
    let i=0;
    let tryNext = true;
    do {
        const path = `../files/${prefix}${i}${suffix}`;
        try {
            const fileContent = readFileSync(path, 'utf-8');
            await process(fileContent);
        } catch(error) {
            console.log(`Cannot load file with path "${path}" -> error: """${error}"""`);
            tryNext = false;
        }
        i++;
    } while(tryNext);
}