import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

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
  const [municipios, setMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Coordenadas centrais do Estado da Bahia
  const posicaoBahia = [-12.9714, -38.5014];

  useEffect(() => {
    const carregarDadosMapa = async () => {
      try {
        // Busca a lista de municípios (que contêm as coordenadas geométricas ou latitude/longitude)
        const resposta = await api.get('/municipios');
        setMunicipios(resposta.data);
      } catch (erro) {
        console.error('Erro ao carregar dados geográficos para o mapa:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosMapa();
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Cabeçalho */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mapa de Vulnerabilidade</h1>
          <p className="text-sm text-gray-500 mt-1">Visualização geoespacial dos municípios da Bahia</p>
        </div>
        <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          Total mapeado: <strong>{municipios.length}</strong> municípios
        </div>
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

          {/* Renderização condicional dos marcadores se houver coordenadas disponíveis */}
          {municipios.map((mun) => {
            // Nota: Se a sua coluna de coordenadas no PostGIS (Point) estiver a retornar 
            // latitude/longitude separadas ou em formato GeoJSON, ajustamos aqui.
            // Caso venham num formato padrão, validamos a existência das coordenadas:
            if (!mun.latitude || !mun.longitude) return null;

            return (
              <Marker key={mun.codigo_ibge || mun.id} position={[mun.latitude, mun.longitude]}>
                <Popup>
                  <div className="p-1">
                    <strong className="text-gray-900">{mun.nome}</strong><br />
                    <span className="text-xs text-gray-500 font-mono">IBGE: {mun.codigo_ibge}</span><br />
                    <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">UF: {mun.uf}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default Mapa;