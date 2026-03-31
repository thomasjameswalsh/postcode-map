'use client';

import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { LatLngExpression } from "leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { PostcodeRow } from '@/lib/types/postcodes';

type PostcodeMapProps = {
    postcodesData: PostcodeRow[];
};

function FitToFirstPostcode({ postcodesData }: PostcodeMapProps) {
    const map = useMap();
    const hasPolygonRef = useRef(false);
    
    useEffect(() => {
        if ( ! postcodesData.length ) {
            hasPolygonRef.current = false;
            return;
        }

        if ( ! hasPolygonRef.current ) {
            const polygon = postcodesData[0].feature;
            const boundary = L.geoJSON(polygon).getBounds();
            if ( boundary.isValid() ) {
                map.flyToBounds(boundary, { padding: [20, 20] });
            }
            hasPolygonRef.current = true;
        }
    }, [postcodesData]);

    return null;
}

export default function PostcodeMap({ postcodesData }: PostcodeMapProps) {
    const center: LatLngExpression = [51.505, -0.09];

    return (
        <div className = "h-[500px] w-full">
        <MapContainer
            center = {center}
            zoom = {12}
            className = "w-full h-full">
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></TileLayer>
            
            <FitToFirstPostcode postcodesData={postcodesData} />

            {postcodesData.map((data, _index) => (
                <GeoJSON 
                key = { data.district_norm } 
                data = { data.feature }
                onEachFeature = {(_feature, layer) => {
                    layer.bindTooltip(data.district_norm, {
                        sticky: true,
                        direction: "top",
                        opacity: 0.95,
                        offset: [0, -8],
                        className: "postcode-tooltip",
                    });
                }} />
            ))};
        </MapContainer>
        </div>
    );
}