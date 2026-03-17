'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import postcodePolygons from '@/data/Sample_PostcodeDistrictsPolygons_multi.json';

export default function() {
    const position = [51.505, -0.09];

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
            center = {position}
            zoom = {12}
            className = "w-full h-full">
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></TileLayer>
            
            <GeoJSON data={sampleFeature as any} />
        </MapContainer>
        </div>
    );
}