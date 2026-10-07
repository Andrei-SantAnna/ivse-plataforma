import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Correção padrão para o ícone do marcador do Leaflet no React
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Mapa = () => {
  // Coordenadas centrais aproximadas do Estado da Bahia (ex: região de Salvador/Feira)
  const posicaoBahia = [-12.9714, -38.5014];

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Mapa de Vulnerabilidade</h1>
        <p className="text-sm text-gray-500 mt-1">Visualização geoespacial dos índices TOPSIS por município</p>
      </div>

      {/* Contentor do Mapa */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
        <MapContainer 
          center={posicaoBahia} 
          zoom={7} 
          scrollWheelZoom={true} 
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={posicaoBahia}>
            <Popup>
              <strong>Bahia</strong> <br /> Centro operacional do IVSE.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Mapa;