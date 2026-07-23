import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Create a custom red icon for malicious IPs
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


export interface GeoMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  details?: string;
  isMalicious?: boolean;
}

interface GeoMapProps {
  markers: GeoMarker[];
}

function MapBoundsManager({ markers }: { markers: GeoMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [markers, map]);
  return null;
}

export default function GeoMap({ markers }: GeoMapProps) {
  const center: [number, number] = markers.length > 0 
    ? [markers[0].lat, markers[0].lng] 
    : [20, 0]; // Default center (world view)

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-cyber-border relative z-0">
      <MapContainer 
        center={center} 
        zoom={3} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#0b1021' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapBoundsManager markers={markers} />
        
        {markers.map(marker => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]} 
            icon={marker.isMalicious ? redIcon : icon}
          >
            <Popup>
              <div className="p-1">
                <strong className="block text-[#0b1021] text-sm mb-1 font-mono">{marker.label}</strong>
                {marker.details && <span className="text-xs text-gray-600 block">{marker.details}</span>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
