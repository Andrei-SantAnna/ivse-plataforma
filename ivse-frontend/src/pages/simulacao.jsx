import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Play, Trophy, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Simulacao() {
  const [indicadores, setIndicadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  // Estado do Formulário
  const [titulo, setTitulo] = useState('');
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [criterios, setCriterios] = useState([
    { indicador_id: '', peso: 1, tipo_direcao: 'beneficio' }
  ]);

  // Carrega os indicadores disponíveis na base de dados quando a página abre
  useEffect(() => {
    const carregarIndicadores = async () => {
      try {
        const res = await api.get('/indicadores');
        setIndicadores(res.data);
      } catch (err) {
        console.error(err);
        setErro('Não foi possível carregar a lista de indicadores do banco de dados.');
      }
    };
    carregarIndicadores();
  }, []);

  const adicionarCriterio = () => {
    setCriterios([...criterios, { indicador_id: '', peso: 1, tipo_direcao: 'beneficio' }]);
  };

  const removerCriterio = (index) => {
    const novosCriterios = criterios.filter((_, i) => i !== index);
    setCriterios(novosCriterios);
  };

  const atualizarCriterio = (index, campo, valor) => {
    const novosCriterios = [...criterios];
    novosCriterios[index][campo] = valor;
    setCriterios(novosCriterios);
  };

  const executarAnalise = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    // Validação simples
    if (criterios.some(c => !c.indicador_id)) {
      setErro('Por favor, selecione um indicador para todos os critérios.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        titulo,
        ano_referencia: Number(anoReferencia),
        criterios: criterios.map(c => ({
          indicador_id: Number(c.indicador_id),
          peso: Number(c.peso),
          tipo_direcao: c.tipo_direcao
        }))
      };

      const res = await api.post('/topsis/executar', payload);
      setResultado(res.data);
    } catch (err) {
      console.error(err);
      setErro(err.response?.data?.erro || 'Erro ao executar a análise TOPSIS. Verifique se os municípios possuem dados para os indicadores selecionados.');
    } finally {
      setLoading(false);
    }
  };

  const limparResultados = () => setResultado(null);

  // TELA DE RESULTADOS (Mostra o Ranking)
  if (resultado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">Resultado da Análise</h3>
          <button 
            onClick={limparResultados}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} /> Nova Simulação
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800 uppercase">Resumo</p>
              <h4 className="text-lg font-bold text-gray-900 mt-1">{titulo} (Ano: {anoReferencia})</h4>
              <p className="text-sm text-gray-600 mt-1">Municípios analisados: {resultado.total_analisado}</p>
            </div>
            <Trophy size={48} className="text-blue-300" />
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Posição</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Município</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Score IVSE</th>
              </tr>
            </thead>
            <tbody>
              {resultado.ranking.map((rank, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-bold text-gray-500">#{rank.posicao_ranking}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{rank.municipio}</td>
                  <td className="py-4 px-6 text-blue-600 font-bold">
                    {(rank.ivse_score * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // TELA DE FORMULÁRIO (Configuração)
  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Configurar Nova Simulação TOPSIS</h3>

      {erro && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle size={20} className="mt-0.5" />
          <p className="text-sm">{erro}</p>
        </div>
      )}

      <form onSubmit={executarAnalise} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título da Análise</label>
            <input 
              type="text" required
              value={titulo} onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ex: Vulnerabilidade Energética Baixada"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano de Referência</label>
            <input 
              type="number" required
              value={anoReferencia} onChange={(e) => setAnoReferencia(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Critérios (Indicadores)</label>
            <button 
              type="button" onClick={adicionarCriterio}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={16} /> Adicionar Indicador
            </button>
          </div>

          <div className="space-y-4">
            {criterios.map((criterio, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <select 
                    value={criterio.indicador_id}
                    onChange={(e) => atualizarCriterio(index, 'indicador_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um indicador...</option>
                    {indicadores.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.codigo} - {ind.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number" min="0.1" step="0.1"
                    value={criterio.peso}
                    onChange={(e) => atualizarCriterio(index, 'peso', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    title="Peso do critério" required
                  />
                </div>
                <div className="w-36">
                  <select 
                    value={criterio.tipo_direcao}
                    onChange={(e) => atualizarCriterio(index, 'tipo_direcao', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beneficio">Benefício (+)</option>
                    <option value="custo">Custo (-)</option>
                  </select>
                </div>
                <button 
                  type="button" onClick={() => removerCriterio(index)}
                  className="text-red-400 hover:text-red-600 p-2"
                  disabled={criterios.length === 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-70"
          >
            {loading ? 'A calcular...' : <><Play size={20} /> Executar Motor TOPSIS</>}
          </button>
        </div>
      </form>
    </div>
  );
}