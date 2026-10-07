// src/pages/Dashboard.jsx

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Activity,
  MapPin,
  Database,
  BarChart3,
  Trophy,
  AlertCircle,
  Map,
  GitCompareArrows,
  Play,
  CalendarDays
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';

import api from '../services/api';


export default function Dashboard() {

  const [statusBanco, setStatusBanco] =
    useState('Verificando...');

  const [estatisticas, setEstatisticas] =
    useState({
      municipios: 0,
      analises: 0
    });

  const [analises, setAnalises] =
    useState([]);

  const [municipios, setMunicipios] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState(null);


  // ============================================================
  // CARREGAR DASHBOARD
  // ============================================================

  useEffect(() => {

    const carregarDados =
      async () => {

        try {

          setCarregando(true);
          setErro(null);


          // ----------------------------------------------------
          // HEALTH
          // ----------------------------------------------------

          const healthRes =
            await api.get(
              '/health'
            );


          setStatusBanco(
            healthRes.data.banco_de_dados
          );


          // ----------------------------------------------------
          // ESTATÍSTICAS GERAIS
          // ----------------------------------------------------

          const estatisticasRes =
            await api.get(
              '/dashboard/estatisticas'
            );


          setEstatisticas(
            estatisticasRes.data
          );


          // ----------------------------------------------------
          // HISTÓRICO DE ANÁLISES
          // ----------------------------------------------------

          const analisesRes =
            await api.get(
              '/topsis/analises'
            );


          const listaAnalises =
            Array.isArray(
              analisesRes.data
            )
              ? analisesRes.data
              : [];


          setAnalises(
            listaAnalises
          );


          // ----------------------------------------------------
          // MUNICÍPIOS DA ANÁLISE MAIS RECENTE
          // ----------------------------------------------------

          if (
            listaAnalises.length > 0
          ) {

            const analiseMaisRecente =
              listaAnalises[0];


            const municipiosRes =
              await api.get(
                `/municipios?analise_id=${analiseMaisRecente.id}`
              );


            setMunicipios(
              Array.isArray(
                municipiosRes.data
              )
                ? municipiosRes.data
                : []
            );

          } else {

            setMunicipios([]);

          }


        } catch (error) {

          console.error(
            'Erro ao carregar dashboard:',
            error
          );


          setStatusBanco(
            'Erro de Conexão'
          );


          setErro(
            'Não foi possível carregar todos os dados do dashboard.'
          );


        } finally {

          setCarregando(false);

        }

      };


    carregarDados();

  }, []);


  // ============================================================
  // ANÁLISE MAIS RECENTE
  // ============================================================

  const ultimaAnalise =
    analises.length > 0
      ? analises[0]
      : null;


  // ============================================================
  // MUNICÍPIOS COM RESULTADO
  // ============================================================

  const municipiosComResultado =
    useMemo(
      () =>
        municipios.filter(
          municipio =>
            municipio.ivse_score !== null &&
            municipio.ivse_score !== undefined
        ),
      [municipios]
    );


  // ============================================================
  // IVSE MÉDIO
  // ============================================================

  const ivseMedio =
    useMemo(
      () => {

        if (
          municipiosComResultado.length === 0
        ) {
          return 0;
        }


        const soma =
          municipiosComResultado.reduce(
            (total, municipio) =>
              total +
              Number(
                municipio.ivse_score
              ),
            0
          );


        return (
          soma /
          municipiosComResultado.length
        );

      },
      [
        municipiosComResultado
      ]
    );


  // ============================================================
  // MAIOR IVSE
  // ============================================================

  const maiorIVSE =
    useMemo(
      () => {

        if (
          municipiosComResultado.length === 0
        ) {
          return null;
        }


        return [
          ...municipiosComResultado
        ].sort(
          (a, b) =>
            Number(
              b.ivse_score
            ) -
            Number(
              a.ivse_score
            )
        )[0];

      },
      [
        municipiosComResultado
      ]
    );


  // ============================================================
  // TOP 5 MAIORES IVSE
  // ============================================================

  const maioresIVSE =
    useMemo(
      () =>
        [
          ...municipiosComResultado
        ]
          .sort(
            (a, b) =>
              Number(
                b.ivse_score
              ) -
              Number(
                a.ivse_score
              )
          )
          .slice(
            0,
            5
          ),
      [
        municipiosComResultado
      ]
    );


  // ============================================================
  // DISTRIBUIÇÃO
  // ============================================================

  const distribuicao =
    useMemo(
      () => {

        const resultado = {
          muitoBaixa: 0,
          baixa: 0,
          moderada: 0,
          alta: 0,
          muitoAlta: 0
        };


        municipiosComResultado.forEach(
          municipio => {

            const valor =
              Number(
                municipio.ivse_score
              );


            if (valor < 0.2) {

              resultado.muitoBaixa++;

            } else if (
              valor < 0.4
            ) {

              resultado.baixa++;

            } else if (
              valor < 0.6
            ) {

              resultado.moderada++;

            } else if (
              valor < 0.8
            ) {

              resultado.alta++;

            } else {

              resultado.muitoAlta++;

            }

          }
        );


        return resultado;

      },
      [
        municipiosComResultado
      ]
    );


  // ============================================================
  // DATA
  // ============================================================

  const formatarData =
    valor => {

      if (!valor) {
        return '-';
      }


      const data =
        new Date(valor);


      if (
        Number.isNaN(
          data.getTime()
        )
      ) {
        return '-';
      }


      return data.toLocaleString(
        'pt-BR'
      );

    };


  // ============================================================
  // LOADING
  // ============================================================

  if (carregando) {

    return (

      <div
        className="
          bg-white
          rounded-xl
          shadow-sm
          border
          border-gray-100
          p-10
          text-center
        "
      >

        <p
          className="
            text-gray-500
          "
        >
          Carregando dashboard...
        </p>

      </div>

    );

  }


  return (

    <div
      className="
        space-y-6
      "
    >


      {/* ====================================================== */}
      {/* CABEÇALHO */}
      {/* ====================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          flex-wrap
        "
      >

        <div>

          <h1
            className="
              text-2xl
              font-bold
              text-gray-800
            "
          >
            Dashboard IVSE
          </h1>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Visão geral das análises de
            vulnerabilidade social energética.
          </p>

        </div>


        <div
          className="
            flex
            gap-2
            flex-wrap
          "
        >

          <Link

            to="/mapa"

            className="
              bg-white
              border
              border-blue-200
              text-blue-600
              hover:bg-blue-50
              px-4
              py-2.5
              rounded-lg
              text-sm
              font-medium
              flex
              items-center
              gap-2
            "
          >

            <Map size={17} />

            Ver Mapa

          </Link>


          <Link

            to="/comparacao"

            className="
              bg-white
              border
              border-blue-200
              text-blue-600
              hover:bg-blue-50
              px-4
              py-2.5
              rounded-lg
              text-sm
              font-medium
              flex
              items-center
              gap-2
            "
          >

            <GitCompareArrows
              size={17}
            />

            Comparar

          </Link>


          <Link

            to="/simulacao"

            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2.5
              rounded-lg
              text-sm
              font-medium
              flex
              items-center
              gap-2
            "
          >

            <Play size={17} />

            Nova Simulação

          </Link>

        </div>

      </div>


      {/* ====================================================== */}
      {/* ERRO */}
      {/* ====================================================== */}

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
            items-center
            gap-3
          "
        >

          <AlertCircle
            size={20}
          />

          <span
            className="
              text-sm
            "
          >
            {erro}
          </span>

        </div>

      )}


      {/* ====================================================== */}
      {/* CARDS PRINCIPAIS */}
      {/* ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-5
          gap-4
        "
      >


        {/* BACKEND */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                bg-emerald-50
                text-emerald-600
                rounded-lg
                flex
                items-center
                justify-center
              "
            >

              <Activity size={20} />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Backend
              </p>


              <p
                className={`
                  font-bold

                  ${
                    statusBanco ===
                    'Conectado'

                      ? 'text-green-600'

                      : 'text-red-600'
                  }
                `}
              >
                {statusBanco}
              </p>

            </div>

          </div>

        </div>


        {/* MUNICÍPIOS */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                bg-blue-50
                text-blue-600
                rounded-lg
                flex
                items-center
                justify-center
              "
            >

              <MapPin size={20} />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Municípios na base
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {estatisticas.municipios}
              </p>

            </div>

          </div>

        </div>


        {/* ANÁLISES */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                bg-violet-50
                text-violet-600
                rounded-lg
                flex
                items-center
                justify-center
              "
            >

              <Database size={20} />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Análises realizadas
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {estatisticas.analises}
              </p>

            </div>

          </div>

        </div>


        {/* MUNICÍPIOS ANALISADOS */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                bg-orange-50
                text-orange-600
                rounded-lg
                flex
                items-center
                justify-center
              "
            >

              <BarChart3 size={20} />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Última análise
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {
                  municipiosComResultado.length
                }
              </p>

              <p
                className="
                  text-xs
                  text-gray-400
                "
              >
                municípios
              </p>

            </div>

          </div>

        </div>


        {/* IVSE MÉDIO */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                bg-red-50
                text-red-600
                rounded-lg
                flex
                items-center
                justify-center
              "
            >

              <Activity size={20} />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                IVSE médio
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {
                  ivseMedio.toFixed(
                    4
                  )
                }
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* ÚLTIMA ANÁLISE */}
      {/* ====================================================== */}

      {ultimaAnalise && (

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              flex-wrap
            "
          >

            <div>

              <p
                className="
                  text-xs
                  uppercase
                  font-medium
                  text-blue-600
                  tracking-wide
                "
              >
                Análise mais recente
              </p>


              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-800
                  mt-1
                "
              >
                {ultimaAnalise.titulo}
              </h2>


              <div
                className="
                  flex
                  items-center
                  gap-4
                  flex-wrap
                  text-sm
                  text-gray-500
                  mt-2
                "
              >

                <span>
                  Ano:
                  {' '}
                  <strong>
                    {
                      ultimaAnalise.ano_referencia
                    }
                  </strong>
                </span>


                <span
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >

                  <CalendarDays
                    size={15}
                  />

                  {
                    formatarData(
                      ultimaAnalise.data_execucao
                    )
                  }

                </span>

              </div>

            </div>


            {maiorIVSE && (

              <div
                className="
                  bg-red-50
                  border
                  border-red-100
                  rounded-lg
                  px-5
                  py-3
                "
              >

                <p
                  className="
                    text-xs
                    text-red-500
                  "
                >
                  Maior IVSE
                </p>

                <p
                  className="
                    font-bold
                    text-gray-800
                  "
                >
                  {maiorIVSE.nome}
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-red-600
                  "
                >
                  {
                    Number(
                      maiorIVSE.ivse_score
                    ).toFixed(4)
                  }
                </p>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ====================================================== */}
      {/* DISTRIBUIÇÃO + TOP 5 */}
      {/* ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >


        {/* DISTRIBUIÇÃO */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-6
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-gray-800
              mb-1
            "
          >
            Distribuição do IVSE
          </h2>


          <p
            className="
              text-xs
              text-gray-500
              mb-5
            "
          >
            Classificação dos municípios
            da análise mais recente.
          </p>


          <div
            className="
              space-y-4
            "
          >

            <BarraDistribuicao
              titulo="Muito baixa"
              valor={
                distribuicao.muitoBaixa
              }
              total={
                municipiosComResultado.length
              }
              classe="bg-green-500"
            />


            <BarraDistribuicao
              titulo="Baixa"
              valor={
                distribuicao.baixa
              }
              total={
                municipiosComResultado.length
              }
              classe="bg-lime-500"
            />


            <BarraDistribuicao
              titulo="Moderada"
              valor={
                distribuicao.moderada
              }
              total={
                municipiosComResultado.length
              }
              classe="bg-yellow-500"
            />


            <BarraDistribuicao
              titulo="Alta"
              valor={
                distribuicao.alta
              }
              total={
                municipiosComResultado.length
              }
              classe="bg-orange-500"
            />


            <BarraDistribuicao
              titulo="Muito alta"
              valor={
                distribuicao.muitoAlta
              }
              total={
                municipiosComResultado.length
              }
              classe="bg-red-500"
            />

          </div>

        </div>


        {/* TOP 5 */}

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              mb-1
            "
          >

            <Trophy
              size={20}
              className="
                text-yellow-500
              "
            />

            <h2
              className="
                text-lg
                font-bold
                text-gray-800
              "
            >
              Maiores IVSE
            </h2>

          </div>


          <p
            className="
              text-xs
              text-gray-500
              mb-5
            "
          >
            Municípios com os maiores
            índices na análise mais recente.
          </p>


          <div
            className="
              divide-y
              divide-gray-100
            "
          >

            {maioresIVSE.map(
              (
                municipio,
                index
              ) => (

                <div
                  key={
                    municipio.id
                  }
                  className="
                    py-3
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        w-8
                        h-8
                        rounded-full
                        bg-gray-100
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-bold
                        text-gray-600
                      "
                    >
                      {index + 1}
                    </div>


                    <div>

                      <p
                        className="
                          font-medium
                          text-gray-800
                        "
                      >
                        {municipio.nome}
                      </p>

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Ranking geral:
                        {' '}
                        {
                          municipio.posicao_ranking
                        }º
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      font-bold
                      text-red-600
                    "
                  >
                    {
                      Number(
                        municipio.ivse_score
                      ).toFixed(4)
                    }
                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* HISTÓRICO RECENTE */}
      {/* ====================================================== */}

      <div
        className="
          bg-white
          rounded-xl
          border
          border-gray-100
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-4
            border-b
            border-gray-100
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-gray-800
            "
          >
            Análises Recentes
          </h2>

        </div>


        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead
              className="
                bg-gray-50
                text-gray-500
              "
            >

              <tr>

                <th
                  className="
                    text-left
                    px-6
                    py-3
                  "
                >
                  Análise
                </th>

                <th
                  className="
                    text-left
                    px-6
                    py-3
                  "
                >
                  Ano
                </th>

                <th
                  className="
                    text-left
                    px-6
                    py-3
                  "
                >
                  Municípios
                </th>

                <th
                  className="
                    text-left
                    px-6
                    py-3
                  "
                >
                  Execução
                </th>

                <th
                  className="
                    text-left
                    px-6
                    py-3
                  "
                >
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {analises
                .slice(
                  0,
                  5
                )
                .map(
                  analise => (

                    <tr
                      key={
                        analise.id
                      }
                      className="
                        border-t
                        border-gray-100
                      "
                    >

                      <td
                        className="
                          px-6
                          py-4
                          font-medium
                          text-gray-800
                        "
                      >
                        {
                          analise.titulo
                        }
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                        "
                      >
                        {
                          analise.ano_referencia
                        }
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                        "
                      >
                        {
                          analise.total_municipios ??
                          '-'
                        }
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-gray-500
                        "
                      >
                        {
                          formatarData(
                            analise.data_execucao
                          )
                        }
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                        "
                      >

                        <span
                          className="
                            bg-green-50
                            text-green-700
                            px-2.5
                            py-1
                            rounded-full
                            text-xs
                            font-medium
                          "
                        >
                          {
                            analise.status ||
                            'concluida'
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}


// ============================================================
// COMPONENTE BARRA
// ============================================================

function BarraDistribuicao({
  titulo,
  valor,
  total,
  classe
}) {

  const percentual =
    total > 0
      ? (
          valor /
          total
        ) * 100
      : 0;


  return (

    <div>

      <div
        className="
          flex
          justify-between
          text-sm
          mb-1.5
        "
      >

        <span
          className="
            text-gray-600
          "
        >
          {titulo}
        </span>


        <span
          className="
            font-medium
            text-gray-800
          "
        >
          {valor}
          {' '}
          ({percentual.toFixed(1)}%)
        </span>

      </div>


      <div
        className="
          h-2.5
          bg-gray-100
          rounded-full
          overflow-hidden
        "
      >

        <div

          className={`
            h-full
            rounded-full
            ${classe}
          `}

          style={{
            width:
              `${percentual}%`
          }}

        />

      </div>

    </div>

  );

}