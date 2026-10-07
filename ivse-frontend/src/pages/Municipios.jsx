import { useState, useEffect } from 'react';
import api from '../services/api'; // Verifique se o caminho para a sua API está correto

const Municipios = () => {
  const [municipios, setMunicipios] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Vai buscar os dados ao backend quando a página carrega
  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        const resposta = await api.get('/municipios');
        console.log("DADOS QUE CHEGARAM:", resposta.data);
        setMunicipios(resposta.data);
      } catch (erro) {
        console.error('Erro ao buscar municípios:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarMunicipios();
  }, []);

  // Filtra a lista em tempo real com base no que for digitado na barra de pesquisa
  const municipiosFiltrados = municipios.filter((mun) =>
    mun.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    mun.codigo_ibge?.toString().includes(busca)
  );

  return (
    <div className="p-6">
      {/* Cabeçalho da Página e Barra de Pesquisa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Municípios da Bahia</h1>
          <p className="text-sm text-gray-500 mt-1">Base de dados para análise do IVSE</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome ou IBGE..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {/* Ícone de Lupa */}
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabela de Municípios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="p-4 font-semibold text-sm text-gray-600">Código IBGE</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Município</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {carregando ? (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-gray-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-6 w-6 bg-blue-400 rounded-full mb-3"></div>
                      A carregar municípios...
                    </div>
                  </td>
                </tr>
              ) : municipiosFiltrados.length > 0 ? (
                municipiosFiltrados.map((mun) => (
                  <tr key={mun.codigo_ibge || mun.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 font-mono">{mun.codigo_ibge}</td>
                    <td className="p-4 text-sm font-medium text-gray-800">{mun.nome}</td>
                    <td className="p-4 text-sm text-gray-600">{mun.uf}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-gray-500">
                    Nenhum município encontrado para "{busca}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Rodapé da tabela */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
          <span>Mostrando <strong>{municipiosFiltrados.length}</strong> de {municipios.length} registros</span>
        </div>
      </div>
    </div>
  );
};

export default Municipios;