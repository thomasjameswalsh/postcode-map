import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function normalisePostcodeDistrict(input: string): string {
    return input.trim().toUpperCase().replace(/\s+/g, "");
}

export async function GET(request: NextRequest) {
    const district = request.nextUrl.searchParams.get("district");

    if ( ! district ) {
        return NextResponse.json(
            { error: "Missing district parameter" },
            { status: 400 }
        );
    }

    const normalisedDistrict = normalisePostcodeDistrict(district);
    const queryResult = await pool.query(
        `
        SELECT district, district_norm, feature
        FROM postcodes
        WHERE district_norm = $1
        LIMIT 1
        `,
        [normalisedDistrict]
    );

    if ( queryResult.rows.length === 0 ) {
        return NextResponse.json(
            { error: "Postcode district not found in database." },
            { status: 400 }
        );
    }

    return NextResponse.json(queryResult.rows[0]);
}