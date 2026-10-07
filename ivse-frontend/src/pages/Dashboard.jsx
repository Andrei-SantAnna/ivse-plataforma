// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [statusBanco, setStatusBanco] = useState('Verificando...');
  const [municipios, setMunicipios] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ municipios: 0, analises: 0 })

  useEffect(() => {
    // Busca o status do banco e os municípios cadastrados assim que a tela carrega
    const carregarDados = async () => {
      try {
        const healthRes = await api.get('/health');
        setStatusBanco(healthRes.data.banco_de_dados);

        const munRes = await api.get('/municipios');
        setMunicipios(munRes.data);

        const estatisticasRes = await api.get('/dashboard/estatisticas');
        setEstatisticas(estatisticasRes.data);
        
      } catch (error) {
        console.error("Erro ao conectar com a API", error);
        setStatusBanco('Erro de Conexão');
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Status do Backend</h3>
          <p className={`text-2xl font-bold mt-2 ${statusBanco === 'Conectado' ? 'text-green-600' : 'text-red-600'}`}>
            {statusBanco}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Municípios na Base</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{estatisticas.municipios}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Análises Realizadas</h3>
          <p className="text-2xl font-bold mt-2 text-blue-900">{estatisticas.analises}</p>
        </div>
      </div>

      {/* Lista Rápida */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Municípios Recentes</h3>
        {municipios.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {municipios.map(mun => (
              <li key={mun.id} className="py-3 flex justify-between items-center">
                <span className="font-medium text-gray-700">{mun.nome} - {mun.uf}</span>
                <span className="text-sm text-gray-500">IBGE: {mun.codigo_ibge}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum município cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}