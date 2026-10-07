import { useState, useEffect } from 'react';

import api from '../services/api';

import {
  Plus,
  Trash2,
  Play,
  Trophy,
  AlertCircle,
  ArrowLeft,
  Search,
  MapPin,
  CheckSquare
} from 'lucide-react';


export default function Simulacao() {

  // ============================================================
  // ESTADOS GERAIS
  // ============================================================

  const [indicadores, setIndicadores] = useState([]);

  const [municipios, setMunicipios] = useState([]);

  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState(null);

  const [resultado, setResultado] = useState(null);


  // ============================================================
  // ESTADOS DO FORMULÁRIO
  // ============================================================

  const [titulo, setTitulo] = useState('');

  const [anoReferencia, setAnoReferencia] = useState(2026);


  const [criterios, setCriterios] = useState([
    {
      indicador_id: '',
      peso: 1,
      tipo_direcao: 'beneficio'
    }
  ]);


  // ============================================================
  // SELEÇÃO DE MUNICÍPIOS
  // ============================================================

  const [modoMunicipios, setModoMunicipios] =
    useState('todos');


  const [
    municipiosSelecionados,
    setMunicipiosSelecionados
  ] = useState([]);


  const [buscaMunicipio, setBuscaMunicipio] =
    useState('');


  // ============================================================
  // CARREGAR INDICADORES E MUNICÍPIOS
  // ============================================================

  useEffect(() => {

    const carregarDados = async () => {

      try {

        setErro(null);


        const [
          respostaIndicadores,
          respostaMunicipios
        ] = await Promise.all([

          api.get('/indicadores'),

          api.get('/municipios')

        ]);


        setIndicadores(
          respostaIndicadores.data
        );


        setMunicipios(
          respostaMunicipios.data
        );


      } catch (err) {

        console.error(err);

        setErro(
          'Não foi possível carregar os dados necessários para a análise.'
        );

      }

    };


    carregarDados();

  }, []);


  // ============================================================
  // CRITÉRIOS
  // ============================================================

  const adicionarCriterio = () => {

    setCriterios([
      ...criterios,
      {
        indicador_id: '',
        peso: 1,
        tipo_direcao: 'beneficio'
      }
    ]);

  };


  const removerCriterio = (index) => {

    const novosCriterios =
      criterios.filter(
        (_, i) => i !== index
      );


    setCriterios(
      novosCriterios
    );

  };


  const atualizarCriterio = (
    index,
    campo,
    valor
  ) => {

    const novosCriterios =
      [...criterios];


    novosCriterios[index][campo] =
      valor;


    setCriterios(
      novosCriterios
    );

  };


  // ============================================================
  // SELEÇÃO INDIVIDUAL DE MUNICÍPIO
  // ============================================================

  const alternarMunicipio = (municipioId) => {

    const id = Number(municipioId);


    setMunicipiosSelecionados(
      anteriores => {

        if (anteriores.includes(id)) {

          return anteriores.filter(
            item => item !== id
          );

        }


        return [
          ...anteriores,
          id
        ];

      }
    );

  };


  // ============================================================
  // MUNICÍPIOS FILTRADOS PELA PESQUISA
  // ============================================================

  const municipiosFiltrados =
    municipios.filter(municipio => {

      const busca =
        buscaMunicipio
          .trim()
          .toLowerCase();


      if (!busca) {
        return true;
      }


      return (

        municipio.nome
          .toLowerCase()
          .includes(busca)

        ||

        String(
          municipio.codigo_ibge
        ).includes(busca)

      );

    });


  // ============================================================
  // SELECIONAR TODOS OS MUNICÍPIOS VISÍVEIS
  // ============================================================

  const selecionarFiltrados = () => {

    const idsFiltrados =
      municipiosFiltrados.map(
        municipio =>
          Number(municipio.id)
      );


    setMunicipiosSelecionados(
      anteriores => [

        ...new Set([
          ...anteriores,
          ...idsFiltrados
        ])

      ]
    );

  };


  // ============================================================
  // LIMPAR SELEÇÃO
  // ============================================================

  const limparSelecaoMunicipios = () => {

    setMunicipiosSelecionados([]);

  };


  // ============================================================
  // EXECUTAR ANÁLISE
  // ============================================================

  const executarAnalise = async (e) => {

    e.preventDefault();

    setErro(null);


    // ----------------------------------------------------------
    // VALIDAR TÍTULO
    // ----------------------------------------------------------

    if (!titulo.trim()) {

      setErro(
        'Informe um título para a análise.'
      );

      return;

    }


    // ----------------------------------------------------------
    // VALIDAR CRITÉRIOS
    // ----------------------------------------------------------

    if (
      criterios.some(
        criterio =>
          !criterio.indicador_id
      )
    ) {

      setErro(
        'Selecione um indicador para todos os critérios.'
      );

      return;

    }


    // ----------------------------------------------------------
    // NÃO PERMITIR INDICADORES DUPLICADOS
    // ----------------------------------------------------------

    const indicadoresEscolhidos =
      criterios.map(
        criterio =>
          Number(
            criterio.indicador_id
          )
      );


    if (
      new Set(
        indicadoresEscolhidos
      ).size !==
      indicadoresEscolhidos.length
    ) {

      setErro(
        'O mesmo indicador não pode ser utilizado mais de uma vez na análise.'
      );

      return;

    }


    // ----------------------------------------------------------
    // VALIDAR PESOS
    // ----------------------------------------------------------

    if (
      criterios.some(
        criterio =>
          !Number.isFinite(
            Number(criterio.peso)
          )
          ||
          Number(criterio.peso) <= 0
      )
    ) {

      setErro(
        'Todos os pesos devem possuir valores maiores que zero.'
      );

      return;

    }


    // ----------------------------------------------------------
    // VALIDAR MUNICÍPIOS SELECIONADOS
    // ----------------------------------------------------------

    if (
      modoMunicipios ===
        'selecionados'
      &&
      municipiosSelecionados.length < 2
    ) {

      setErro(
        'Selecione pelo menos dois municípios para executar uma análise comparativa.'
      );

      return;

    }


    setLoading(true);


    try {

      const payload = {

        titulo:
          titulo.trim(),

        ano_referencia:
          Number(
            anoReferencia
          ),


        criterios:
          criterios.map(
            criterio => ({

              indicador_id:
                Number(
                  criterio.indicador_id
                ),

              peso:
                Number(
                  criterio.peso
                ),

              tipo_direcao:
                criterio.tipo_direcao

            })
          ),


        municipios_ids:
          modoMunicipios ===
            'selecionados'

            ? municipiosSelecionados

            : []

      };


      console.log(
        'PAYLOAD TOPSIS:',
        payload
      );


      const res =
        await api.post(
          '/topsis/executar',
          payload
        );


      setResultado(
        res.data
      );


    } catch (err) {

      console.error(err);


      setErro(

        err.response?.data?.erro

        ||

        'Erro ao executar a análise TOPSIS. Verifique se os municípios possuem dados para os indicadores selecionados.'

      );


    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // NOVA SIMULAÇÃO
  // ============================================================

  const limparResultados = () => {

    setResultado(null);

  };


  // ============================================================
  // TELA DE RESULTADOS
  // ============================================================

  if (resultado) {

    return (

      <div className="space-y-6">


        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <h3
            className="
              text-2xl
              font-bold
              text-gray-800
            "
          >
            Resultado da Análise
          </h3>


          <button

            onClick={
              limparResultados
            }

            className="
              flex
              items-center
              gap-2
              text-slate-600
              hover:text-blue-600
              transition
            "
          >

            <ArrowLeft size={20} />

            Nova Simulação

          </button>

        </div>


        <div
          className="
            bg-white
            rounded-xl
            shadow-sm
            border
            border-gray-100
            overflow-hidden
          "
        >


          {/* RESUMO */}

          <div
            className="
              bg-blue-50
              p-6
              border-b
              border-blue-100
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-blue-800
                  uppercase
                "
              >
                Resumo
              </p>


              <h4
                className="
                  text-lg
                  font-bold
                  text-gray-900
                  mt-1
                "
              >
                {titulo}

                {' '}

                (Ano: {anoReferencia})
              </h4>


              <p
                className="
                  text-sm
                  text-gray-600
                  mt-1
                "
              >
                Municípios analisados:{' '}

                {resultado.total_analisado}
              </p>

            </div>


            <Trophy
              size={48}
              className="text-blue-300"
            />

          </div>


          {/* TABELA */}

          <div className="overflow-x-auto">

            <table
              className="
                w-full
                text-left
                border-collapse
              "
            >

              <thead>

                <tr
                  className="
                    bg-gray-50
                    border-b
                    border-gray-200
                  "
                >

                  <th
                    className="
                      py-4
                      px-6
                      text-sm
                      font-semibold
                      text-gray-600
                    "
                  >
                    Posição
                  </th>


                  <th
                    className="
                      py-4
                      px-6
                      text-sm
                      font-semibold
                      text-gray-600
                    "
                  >
                    Município
                  </th>


                  <th
                    className="
                      py-4
                      px-6
                      text-sm
                      font-semibold
                      text-gray-600
                    "
                  >
                    Score IVSE
                  </th>

                </tr>

              </thead>


              <tbody>

                {resultado.ranking.map(
                  (rank, idx) => (

                    <tr

                      key={idx}

                      className="
                        border-b
                        border-gray-100
                        hover:bg-gray-50
                        transition
                      "
                    >

                      <td
                        className="
                          py-4
                          px-6
                          font-bold
                          text-gray-500
                        "
                      >
                        #{rank.posicao_ranking}
                      </td>


                      <td
                        className="
                          py-4
                          px-6
                          font-medium
                          text-gray-900
                        "
                      >
                        {rank.municipio}
                      </td>


                      <td
                        className="
                          py-4
                          px-6
                          text-blue-600
                          font-bold
                        "
                      >

                        {(
                          rank.ivse_score *
                          100
                        ).toFixed(2)}%

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
  // FORMULÁRIO
  // ============================================================

  return (

    <div
      className="
        max-w-5xl
        bg-white
        p-8
        rounded-xl
        shadow-sm
        border
        border-gray-100
      "
    >


      <h3
        className="
          text-xl
          font-bold
          text-gray-800
          mb-6
        "
      >
        Configurar Nova Simulação TOPSIS
      </h3>


      {/* ERRO */}

      {erro && (

        <div
          className="
            mb-6
            bg-red-50
            text-red-700
            p-4
            rounded-lg
            flex
            items-start
            gap-3
            border
            border-red-100
          "
        >

          <AlertCircle
            size={20}
            className="mt-0.5"
          />


          <p className="text-sm">
            {erro}
          </p>

        </div>

      )}


      <form
        onSubmit={
          executarAnalise
        }
        className="space-y-8"
      >


        {/* ==================================================== */}
        {/* DADOS DA ANÁLISE */}
        {/* ==================================================== */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-6
          "
        >


          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-2
              "
            >
              Título da Análise
            </label>


            <input

              type="text"

              required

              value={titulo}

              onChange={
                e =>
                  setTitulo(
                    e.target.value
                  )
              }

              className="
                w-full
                border
                border-gray-300
                rounded-lg
                p-3
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                outline-none
                transition
              "

              placeholder="Ex: Vulnerabilidade Energética Bahia"

            />

          </div>


          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-2
              "
            >
              Ano de Referência
            </label>


            <input

              type="number"

              required

              value={anoReferencia}

              onChange={
                e =>
                  setAnoReferencia(
                    e.target.value
                  )
              }

              className="
                w-full
                border
                border-gray-300
                rounded-lg
                p-3
                bg-gray-50
              "

            />

          </div>

        </div>


        {/* ==================================================== */}
        {/* MUNICÍPIOS */}
        {/* ==================================================== */}

        <div>

          <div
            className="
              flex
              items-center
              gap-2
              mb-4
            "
          >

            <MapPin
              size={20}
              className="text-blue-600"
            />


            <h4
              className="
                text-base
                font-semibold
                text-gray-800
              "
            >
              Municípios da Análise
            </h4>

          </div>


          {/* MODO TODOS */}

          <label
            className="
              flex
              items-start
              gap-3
              border
              border-gray-200
              rounded-lg
              p-4
              cursor-pointer
              mb-3
              hover:bg-gray-50
            "
          >

            <input

              type="radio"

              name="modoMunicipios"

              value="todos"

              checked={
                modoMunicipios ===
                'todos'
              }

              onChange={() =>
                setModoMunicipios(
                  'todos'
                )
              }

              className="mt-1"

            />


            <div>

              <div
                className="
                  font-medium
                  text-gray-800
                "
              >
                Todos os municípios elegíveis
              </div>


              <div
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                O TOPSIS utilizará todos os municípios que
                possuírem dados completos para os indicadores
                selecionados.
              </div>

            </div>

          </label>


          {/* MODO SELEÇÃO */}

          <label
            className="
              flex
              items-start
              gap-3
              border
              border-gray-200
              rounded-lg
              p-4
              cursor-pointer
              hover:bg-gray-50
            "
          >

            <input

              type="radio"

              name="modoMunicipios"

              value="selecionados"

              checked={
                modoMunicipios ===
                'selecionados'
              }

              onChange={() =>
                setModoMunicipios(
                  'selecionados'
                )
              }

              className="mt-1"

            />


            <div>

              <div
                className="
                  font-medium
                  text-gray-800
                "
              >
                Selecionar municípios específicos
              </div>


              <div
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                Permite executar uma análise comparativa somente
                entre os municípios escolhidos.
              </div>

            </div>

          </label>


          {/* LISTA DE MUNICÍPIOS */}

          {modoMunicipios ===
            'selecionados' && (

            <div
              className="
                mt-4
                border
                border-gray-200
                rounded-xl
                overflow-hidden
              "
            >


              {/* PESQUISA */}

              <div
                className="
                  bg-gray-50
                  border-b
                  border-gray-200
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div className="relative flex-1">

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

                      value={
                        buscaMunicipio
                      }

                      onChange={
                        e =>
                          setBuscaMunicipio(
                            e.target.value
                          )
                      }

                      placeholder="Pesquisar por município ou código IBGE..."

                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        py-2.5
                        pl-10
                        pr-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "

                    />

                  </div>


                  <button

                    type="button"

                    onClick={
                      selecionarFiltrados
                    }

                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-blue-600
                      font-medium
                      hover:text-blue-800
                    "
                  >

                    <CheckSquare size={17} />

                    Selecionar visíveis

                  </button>


                  <button

                    type="button"

                    onClick={
                      limparSelecaoMunicipios
                    }

                    className="
                      text-sm
                      text-gray-500
                      hover:text-red-600
                    "
                  >
                    Limpar
                  </button>

                </div>


                <div
                  className="
                    text-xs
                    text-gray-500
                    mt-3
                  "
                >
                  {municipiosSelecionados.length}
                  {' '}
                  município(s) selecionado(s)
                </div>

              </div>


              {/* MUNICÍPIOS */}

              <div
                className="
                  max-h-72
                  overflow-y-auto
                  divide-y
                  divide-gray-100
                "
              >

                {municipiosFiltrados.map(
                  municipio => {

                    const selecionado =
                      municipiosSelecionados.includes(
                        Number(
                          municipio.id
                        )
                      );


                    return (

                      <label

                        key={
                          municipio.id
                        }

                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          cursor-pointer
                          hover:bg-blue-50
                        "
                      >

                        <input

                          type="checkbox"

                          checked={
                            selecionado
                          }

                          onChange={() =>
                            alternarMunicipio(
                              municipio.id
                            )
                          }

                        />


                        <div
                          className="
                            flex-1
                          "
                        >

                          <div
                            className="
                              text-sm
                              font-medium
                              text-gray-800
                            "
                          >
                            {municipio.nome}
                          </div>


                          <div
                            className="
                              text-xs
                              text-gray-400
                            "
                          >
                            IBGE:{' '}
                            {municipio.codigo_ibge}
                          </div>

                        </div>


                        <div
                          className="
                            text-xs
                            font-medium
                            text-gray-400
                          "
                        >
                          {municipio.uf}
                        </div>

                      </label>

                    );

                  }
                )}


                {municipiosFiltrados.length ===
                  0 && (

                  <div
                    className="
                      p-6
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >
                    Nenhum município encontrado.
                  </div>

                )}

              </div>

            </div>

          )}

        </div>


        {/* ==================================================== */}
        {/* CRITÉRIOS */}
        {/* ==================================================== */}

        <div>

          <div
            className="
              flex
              items-center
              justify-between
              mb-4
            "
          >

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              Critérios (Indicadores)
            </label>


            <button

              type="button"

              onClick={
                adicionarCriterio
              }

              className="
                text-sm
                font-medium
                text-blue-600
                hover:text-blue-800
                flex
                items-center
                gap-1
              "
            >

              <Plus size={16} />

              Adicionar Indicador

            </button>

          </div>


          <div className="space-y-4">

            {criterios.map(
              (criterio, index) => (

                <div

                  key={index}

                  className="
                    flex
                    items-center
                    gap-4
                    bg-gray-50
                    p-4
                    rounded-lg
                    border
                    border-gray-200
                  "
                >


                  <div className="flex-1">

                    <select

                      value={
                        criterio.indicador_id
                      }

                      onChange={
                        e =>
                          atualizarCriterio(
                            index,
                            'indicador_id',
                            e.target.value
                          )
                      }

                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        p-2.5
                        bg-white
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "

                      required

                    >

                      <option value="">
                        Selecione um indicador...
                      </option>


                      {indicadores.map(
                        indicador => (

                          <option
                            key={
                              indicador.id
                            }
                            value={
                              indicador.id
                            }
                          >
                            {indicador.codigo}
                            {' - '}
                            {indicador.nome}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="w-24">

                    <input

                      type="number"

                      min="0.1"

                      step="0.1"

                      value={
                        criterio.peso
                      }

                      onChange={
                        e =>
                          atualizarCriterio(
                            index,
                            'peso',
                            e.target.value
                          )
                      }

                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        p-2.5
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "

                      title="Peso do critério"

                      required

                    />

                  </div>


                  <div className="w-36">

                    <select

                      value={
                        criterio.tipo_direcao
                      }

                      onChange={
                        e =>
                          atualizarCriterio(
                            index,
                            'tipo_direcao',
                            e.target.value
                          )
                      }

                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        p-2.5
                        bg-white
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    >

                      <option value="beneficio">
                        Benefício (+)
                      </option>

                      <option value="custo">
                        Custo (-)
                      </option>

                    </select>

                  </div>


                  <button

                    type="button"

                    onClick={() =>
                      removerCriterio(
                        index
                      )
                    }

                    className="
                      text-red-400
                      hover:text-red-600
                      p-2
                    "

                    disabled={
                      criterios.length ===
                      1
                    }

                  >

                    <Trash2 size={20} />

                  </button>

                </div>

              )
            )}

          </div>

        </div>


        {/* ==================================================== */}
        {/* EXECUTAR */}
        {/* ==================================================== */}

        <div
          className="
            pt-4
            flex
            justify-end
          "
        >

          <button

            type="submit"

            disabled={loading}

            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              py-3
              px-8
              rounded-lg
              flex
              items-center
              gap-2
              transition
              disabled:opacity-70
            "
          >

            {loading

              ? 'A calcular...'

              : (
                <>
                  <Play size={20} />
                  Executar Motor TOPSIS
                </>
              )
            }

          </button>

        </div>

      </form>

    </div>

  );

}