import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bike marker icon
const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="m14 17 6-6"/>
      <path d="M6 6h4l2 3h4l2-3"/>
      <path d="M16 8L8 8"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41]
});

interface MapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function Map({ latitude, longitude, className = '' }: MapProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-700/50 ${className}`}>
      <MapContainer
        center={[latitude, longitude] as [number, number]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="filter brightness-75 contrast-125 saturate-50"
        />
        <Marker position={[latitude, longitude] as [number, number]} icon={bikeIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">Your Location</h3>
              <p className="text-sm text-slate-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Map overlay for dark theme */}
      <div className="absolute inset-0 bg-slate-900/20 pointer-events-none" />
    </div>
  );
}
