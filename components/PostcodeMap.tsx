'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import postcodePolygons from '@/data/Sample_PostcodeDistrictsPolygons_multi.json';
import type { LatLngExpression } from "leaflet";
import 'leaflet/dist/leaflet.css';

import { PostcodeRow } from '@/lib/types/postcodes';
import { GeojsonFeature } from '@/lib/types/geojson';

type PostcodeMapProps = {
    postcodesData: PostcodeRow[];
};

export default function PostcodeMap({ postcodesData }: PostcodeMapProps) {
    const center: LatLngExpression = [51.505, -0.09];222

    return (
        <div className = "h-[500px] w-full">
        <MapContainer
            center = {center}
            zoom = {12}
            className = "w-full h-full">
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></TileLayer>
            
            {postcodesData.map((data, _index) => (
                <GeoJSON 
                key = { data.district_norm } 
                data = { data.feature } />
            ))};
        </MapContainer>
        </div>
    );
}