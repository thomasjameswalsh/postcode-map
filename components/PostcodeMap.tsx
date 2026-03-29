'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import postcodePolygons from '@/data/Sample_PostcodeDistrictsPolygons_multi.json';
import type { LatLngExpression } from "leaflet";
import 'leaflet/dist/leaflet.css';

type PostcodeMapProps = {
    features: any[];
};

export default function PostcodeMap({ features }: PostcodeMapProps) {
    const center: LatLngExpression = [51.505, -0.09];

    type featureCollection = {
        type: string;
        features: any[];
    };
    const data = postcodePolygons as featureCollection;

    const sampleFeature = data.features.find(
        (feature: any) => feature.properties.name === "CM21"
    );

    return (
        <div className = "h-[500px] w-full">
        <MapContainer
            center = {center}
            zoom = {12}
            className = "w-full h-full">
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></TileLayer>
            
            {features.map((feature, _index) => (
                <GeoJSON key={feature.properties.name} data={feature} />
            ))};
        </MapContainer>
        </div>
    );
}