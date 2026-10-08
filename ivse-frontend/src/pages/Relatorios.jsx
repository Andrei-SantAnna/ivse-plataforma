import {
  useEffect,
  useState
} from 'react';

import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import {
  jsPDF
} from 'jspdf';

import autoTable from 'jspdf-autotable';

import api from '../services/api';


export default function Relatorios() {

  const [analises, setAnalises] =
    useState([]);

  const [
    analiseSelecionada,
    setAnaliseSelecionada
  ] = useState('');

  const [carregando, setCarregando] =
    useState(true);

  const [gerando, setGerando] =
    useState(false);

  const [erro, setErro] =
    useState(null);

  const [sucesso, setSucesso] =
    useState(null);


  // ============================================================
  // CARREGAR ANÁLISES
  // ============================================================

  useEffect(() => {

    const carregar =
      async () => {

        try {

          setCarregando(true);


          const resposta =
            await api.get(
              '/topsis/analises'
            );


          const lista =
            Array.isArray(
              resposta.data
            )
              ? resposta.data
              : [];


          setAnalises(
            lista
          );


          if (
            lista.length > 0
          ) {

            setAnaliseSelecionada(
              String(
                lista[0].id
              )
            );

          }


        } catch (erro) {

          console.error(
            erro
          );


          setErro(
            'Não foi possível carregar as análises.'
          );


        } finally {

          setCarregando(false);

        }

      };


    carregar();

  }, []);


  // ============================================================
  // GERAR PDF
  // ============================================================

  const gerarPDF =
    async () => {

      if (
        !analiseSelecionada
      ) {

        setErro(
          'Selecione uma análise.'
        );

        return;

      }


      try {

        setGerando(true);

        setErro(null);

        setSucesso(null);


        const resposta =
          await api.get(
            `/topsis/analises/${analiseSelecionada}/relatorio`
          );


        const {
          analise,
          criterios,
          estatisticas,
          resultados
        } = resposta.data;


        const doc =
          new jsPDF({
            orientation:
              'portrait',

            unit:
              'mm',

            format:
              'a4'
          });


        // ========================================================
        // TÍTULO
        // ========================================================

        doc.setFontSize(18);

        doc.text(
          'Relatório IVSE',
          14,
          18
        );


        doc.setFontSize(11);


        doc.text(
          `Análise: ${analise.titulo}`,
          14,
          28
        );


        doc.text(
          `Ano de referência: ${analise.ano_referencia}`,
          14,
          35
        );


        doc.text(
          `Municípios analisados: ${analise.total_municipios}`,
          14,
          42
        );


        const data =
          analise.data_execucao
            ? new Date(
                analise.data_execucao
              ).toLocaleString(
                'pt-BR'
              )
            : '-';


        doc.text(
          `Data de execução: ${data}`,
          14,
          49
        );


        // ========================================================
        // ESTATÍSTICAS
        // ========================================================

        doc.setFontSize(14);

        doc.text(
          'Resumo da análise',
          14,
          61
        );


        doc.setFontSize(10);


        doc.text(
          `IVSE médio: ${Number(
            estatisticas.ivse_medio
          ).toFixed(4)}`,
          14,
          69
        );


        doc.text(
          `Maior IVSE: ${Number(
            estatisticas.maior_ivse
          ).toFixed(4)}`,
          14,
          75
        );


        doc.text(
          `Menor IVSE: ${Number(
            estatisticas.menor_ivse
          ).toFixed(4)}`,
          14,
          81
        );


        // ========================================================
        // CRITÉRIOS
        // ========================================================

        doc.setFontSize(14);

        doc.text(
          'Critérios utilizados',
          14,
          94
        );


        autoTable(
          doc,
          {

            startY:
              99,

            head: [[
              'Código',
              'Indicador',
              'Peso',
              'Direção'
            ]],

            body:
              criterios.map(
                criterio => [

                  criterio.codigo,

                  criterio.nome,

                  Number(
                    criterio.peso
                  ).toFixed(2),

                  criterio.tipo_direcao ===
                  'beneficio'
                    ? 'Benefício'
                    : 'Custo'

                ]
              ),

            styles: {
              fontSize: 8
            },

            headStyles: {
              fontStyle:
                'bold'
            }

          }
        );


        // ========================================================
        // RANKING
        // ========================================================

        const inicioRanking =
          doc.lastAutoTable.finalY +
          12;


        doc.setFontSize(14);

        doc.text(
          'Ranking dos Municípios',
          14,
          inicioRanking
        );


        autoTable(
          doc,
          {

            startY:
              inicioRanking + 5,

            head: [[
              'Pos.',
              'Município',
              'IBGE',
              'IVSE',
              'D+',
              'D-'
            ]],

            body:
              resultados.map(
                item => [

                  item.posicao_ranking,

                  item.nome,

                  item.codigo_ibge,

                  Number(
                    item.ivse_score
                  ).toFixed(4),

                  item.dist_ideal_positiva !==
                  null
                    ? Number(
                        item.dist_ideal_positiva
                      ).toFixed(4)
                    : '-',

                  item.dist_ideal_negativa !==
                  null
                    ? Number(
                        item.dist_ideal_negativa
                      ).toFixed(4)
                    : '-'

                ]
              ),

            styles: {
              fontSize: 7
            },

            headStyles: {
              fontStyle:
                'bold'
            },

            didDrawPage:
              data => {

                const pagina =
                  doc.internal
                    .getNumberOfPages();


                doc.setFontSize(
                  8
                );


                doc.text(
                  `Plataforma IVSE - Página ${pagina}`,
                  14,
                  290
                );

              }

          }
        );


        // ========================================================
        // SALVAR
        // ========================================================

        const nomeSeguro =
          analise.titulo
            .replace(
              /[^a-z0-9]/gi,
              '_'
            )
            .toLowerCase();


        doc.save(
          `relatorio_ivse_${nomeSeguro}.pdf`
        );


        setSucesso(
          'Relatório PDF gerado com sucesso.'
        );


      } catch (erro) {

        console.error(
          'Erro ao gerar relatório:',
          erro
        );


        setErro(
          erro.response?.data?.erro ||
          'Não foi possível gerar o relatório.'
        );


      } finally {

        setGerando(false);

      }

    };


  if (carregando) {

    return (

      <div className="p-6">
        Carregando análises...
      </div>

    );

  }


  return (

    <div
      className="
        space-y-6
      "
    >

      {/* CABEÇALHO */}

      <div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
            "
          >

            <FileText
              size={22}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              Relatórios
            </h1>


            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Gere relatórios em PDF
              das análises TOPSIS realizadas.
            </p>

          </div>

        </div>

      </div>


      {/* MENSAGENS */}

      {erro && (

        <div
          className="
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-lg
            p-4
            flex
            gap-3
          "
        >

          <AlertCircle
            size={20}
          />

          {erro}

        </div>

      )}


      {sucesso && (

        <div
          className="
            bg-green-50
            border
            border-green-200
            text-green-700
            rounded-lg
            p-4
            flex
            gap-3
          "
        >

          <CheckCircle2
            size={20}
          />

          {sucesso}

        </div>

      )}


      {/* FORMULÁRIO */}

      <div
        className="
          bg-white
          rounded-xl
          shadow-sm
          border
          border-gray-100
          p-6
        "
      >

        <label
          className="
            block
            text-sm
            font-medium
            text-gray-700
            mb-2
          "
        >
          Análise
        </label>


        <select

          value={
            analiseSelecionada
          }

          onChange={
            e =>
              setAnaliseSelecionada(
                e.target.value
              )
          }

          className="
            w-full
            border
            border-gray-300
            rounded-lg
            p-3
            bg-white
            mb-5
          "
        >

          <option value="">
            Selecione uma análise...
          </option>


          {analises.map(
            analise => (

              <option
                key={
                  analise.id
                }
                value={
                  analise.id
                }
              >
                {
                  analise.titulo
                }
                {' - '}
                {
                  analise.ano_referencia
                }
              </option>

            )
          )}

        </select>


        <button

          onClick={
            gerarPDF
          }

          disabled={
            gerando ||
            !analiseSelecionada
          }

          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-lg
            font-medium
            flex
            items-center
            gap-2
            disabled:opacity-50
          "
        >

          <Download
            size={18}
          />


          {
            gerando
              ? 'Gerando relatório...'
              : 'Gerar PDF'
          }

        </button>

      </div>

    </div>

  );

}