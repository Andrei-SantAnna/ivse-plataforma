import { useState } from 'react';

const Indicadores = () => {
  // Lista oficial de indicadores do projeto IVSE
  const [indicadores] = useState([
    {
      codigo: 'I01',
      nome: 'Acesso à energia elétrica',
      dimensao: 'Energética',
      fonte: 'IBGE (Censo 2022)',
      formula: '(Domicílios com rede elétrica / Total) × 100',
      unidade: '%',
      topsis: 'Benefício (↑)',
      descricao: 'Métrica primária de inclusão energética e combate à pobreza energética.'
    },
    {
      codigo: 'I02',
      nome: 'Rendimento domiciliar per capita',
      dimensao: 'Socioeconômica',
      fonte: 'IBGE (Censo 2022)',
      formula: 'Soma dos rendimentos / Número de moradores',
      unidade: 'R$',
      topsis: 'Benefício (↑)',
      descricao: 'Define a capacidade de pagamento por serviços essenciais de energia.'
    },
    {
      codigo: 'I03',
      nome: 'Acesso à internet',
      dimensao: 'Infraestrutura',
      fonte: 'IBGE (Censo 2022)',
      formula: '(Domicílios com internet / Total) × 100',
      unidade: '%',
      topsis: 'Benefício (↑)',
      descricao: 'Variável proxy para letramento digital e integração com redes inteligentes.'
    },
    {
      codigo: 'I04',
      nome: 'Densidade de moradores por dormitório',
      dimensao: 'Habitacional',
      fonte: 'IBGE (Censo 2022)',
      formula: 'Total de moradores / Total de dormitórios',
      unidade: 'hab/dorm',
      topsis: 'Custo (↓)',
      descricao: 'Indicador de déficit habitacional e condições precárias de infraestrutura.'
    },
    {
      codigo: 'I05',
      nome: 'Potência de GD renovável per capita',
      dimensao: 'Energética',
      fonte: 'ANEEL (SIGA) + IBGE',
      formula: 'Potência instalada GD (kW) / População municipal',
      unidade: 'kW/hab',
      topsis: 'Benefício (↑)',
      descricao: 'Mede a penetração de fontes renováveis descentralizadas locais.'
    },
    {
      codigo: 'I06',
      nome: 'Participação solar na GD total',
      dimensao: 'Energética',
      fonte: 'ANEEL (SIGA)',
      formula: '(Potência Solar Fotovoltaica / Potência Total) × 100',
      unidade: '%',
      topsis: 'Benefício (↑)',
      descricao: 'Avalia a facilidade de adoção de energia sustentável descentralizada.'
    }
  ]);

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Indicadores do IVSE</h1>
        <p className="text-sm text-gray-500 mt-1">Parâmetros multicritério utilizados no cálculo do TOPSIS</p>
      </div>

      {/* Grelha de Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicadores.map((ind) => (
          <div key={ind.codigo} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-semibold rounded-full">
                  {ind.codigo}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  ind.topsis.includes('Benefício') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {ind.topsis}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{ind.nome}</h3>
              <p className="text-xs font-medium text-blue-600 mb-3 uppercase tracking-wider">{ind.dimensao}</p>
              
              <p className="text-sm text-gray-600 mb-4">{ind.descricao}</p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2 text-xs text-gray-500 space-y-1">
              <p><strong>Fonte:</strong> {ind.fonte}</p>
              <p><strong>Unidade:</strong> {ind.unidade}</p>
              <p className="font-mono bg-gray-50 p-2 rounded text-gray-600 mt-2"><strong>Fórmula:</strong> {ind.formula}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Indicadores;