import type { GeojsonFeature } from "@/lib/types/geojson";

export type PostcodeRow = {
    district: string;
    district_norm: string;
    feature: GeojsonFeature;
};