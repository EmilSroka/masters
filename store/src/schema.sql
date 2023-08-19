CREATE SCHEMA IF NOT EXISTS store;

CREATE TABLE IF NOT EXISTS store.offers (
    id TEXT PRIMARY KEY NOT NULL,
    details JSONB NOT NULL CHECK (
        details ? 'id' AND
        details ? 'apartment' AND
        (details->'apartment')::jsonb ? 'price' AND
        (details->'apartment')::jsonb ? 'size' AND
        (details->'apartment')::jsonb ? 'address'
    )
);
