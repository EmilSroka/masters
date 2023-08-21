import { Client, ConnectionConfig } from 'pg';
import { config } from 'dotenv';
import { PipelineError } from './errors';

const INSERT_QUERY = `
INSERT INTO store.offers (id, details)
VALUES ($1, $2);
`;

config();
const CONNECTION_SETTINGS: ConnectionConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: Number(process.env.PORT),
};

export async function savePostgresConstructor() {
    const client = new Client(CONNECTION_SETTINGS);
    await client.connect();
    return [
        async ([id, content]: [string, string]) => {
            try {
                await client.query(INSERT_QUERY, [id, content]);
            } catch (error) {
                throw PipelineError.CannotInsertRow(`Cannot save offer with id "${id}"`, error);
            }
        },
        async () => { 
            await client.end();
        }
    ] as const;
}
