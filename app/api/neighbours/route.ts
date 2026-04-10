import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const GET_POSTCODE_NEIGHBOURS_QUERY =
    `
    SELECT
        p.district,
        p.district_norm,
        p.feature
    FROM postcode_adjacency AS a
    JOIN postcodes AS p
        ON p.district_norm = a.neighbour_district_norm
    WHERE a.district_norm = $1
    ORDER BY p.district_norm;
    `;

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
    const districtPattern = /^[A-Z]{1,2}([0-9]{1,2}|[0-9][A-Z])$/;
    if ( ! districtPattern.test(normalisedDistrict) ) {
        return NextResponse.json(
            { error: "Postcode district is in an invalid format." },
            { status: 400 }
        );
    }

    try {
        const queryResult = await pool.query(
            GET_POSTCODE_NEIGHBOURS_QUERY, 
            [normalisedDistrict]);
        
        if ( queryResult.rows.length === 0 ) {
            return NextResponse.json(
                { error: "Postcode district not found in database." },
                { status: 404 }
            );
        }
        
        return NextResponse.json(queryResult.rows);
    } catch (error) {
        console.error("Failed to fetch postcode district:\n", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}