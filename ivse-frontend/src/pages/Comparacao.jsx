import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  GitCompareArrows,
  AlertCircle,
  Trophy,
  MapPin,
  Activity,
  Search,
  X
} from 'lucide-react';

import api from '../services/api';


const nivelVulnerabilidade = score => {

  if (
    score === null ||
    score === undefined
  ) {
    return 'Sem classificação';
  }

  const valor =
    Number(score);


  if (valor < 0.2) {
    return 'Muito baixa';
  }

  if (valor < 0.4) {
    return 'Baixa';
  }

  if (valor < 0.6) {
    return 'Moderada';
  }

  if (valor < 0.8) {
    return 'Alta';
  }

  return 'Muito alta';

};


const classeVulnerabilidade = score => {

  const valor =
    Number(score);


  if (valor < 0.2) {
    return 'bg-green-100 text-green-700';
  }

  if (valor < 0.4) {
    return 'bg-lime-100 text-lime-700';
  }

  if (valor < 0.6) {
    return 'bg-yellow-100 text-yellow-700';
  }

  if (valor < 0.8) {
    return 'bg-orange-100 text-orange-700';
  }

  return 'bg-red-100 text-red-700';

};


const Comparacao = () => {

  const [analises, setAnalises] =
    useState([]);

  const [
    analiseSelecionada,
    setAnaliseSelecionada
  ] = useState('');

  const [municipios, setMunicipios] =
    useState([]);

  const [
    municipiosSelecionados,
    setMunicipiosSelecionados
  ] = useState([]);

  const [busca, setBusca] =
    useState('');

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState(null);


  // ============================================================
  // CARREGAR ANÁLISES
  // ============================================================

  useEffect(() => {

    const carregarAnalises =
      async () => {

        try {

          setCarregando(true);
          setErro(null);


          const resposta =
            await api.get(
              '/topsis/analises'
            );


          const lista =
            Array.isArray(resposta.data)
              ? resposta.data
              : [];


          setAnalises(
            lista
          );


          if (
            lista.length > 0
          ) {

            setAnaliseSelecionada(
              String(lista[0].id)
            );

          }


        } catch (erro) {

          console.error(
            'Erro ao carregar análises:',
            erro
          );


          setErro(
            'Não foi possível carregar as análises.'
          );


        } finally {

          setCarregando(false);

        }

      };


    carregarAnalises();

  }, []);


  // ============================================================
  // CARREGAR MUNICÍPIOS DA ANÁLISE
  // ============================================================

  useEffect(() => {

    if (!analiseSelecionada) {
      return;
    }


    const carregarMunicipios =
      async () => {

        try {

          setCarregando(true);
          setErro(null);


          const resposta =
            await api.get(
              `/municipios?analise_id=${analiseSelecionada}`
            );


          const lista =
            Array.isArray(resposta.data)
              ? resposta.data
              : [];


          const comResultado =
            lista.filter(
              municipio =>
                municipio.ivse_score !== null &&
                municipio.ivse_score !== undefined
            );


          setMunicipios(
            comResultado
          );


          setMunicipiosSelecionados(
            []
          );


          setBusca('');


        } catch (erro) {

          console.error(
            'Erro ao carregar municípios:',
            erro
          );


          setErro(
            'Não foi possível carregar os municípios da análise.'
          );


        } finally {

          setCarregando(false);

        }

      };


    carregarMunicipios();

  }, [analiseSelecionada]);


  // ============================================================
  // ANÁLISE ATUAL
  // ============================================================

  const analiseAtual =
    useMemo(
      () =>
        analises.find(
          analise =>
            String(analise.id) ===
            String(analiseSelecionada)
        ),
      [
        analises,
        analiseSelecionada
      ]
    );


  // ============================================================
  // FILTRO
  // ============================================================

  const municipiosFiltrados =
    useMemo(
      () => {

        const termo =
          busca
            .trim()
            .toLowerCase();


        if (!termo) {
          return municipios;
        }


        return municipios.filter(
          municipio =>

            municipio.nome
              ?.toLowerCase()
              .includes(termo) ||

            municipio.codigo_ibge
              ?.toString()
              .includes(termo)

        );

      },
      [
        municipios,
        busca
      ]
    );


  // ============================================================
  // SELEÇÃO
  // ============================================================

  const alternarMunicipio =
    municipio => {

      setMunicipiosSelecionados(
        anteriores => {

          const existe =
            anteriores.some(
              item =>
                item.id ===
                municipio.id
            );


          if (existe) {

            return anteriores.filter(
              item =>
                item.id !==
                municipio.id
            );

          }


          if (
            anteriores.length >= 4
          ) {

            setErro(
              'Selecione no máximo quatro municípios para manter a comparação legível.'
            );

            return anteriores;

          }


          setErro(null);


          return [
            ...anteriores,
            municipio
          ];

        }
      );

    };


  const removerMunicipio =
    id => {

      setMunicipiosSelecionados(
        anteriores =>
          anteriores.filter(
            item =>
              item.id !== id
          )
      );

    };


  // ============================================================
  // VALIDAÇÃO DA COMPARAÇÃO
  // ============================================================

  const comparacaoValida =
    municipiosSelecionados.length >= 2;


  // ============================================================
  // MELHOR E PIOR POSIÇÃO
  // ============================================================

  const melhorMunicipio =
    comparacaoValida
      ? [...municipiosSelecionados]
          .sort(
            (a, b) =>
              Number(a.posicao_ranking) -
              Number(b.posicao_ranking)
          )[0]
      : null;


  const maiorIVSE =
    comparacaoValida
      ? [...municipiosSelecionados]
          .sort(
            (a, b) =>
              Number(b.ivse_score) -
              Number(a.ivse_score)
          )[0]
      : null;


  // ============================================================
  // LOADING
  // ============================================================

  if (
    carregando &&
    analises.length === 0
  ) {

    return (

      <div
        className="
          bg-white
          rounded-xl
          border
          border-gray-100
          shadow-sm
          p-10
          text-center
          text-gray-500
        "
      >
        Carregando dados...
      </div>

    );

  }


  return (

    <div className="space-y-6">


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

            <GitCompareArrows
              size={23}
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
              Comparação de Municípios
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Compare o IVSE e a posição
              no ranking entre municípios
              de uma mesma análise.
            </p>

          </div>

        </div>

      </div>


      {/* ERRO */}

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

          <span className="text-sm">
            {erro}
          </span>

        </div>

      )}


      {/* SELEÇÃO DA ANÁLISE */}

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
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >

          {analises.map(
            analise => (

              <option
                key={analise.id}
                value={analise.id}
              >
                {analise.titulo}
                {' - '}
                {analise.ano_referencia}
              </option>

            )
          )}

        </select>


        {analiseAtual && (

          <div
            className="
              mt-4
              text-sm
              text-gray-500
            "
          >

            <strong>
              Análise selecionada:
            </strong>{' '}

            {analiseAtual.titulo}

            {' • '}

            Ano {analiseAtual.ano_referencia}

            {' • '}

            {
              analiseAtual.total_municipios ??
              municipios.length
            } municípios

          </div>

        )}

      </div>


      {/* SELEÇÃO DE MUNICÍPIOS */}

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
            mb-4
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
                text-gray-800
              "
            >
              Municípios
            </h2>

            <p
              className="
                text-xs
                text-gray-500
                mt-1
              "
            >
              Selecione de 2 a 4 municípios.
            </p>

          </div>


          <div
            className="
              text-sm
              font-medium
              text-blue-600
            "
          >
            {
              municipiosSelecionados.length
            } selecionado(s)
          </div>

        </div>


        <div
          className="
            relative
            mb-4
          "
        >

          <Search
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />


          <input

            type="text"

            value={busca}

            onChange={
              e =>
                setBusca(
                  e.target.value
                )
            }

            placeholder="Buscar por município ou código IBGE..."

            className="
              w-full
              border
              border-gray-300
              rounded-lg
              p-3
              pl-10
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>


        {/* SELECIONADOS */}

        {municipiosSelecionados.length > 0 && (

          <div
            className="
              flex
              gap-2
              flex-wrap
              mb-4
            "
          >

            {municipiosSelecionados.map(
              municipio => (

                <div
                  key={municipio.id}
                  className="
                    bg-blue-50
                    text-blue-700
                    border
                    border-blue-100
                    rounded-full
                    px-3
                    py-1.5
                    text-sm
                    flex
                    items-center
                    gap-2
                  "
                >

                  {municipio.nome}

                  <button
                    onClick={
                      () =>
                        removerMunicipio(
                          municipio.id
                        )
                    }
                  >
                    <X size={14} />
                  </button>

                </div>

              )
            )}

          </div>

        )}


        {/* LISTA */}

        <div
          className="
            border
            border-gray-200
            rounded-lg
            max-h-72
            overflow-y-auto
          "
        >

          {municipiosFiltrados.map(
            municipio => {

              const selecionado =
                municipiosSelecionados.some(
                  item =>
                    item.id ===
                    municipio.id
                );


              return (

                <button

                  key={municipio.id}

                  type="button"

                  onClick={
                    () =>
                      alternarMunicipio(
                        municipio
                      )
                  }

                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    border-b
                    last:border-b-0
                    text-left
                    transition

                    ${
                      selecionado
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }
                  `}
                >

                  <div>

                    <div
                      className="
                        font-medium
                        text-gray-800
                      "
                    >
                      {municipio.nome}
                    </div>

                    <div
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      IBGE:
                      {' '}
                      {municipio.codigo_ibge}
                    </div>

                  </div>


                  <div
                    className="
                      text-right
                    "
                  >

                    <div
                      className="
                        font-semibold
                        text-blue-600
                      "
                    >
                      {
                        Number(
                          municipio.ivse_score
                        ).toFixed(4)
                      }
                    </div>

                    <div
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      {
                        municipio.posicao_ranking
                      }º lugar
                    </div>

                  </div>

                </button>

              );

            }
          )}

        </div>

      </div>


      {/* AVISO */}

      {!comparacaoValida && (

        <div
          className="
            bg-amber-50
            border
            border-amber-200
            text-amber-700
            rounded-lg
            p-4
          "
        >
          Selecione pelo menos dois municípios
          para visualizar a comparação.
        </div>

      )}


      {/* RESULTADO */}

      {comparacaoValida && (

        <>

          {/* DESTAQUES */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <div
              className="
                bg-white
                border
                border-gray-100
                rounded-xl
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
                    rounded-lg
                    bg-yellow-50
                    text-yellow-600
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Trophy size={20} />
                </div>

                <div>

                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    Melhor posição no ranking
                  </p>

                  <p
                    className="
                      font-bold
                      text-gray-800
                    "
                  >
                    {melhorMunicipio.nome}
                  </p>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    {
                      melhorMunicipio.posicao_ranking
                    }º lugar
                  </p>

                </div>

              </div>

            </div>


            <div
              className="
                bg-white
                border
                border-gray-100
                rounded-xl
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
                    rounded-lg
                    bg-red-50
                    text-red-600
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
                    Maior IVSE da comparação
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
                      text-gray-500
                    "
                  >
                    {
                      Number(
                        maiorIVSE.ivse_score
                      ).toFixed(4)
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* CARDS */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
            "
          >

            {municipiosSelecionados.map(
              municipio => {

                const score =
                  Number(
                    municipio.ivse_score
                  );


                return (

                  <div
                    key={municipio.id}
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
                        gap-2
                        mb-4
                      "
                    >

                      <MapPin
                        size={18}
                        className="text-blue-600"
                      />

                      <h3
                        className="
                          font-bold
                          text-gray-800
                        "
                      >
                        {municipio.nome}
                      </h3>

                    </div>


                    <div
                      className="
                        text-3xl
                        font-bold
                        text-gray-900
                      "
                    >
                      {score.toFixed(4)}
                    </div>

                    <div
                      className="
                        text-xs
                        text-gray-500
                        mt-1
                      "
                    >
                      IVSE
                    </div>


                    <div
                      className="
                        mt-4
                        h-2
                        bg-gray-100
                        rounded-full
                        overflow-hidden
                      "
                    >

                      <div
                        className="
                          h-full
                          bg-blue-600
                          rounded-full
                        "
                        style={{
                          width:
                            `${Math.min(
                              score * 100,
                              100
                            )}%`
                        }}
                      />

                    </div>


                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        Ranking
                      </span>

                      <strong>
                        {
                          municipio.posicao_ranking
                        }º
                      </strong>

                    </div>


                    <div className="mt-3">

                      <span
                        className={`
                          inline-block
                          px-2.5
                          py-1
                          rounded-full
                          text-xs
                          font-medium

                          ${
                            classeVulnerabilidade(
                              score
                            )
                          }
                        `}
                      >

                        {
                          nivelVulnerabilidade(
                            score
                          )
                        }

                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>


          {/* TABELA */}

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
                  font-bold
                  text-gray-800
                "
              >
                Comparativo
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
                      Município
                    </th>

                    <th
                      className="
                        text-left
                        px-6
                        py-3
                      "
                    >
                      IVSE
                    </th>

                    <th
                      className="
                        text-left
                        px-6
                        py-3
                      "
                    >
                      Ranking
                    </th>

                    <th
                      className="
                        text-left
                        px-6
                        py-3
                      "
                    >
                      Vulnerabilidade
                    </th>

                    <th
                      className="
                        text-left
                        px-6
                        py-3
                      "
                    >
                      Distância +
                    </th>

                    <th
                      className="
                        text-left
                        px-6
                        py-3
                      "
                    >
                      Distância -
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {
                    [...municipiosSelecionados]
                      .sort(
                        (a, b) =>
                          Number(
                            a.posicao_ranking
                          ) -
                          Number(
                            b.posicao_ranking
                          )
                      )
                      .map(
                        municipio => (

                          <tr
                            key={municipio.id}
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
                              {municipio.nome}
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >
                              {
                                Number(
                                  municipio.ivse_score
                                ).toFixed(4)
                              }
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >
                              {
                                municipio.posicao_ranking
                              }º
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >
                              {
                                nivelVulnerabilidade(
                                  municipio.ivse_score
                                )
                              }
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >
                              {
                                municipio.dist_ideal_positiva !== null &&
                                municipio.dist_ideal_positiva !== undefined

                                  ? Number(
                                      municipio.dist_ideal_positiva
                                    ).toFixed(4)

                                  : '-'
                              }
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >
                              {
                                municipio.dist_ideal_negativa !== null &&
                                municipio.dist_ideal_negativa !== undefined

                                  ? Number(
                                      municipio.dist_ideal_negativa
                                    ).toFixed(4)

                                  : '-'
                              }
                            </td>

                          </tr>

                        )
                      )
                  }

                </tbody>

              </table>

            </div>

          </div>

        </>

      )}

    </div>

  );

};


export default Comparacao;