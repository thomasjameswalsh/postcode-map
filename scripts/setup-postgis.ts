import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

loadEnvConfig(process.cwd());

const QUERY_CREATE_POSTGIS_EXTENSION = 
    `
    CREATE EXTENSION IF NOT EXISTS postgis; 
    `;

const QUERY_ADD_GEOM_COLUMN = 
    `
    ALTER TABLE postcodes
    ADD COLUMN IF NOT EXISTS geom geometry(MultiPolygon, 4326);
    `;

const QUERY_POPULATE_GEOM = 
    `
    UPDATE postcodes
    SET geom = 
    ST_SetSRID(
        ST_MULTI(
            ST_GeomFromGeoJSON(
                (feature->'geometry')::text
            )
        ),
        4326
    )
    WHERE geom IS NULL;
    `;

const QUERY_CREATE_SPATIAL_INDEX = 
    `
    CREATE INDEX IF NOT EXISTS postcodes_geom_idx
    ON postcodes
    USING GIST (geom);
    `;

const QUERY_CHECK_RESULT =
    `
    SELECT district_norm, ST_IsValid(geom) as is_valid, GeometryType(geom) as geometry_type
    FROM postcodes
    LIMIT 15;
    `;

async function main() {
    const connectionString = process.env.DATABASE_URL_UNPOOLED;

    if ( ! connectionString ) {
        throw new Error("Missing database unpooled connection parameter.");
    }

    const client = new Client({
        connectionString
    });

    await client.connect();

    try {
        console.log("Enabling PostGIS extension...");
        await client.query(QUERY_CREATE_POSTGIS_EXTENSION);

        console.log("Adding geom column if missing...");
        await client.query(QUERY_ADD_GEOM_COLUMN);

        console.log("Populating geom column from feature json...");
        await client.query(QUERY_POPULATE_GEOM);

        console.log("Creating spatial index...");
        await client.query(QUERY_CREATE_SPATIAL_INDEX);

        console.log("Querying sample result...\n");
        const result = await client.query(QUERY_CHECK_RESULT);
        console.log("Result:\n");
        console.table(result.rows);

    } finally {
        await client.end();
    }
}

main().catch((e) => {
    console.error("Query failed.");
    console.error(e);
    process.exit(1);
});
