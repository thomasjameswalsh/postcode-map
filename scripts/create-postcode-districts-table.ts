import { loadEnvConfig } from "@next/env";
import { Client } from 'pg';

loadEnvConfig(process.cwd());

async function main() {
    const connectionString = process.env.DATABASE_URL_UNPOOLED;

    if ( !connectionString ) {
        console.log("Missing database url unpooled.");
    }

    const client = new Client({
        connectionString
    });

    await client.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS postcodes (
                district text NOT NULL,
                district_norm text PRIMARY KEY,
                feature jsonb NOT NULL
            );
        `);

        console.log("postcode_districts table created.");
    } finally {
        await client.end();
    }
}

main().catch((e) => {
    console.error("Failed to create table.");
    console.error(e);
    process.exit(1);
});