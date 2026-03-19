import { loadEnvConfig } from "@next/env";
import fs from "fs/promises";
import path from "path";
import { Client } from "pg";

loadEnvConfig(process.cwd());

const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
});

function normalizeDistrict(input: string) {
  return String(input).trim().toUpperCase().replace(/\s+/g, "");
}

async function main() {
    await client.connect();

    const filePath = path.join(process.cwd(), "data/PostcodeDistrictsPolygons_multi.json");
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);

    let inserted = 0;
    let failed = 0;
    for ( const feature of data.features ) {
        const props = feature.properties ?? {};
        const rawDistrictCode = props.name ?? null;

        // This should not happen
        if ( !rawDistrictCode || rawDistrictCode.trim() === "") {
            console.log(`On insertion ${inserted + 1} no property name found.`);
            failed += 1;
            continue;
        }
        
        const normDistrictCode = normalizeDistrict(rawDistrictCode);

        await client.query(`
            INSERT INTO postcodes (district, district_norm, feature)
            VALUES ($1, $2, $3::jsonb)
            on conflict (district_norm) do update
            set feature = excluded.feature
        `,
        [rawDistrictCode, normDistrictCode, JSON.stringify(feature)]);

        inserted += 1;
    }

    await client.end();

    console.log("Population complete");
    console.log(`Inserted ${inserted} records`);
    console.log(`Failed ${failed} records missing district`);
}

main().catch((err) => {
  console.error("Operaiton failed");
  console.error(err);
});