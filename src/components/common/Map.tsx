import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LeafletMouseEvent } from 'leaflet';
import { Report } from '../../types';
import { getMarkerColor } from '../../utils/styleUtils';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  height?: string;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function Map({ 
  center = [18.4861, -69.9312], // Default to Santo Domingo
  zoom = 13, 
  markers = [], 
  onLocationSelect, 
  interactive = true,
  height = '100%'
}: MapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={interactive}
      style={{ height: height, width: '100%', zIndex: 0 }}
      dragging={interactive}
      zoomControl={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker) => (
        <Marker 
          key={marker.id} 
          position={[marker.lat, marker.lng]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{marker.tipo}</h3>
              <p className="text-sm">{marker.descripcion}</p>
              <span className={`inline-block w-3 h-3 rounded-full ${getMarkerColor(marker.tipo)}`}></span>
            </div>
          </Popup>
        </Marker>
      ))}

      {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
    </MapContainer>
  );
}
