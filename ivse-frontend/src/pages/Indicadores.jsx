// src/pages/Indicadores.jsx

import { useEffect, useState } from 'react';

import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Database,
  Calculator,
  MapPin,
  Save,
  Upload,
  FileText
} from 'lucide-react';

import api from '../services/api';


const Indicadores = () => {

  const [indicadores, setIndicadores] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioValor, setMostrarFormularioValor] = useState(false);
  const [mostrarImportacao, setMostrarImportacao] = useState(false);

  const [arquivoCSV, setArquivoCSV] = useState(null);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);


  const formularioInicial = {
    codigo: '',
    nome: '',
    dimensao: '',
    unidade_medida: '',
    fonte: '',
    formula: '',
    descricao: '',
    tipo_padrao: 'beneficio'
  };


  const formularioValorInicial = {
    municipio_id: '',
    indicador_id: '',
    valor: '',
    ano_referencia: 2026
  };


  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [formularioValor, setFormularioValor] =
    useState(formularioValorInicial);


  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  const carregarDados = async () => {

    try {

      setCarregando(true);
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


    } catch (erro) {

      console.error(
        'Erro ao carregar dados:',
        erro
      );

      setErro(
        'Não foi possível carregar os dados.'
      );

    } finally {

      setCarregando(false);

    }

  };


  useEffect(() => {

    carregarDados();

  }, []);


  // ============================================================
  // FORMULÁRIOS
  // ============================================================

  const atualizarCampo = (
    campo,
    valor
  ) => {

    setFormulario(
      anterior => ({
        ...anterior,
        [campo]: valor
      })
    );

  };


  const atualizarCampoValor = (
    campo,
    valor
  ) => {

    setFormularioValor(
      anterior => ({
        ...anterior,
        [campo]: valor
      })
    );

  };


  // ============================================================
  // MODAL INDICADOR
  // ============================================================

  const abrirFormulario = () => {

    setFormulario(
      formularioInicial
    );

    setErro(null);
    setSucesso(null);

    setMostrarFormulario(true);

  };


  const fecharFormulario = () => {

    if (salvando) {
      return;
    }

    setMostrarFormulario(false);

    setFormulario(
      formularioInicial
    );

    setErro(null);

  };


  // ============================================================
  // MODAL VALOR
  // ============================================================

  const abrirFormularioValor = () => {

    setFormularioValor(
      formularioValorInicial
    );

    setErro(null);
    setSucesso(null);

    setMostrarFormularioValor(true);

  };


  const fecharFormularioValor = () => {

    if (salvando) {
      return;
    }

    setMostrarFormularioValor(false);

    setFormularioValor(
      formularioValorInicial
    );

    setErro(null);

  };


  // ============================================================
  // MODAL CSV
  // ============================================================

  const abrirImportacao = () => {

    setArquivoCSV(null);
    setResultadoImportacao(null);
    setErro(null);
    setSucesso(null);

    setMostrarImportacao(true);

  };


  const fecharImportacao = () => {

    if (salvando) {
      return;
    }

    setMostrarImportacao(false);

    setArquivoCSV(null);
    setResultadoImportacao(null);
    setErro(null);

  };


  // ============================================================
  // CADASTRAR INDICADOR
  // ============================================================

  const cadastrarIndicador =
    async (event) => {

      event.preventDefault();

      setErro(null);
      setSucesso(null);


      if (
        !formulario.codigo.trim() ||
        !formulario.nome.trim()
      ) {

        setErro(
          'Código e nome são obrigatórios.'
        );

        return;

      }


      if (
        ![
          'beneficio',
          'custo'
        ].includes(
          formulario.tipo_padrao
        )
      ) {

        setErro(
          'Selecione uma natureza TOPSIS válida.'
        );

        return;

      }


      try {

        setSalvando(true);


        const payload = {

          codigo:
            formulario.codigo
              .trim()
              .toUpperCase(),

          nome:
            formulario.nome.trim(),

          dimensao:
            formulario.dimensao.trim(),

          unidade_medida:
            formulario.unidade_medida.trim(),

          fonte:
            formulario.fonte.trim(),

          formula:
            formulario.formula.trim(),

          descricao:
            formulario.descricao.trim(),

          tipo_padrao:
            formulario.tipo_padrao

        };


        await api.post(
          '/indicadores',
          payload
        );


        setMostrarFormulario(false);

        setFormulario(
          formularioInicial
        );


        await carregarDados();


        setSucesso(
          'Indicador cadastrado com sucesso.'
        );


      } catch (erro) {

        console.error(
          'Erro ao cadastrar indicador:',
          erro
        );


        setErro(
          erro.response?.data?.erro ||
          'Não foi possível cadastrar o indicador.'
        );


      } finally {

        setSalvando(false);

      }

    };


  // ============================================================
  // REGISTRAR VALOR
  // ============================================================

  const registrarValor =
    async (event) => {

      event.preventDefault();

      setErro(null);
      setSucesso(null);


      if (
        !formularioValor.municipio_id ||
        !formularioValor.indicador_id ||
        formularioValor.valor === ''
      ) {

        setErro(
          'Município, indicador e valor são obrigatórios.'
        );

        return;

      }


      try {

        setSalvando(true);


        const payload = {

          municipio_id:
            Number(
              formularioValor.municipio_id
            ),

          indicador_id:
            Number(
              formularioValor.indicador_id
            ),

          valor:
            Number(
              formularioValor.valor
            ),

          ano_referencia:
            Number(
              formularioValor.ano_referencia
            )

        };


        await api.post(
          '/indicadores/valores',
          payload
        );


        setMostrarFormularioValor(false);

        setFormularioValor(
          formularioValorInicial
        );


        setSucesso(
          'Valor do indicador registrado com sucesso.'
        );


      } catch (erro) {

        console.error(
          'Erro ao registrar valor:',
          erro
        );


        setErro(
          erro.response?.data?.erro ||
          'Não foi possível registrar o valor.'
        );


      } finally {

        setSalvando(false);

      }

    };


  // ============================================================
  // IMPORTAR CSV
  // ============================================================

  const importarCSV =
    async (event) => {

      event.preventDefault();

      setErro(null);
      setSucesso(null);
      setResultadoImportacao(null);


      if (!arquivoCSV) {

        setErro(
          'Selecione um arquivo CSV.'
        );

        return;

      }


      if (
        !arquivoCSV.name
          .toLowerCase()
          .endsWith('.csv')
      ) {

        setErro(
          'O arquivo selecionado deve ser CSV.'
        );

        return;

      }


      try {

        setSalvando(true);


        const dados =
          new FormData();


        dados.append(
          'arquivo',
          arquivoCSV
        );


        const resposta =
          await api.post(
            '/indicadores/importar-csv',
            dados
          );


        setResultadoImportacao(
          resposta.data.resumo
        );


        setSucesso(
          resposta.data.mensagem ||
          'Importação concluída com sucesso.'
        );


      } catch (erro) {

        console.error(
          'Erro ao importar CSV:',
          erro
        );


        setErro(
          erro.response?.data?.erro ||
          'Não foi possível importar o arquivo CSV.'
        );


      } finally {

        setSalvando(false);

      }

    };


  // ============================================================
  // LOADING
  // ============================================================

  if (carregando) {

    return (

      <div className="p-6">

        <div
          className="
            bg-white
            rounded-xl
            shadow-sm
            border
            border-gray-100
            p-8
            text-center
          "
        >

          <p className="text-gray-500">
            Carregando indicadores...
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // TELA
  // ============================================================

  return (

    <div className="p-6">


      {/* CABEÇALHO */}

      <div
        className="
          mb-6
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
            Indicadores do IVSE
          </h1>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Parâmetros multicritério utilizados
            no cálculo do TOPSIS
          </p>

        </div>


        <div
          className="
            flex
            gap-2
            flex-wrap
          "
        >

          <button

            onClick={
              abrirImportacao
            }

            className="
              bg-white
              hover:bg-gray-50
              text-emerald-600
              border
              border-emerald-200
              px-4
              py-2.5
              rounded-lg
              font-medium
              text-sm
              flex
              items-center
              gap-2
              transition
            "
          >

            <Upload size={18} />

            Importar CSV

          </button>


          <button

            onClick={
              abrirFormularioValor
            }

            className="
              bg-white
              hover:bg-gray-50
              text-blue-600
              border
              border-blue-200
              px-4
              py-2.5
              rounded-lg
              font-medium
              text-sm
              flex
              items-center
              gap-2
              transition
            "
          >

            <MapPin size={18} />

            Registrar Valor

          </button>


          <button

            onClick={
              abrirFormulario
            }

            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2.5
              rounded-lg
              font-medium
              text-sm
              flex
              items-center
              gap-2
              transition
            "
          >

            <Plus size={18} />

            Novo Indicador

          </button>

        </div>

      </div>


      {/* SUCESSO */}

      {sucesso &&
       !mostrarImportacao && (

        <div
          className="
            mb-6
            bg-green-50
            border
            border-green-200
            text-green-700
            rounded-lg
            p-4
            flex
            items-center
            gap-3
          "
        >

          <CheckCircle2 size={20} />

          <span className="text-sm">
            {sucesso}
          </span>

        </div>

      )}


      {/* ERRO */}

      {erro &&
       !mostrarFormulario &&
       !mostrarFormularioValor &&
       !mostrarImportacao && (

        <div
          className="
            mb-6
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

          <AlertCircle size={20} />

          <span className="text-sm">
            {erro}
          </span>

        </div>

      )}


      {/* RESUMO */}

      <div
        className="
          mb-6
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        "
      >

        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
            "
          >

            <Database size={22} />

          </div>


          <div>

            <div
              className="
                text-xs
                text-gray-500
              "
            >
              Indicadores cadastrados
            </div>

            <div
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              {indicadores.length}
            </div>

          </div>

        </div>


        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-100
            shadow-sm
            p-5
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-lg
              bg-emerald-50
              text-emerald-600
              flex
              items-center
              justify-center
            "
          >

            <Calculator size={22} />

          </div>


          <div>

            <div
              className="
                text-xs
                text-gray-500
              "
            >
              Critérios disponíveis para TOPSIS
            </div>

            <div
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              {indicadores.length}
            </div>

          </div>

        </div>

      </div>


      {/* CARDS */}

      {indicadores.length === 0 ? (

        <div
          className="
            bg-white
            border
            border-gray-100
            rounded-xl
            shadow-sm
            p-10
            text-center
          "
        >

          <p
            className="
              text-gray-500
              text-sm
            "
          >
            Nenhum indicador cadastrado.
          </p>

        </div>

      ) : (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >

          {indicadores.map(
            indicador => {

              const beneficio =
                indicador.tipo_padrao ===
                'beneficio';


              return (

                <div

                  key={indicador.id}

                  className="
                    bg-white
                    rounded-xl
                    shadow-sm
                    border
                    border-gray-100
                    p-6
                    flex
                    flex-col
                    justify-between
                    hover:shadow-md
                    transition-shadow
                  "
                >


                  <div>


                    <div
                      className="
                        flex
                        justify-between
                        items-start
                        gap-3
                        mb-3
                      "
                    >

                      <span
                        className="
                          px-3
                          py-1
                          bg-blue-50
                          text-blue-700
                          font-mono
                          text-xs
                          font-semibold
                          rounded-full
                        "
                      >
                        {indicador.codigo}
                      </span>


                      <span
                        className={`
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          rounded-full

                          ${
                            beneficio

                              ? 'bg-emerald-50 text-emerald-700'

                              : 'bg-amber-50 text-amber-700'
                          }
                        `}
                      >

                        {beneficio
                          ? 'Benefício (↑)'
                          : 'Custo (↓)'}

                      </span>

                    </div>


                    <h3
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                        mb-1
                      "
                    >
                      {indicador.nome}
                    </h3>


                    <p
                      className="
                        text-xs
                        font-medium
                        text-blue-600
                        mb-3
                        uppercase
                        tracking-wider
                      "
                    >
                      {indicador.dimensao ||
                        'Sem dimensão'}
                    </p>


                    <p
                      className="
                        text-sm
                        text-gray-600
                        mb-4
                      "
                    >

                      {indicador.descricao ||
                        'Nenhuma descrição cadastrada.'}

                    </p>

                  </div>


                  <div
                    className="
                      border-t
                      border-gray-100
                      pt-4
                      mt-2
                      text-xs
                      text-gray-500
                      space-y-2
                    "
                  >

                    <p>

                      <strong>
                        Fonte:
                      </strong>{' '}

                      {indicador.fonte ||
                        'Não informada'}

                    </p>


                    <p>

                      <strong>
                        Unidade:
                      </strong>{' '}

                      {indicador.unidade_medida ||
                        'Não informada'}

                    </p>


                    <div
                      className="
                        font-mono
                        bg-gray-50
                        p-2
                        rounded
                        text-gray-600
                      "
                    >

                      <strong>
                        Fórmula:
                      </strong>{' '}

                      {indicador.formula ||
                        'Não informada'}

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}


      {/* ====================================================== */}
      {/* MODAL NOVO INDICADOR */}
      {/* ====================================================== */}

      {mostrarFormulario && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-[2000]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              shadow-xl
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-4
                border-b
                border-gray-100
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
                  Novo Indicador
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-500
                    mt-1
                  "
                >
                  Cadastre um novo critério
                  para utilização nas análises TOPSIS.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  fecharFormulario
                }
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={
                cadastrarIndicador
              }
              className="p-6 space-y-5"
            >

              {erro && (

                <div
                  className="
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-lg
                    p-3
                  "
                >
                  {erro}
                </div>

              )}


              <div
                className="
                  grid
                  md:grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Código *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formulario.codigo
                    }
                    onChange={
                      e =>
                        atualizarCampo(
                          'codigo',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
                    "
                  />

                </div>


                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Natureza TOPSIS *
                  </label>

                  <select
                    value={
                      formulario.tipo_padrao
                    }
                    onChange={
                      e =>
                        atualizarCampo(
                          'tipo_padrao',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
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

              </div>


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Nome *
                </label>

                <input
                  type="text"
                  required
                  value={
                    formulario.nome
                  }
                  onChange={
                    e =>
                      atualizarCampo(
                        'nome',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>


              <div
                className="
                  grid
                  md:grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Dimensão
                  </label>

                  <input
                    type="text"
                    value={
                      formulario.dimensao
                    }
                    onChange={
                      e =>
                        atualizarCampo(
                          'dimensao',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
                    "
                  />

                </div>


                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Unidade
                  </label>

                  <input
                    type="text"
                    value={
                      formulario.unidade_medida
                    }
                    onChange={
                      e =>
                        atualizarCampo(
                          'unidade_medida',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
                    "
                  />

                </div>

              </div>


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Fonte
                </label>

                <input
                  type="text"
                  value={
                    formulario.fonte
                  }
                  onChange={
                    e =>
                      atualizarCampo(
                        'fonte',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Fórmula
                </label>

                <textarea
                  rows="2"
                  value={
                    formulario.formula
                  }
                  onChange={
                    e =>
                      atualizarCampo(
                        'formula',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Descrição
                </label>

                <textarea
                  rows="3"
                  value={
                    formulario.descricao
                  }
                  onChange={
                    e =>
                      atualizarCampo(
                        'descricao',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                  "
                />

              </div>


              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-3
                  border-t
                "
              >

                <button
                  type="button"
                  onClick={
                    fecharFormulario
                  }
                  className="
                    px-4
                    py-2
                    border
                    rounded-lg
                  "
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={
                    salvando
                  }
                  className="
                    bg-blue-600
                    text-white
                    px-5
                    py-2
                    rounded-lg
                  "
                >
                  {salvando
                    ? 'Salvando...'
                    : 'Cadastrar Indicador'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ====================================================== */}
      {/* MODAL REGISTRAR VALOR */}
      {/* ====================================================== */}

      {mostrarFormularioValor && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-[2000]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              shadow-xl
              w-full
              max-w-lg
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-4
                border-b
                border-gray-100
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
                  Registrar Valor
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-500
                    mt-1
                  "
                >
                  Associe um valor de indicador
                  a um município.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  fecharFormularioValor
                }
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={
                registrarValor
              }
              className="
                p-6
                space-y-5
              "
            >

              {erro && (

                <div
                  className="
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-lg
                    p-3
                  "
                >
                  {erro}
                </div>

              )}


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Município *
                </label>

                <select
                  required
                  value={
                    formularioValor.municipio_id
                  }
                  onChange={
                    e =>
                      atualizarCampoValor(
                        'municipio_id',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                    bg-white
                  "
                >

                  <option value="">
                    Selecione um município...
                  </option>


                  {municipios.map(
                    municipio => (

                      <option
                        key={
                          municipio.id
                        }
                        value={
                          municipio.id
                        }
                      >
                        {municipio.nome}
                        {' - '}
                        {municipio.codigo_ibge}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Indicador *
                </label>

                <select
                  required
                  value={
                    formularioValor.indicador_id
                  }
                  onChange={
                    e =>
                      atualizarCampoValor(
                        'indicador_id',
                        e.target.value
                      )
                  }
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                    bg-white
                  "
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


              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Ano *
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={
                      formularioValor.ano_referencia
                    }
                    onChange={
                      e =>
                        atualizarCampoValor(
                          'ano_referencia',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
                    "
                  />

                </div>


                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Valor *
                  </label>

                  <input
                    type="number"
                    step="any"
                    required
                    value={
                      formularioValor.valor
                    }
                    onChange={
                      e =>
                        atualizarCampoValor(
                          'valor',
                          e.target.value
                        )
                    }
                    className="
                      w-full
                      border
                      rounded-lg
                      p-3
                    "
                    placeholder="Ex: 95.5"
                  />

                </div>

              </div>


              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-3
                  border-t
                "
              >

                <button
                  type="button"
                  onClick={
                    fecharFormularioValor
                  }
                  className="
                    px-4
                    py-2
                    border
                    rounded-lg
                  "
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={
                    salvando
                  }
                  className="
                    bg-blue-600
                    text-white
                    px-5
                    py-2
                    rounded-lg
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Save size={17} />

                  {salvando
                    ? 'Salvando...'
                    : 'Registrar Valor'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ====================================================== */}
      {/* MODAL IMPORTAR CSV */}
      {/* ====================================================== */}

      {mostrarImportacao && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-[2000]
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              shadow-xl
              w-full
              max-w-xl
              max-h-[90vh]
              overflow-y-auto
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-4
                border-b
                border-gray-100
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
                  Importar dados por CSV
                </h2>


                <p
                  className="
                    text-xs
                    text-gray-500
                    mt-1
                  "
                >
                  Importe valores de indicadores
                  para vários municípios de uma só vez.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  fecharImportacao
                }
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={
                importarCSV
              }
              className="
                p-6
                space-y-5
              "
            >

              <div
                className="
                  bg-blue-50
                  border
                  border-blue-100
                  rounded-lg
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-blue-700
                    font-medium
                    text-sm
                    mb-2
                  "
                >

                  <FileText size={18} />

                  Formato esperado

                </div>


                <code
                  className="
                    block
                    text-xs
                    text-gray-700
                    bg-white
                    rounded
                    p-3
                    overflow-x-auto
                  "
                >
                  codigo_ibge,codigo_indicador,valor,ano_referencia
                </code>

              </div>


              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  "
                >
                  Exemplo:
                </p>


                <pre
                  className="
                    bg-gray-50
                    border
                    rounded-lg
                    p-3
                    text-xs
                    overflow-x-auto
                  "
                >
{`codigo_ibge,codigo_indicador,valor,ano_referencia
2927408,I01,99.85,2026
2910800,I01,98.44,2026
2905701,I02,2450.50,2026`}
                </pre>

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
                  Arquivo CSV *
                </label>


                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={
                    e => {

                      setArquivoCSV(
                        e.target.files?.[0] ||
                        null
                      );

                      setResultadoImportacao(null);

                      setErro(null);

                    }
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    p-3
                    text-sm
                    bg-white
                  "
                />


                {arquivoCSV && (

                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-2
                    "
                  >
                    Arquivo selecionado:{' '}

                    <strong>
                      {arquivoCSV.name}
                    </strong>
                  </p>

                )}

              </div>


              {erro && (

                <div
                  className="
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-lg
                    p-3
                    flex
                    gap-2
                  "
                >

                  <AlertCircle size={18} />

                  <span className="text-sm">
                    {erro}
                  </span>

                </div>

              )}


              {sucesso &&
               resultadoImportacao && (

                <div
                  className="
                    bg-green-50
                    border
                    border-green-200
                    text-green-700
                    rounded-lg
                    p-3
                    flex
                    gap-2
                  "
                >

                  <CheckCircle2 size={18} />

                  <span className="text-sm">
                    {sucesso}
                  </span>

                </div>

              )}


              {resultadoImportacao && (

                <div
                  className="
                    bg-green-50
                    border
                    border-green-200
                    rounded-lg
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-green-700
                      font-medium
                      mb-4
                    "
                  >

                    <CheckCircle2 size={19} />

                    Resultado da importação

                  </div>


                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >

                    <div
                      className="
                        bg-white
                        rounded-lg
                        p-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Linhas
                      </p>

                      <p
                        className="
                          text-xl
                          font-bold
                        "
                      >
                        {resultadoImportacao.total_linhas}
                      </p>

                    </div>


                    <div
                      className="
                        bg-white
                        rounded-lg
                        p-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Inseridos
                      </p>

                      <p
                        className="
                          text-xl
                          font-bold
                          text-green-600
                        "
                      >
                        {resultadoImportacao.inseridos}
                      </p>

                    </div>


                    <div
                      className="
                        bg-white
                        rounded-lg
                        p-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Atualizados
                      </p>

                      <p
                        className="
                          text-xl
                          font-bold
                          text-blue-600
                        "
                      >
                        {resultadoImportacao.atualizados}
                      </p>

                    </div>


                    <div
                      className="
                        bg-white
                        rounded-lg
                        p-3
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Rejeitados
                      </p>

                      <p
                        className="
                          text-xl
                          font-bold
                          text-red-600
                        "
                      >
                        {resultadoImportacao.rejeitados}
                      </p>

                    </div>

                  </div>


                  {resultadoImportacao.erros?.length > 0 && (

                    <div className="mt-4">

                      <p
                        className="
                          text-sm
                          font-medium
                          text-red-700
                          mb-2
                        "
                      >
                        Linhas rejeitadas
                      </p>


                      <div
                        className="
                          bg-white
                          rounded-lg
                          border
                          max-h-40
                          overflow-y-auto
                        "
                      >

                        {resultadoImportacao.erros.map(
                          (item, index) => (

                            <div
                              key={
                                `${item.linha}-${index}`
                              }
                              className="
                                p-3
                                text-xs
                                border-b
                                last:border-b-0
                              "
                            >

                              <strong>
                                Linha {item.linha}:
                              </strong>{' '}

                              {item.motivo}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>

              )}


              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-3
                  border-t
                "
              >

                <button
                  type="button"
                  onClick={
                    fecharImportacao
                  }
                  disabled={
                    salvando
                  }
                  className="
                    px-4
                    py-2.5
                    border
                    rounded-lg
                    text-gray-600
                  "
                >
                  Fechar
                </button>


                <button
                  type="submit"
                  disabled={
                    salvando ||
                    !arquivoCSV
                  }
                  className="
                    bg-emerald-600
                    hover:bg-emerald-700
                    text-white
                    px-5
                    py-2.5
                    rounded-lg
                    font-medium
                    text-sm
                    flex
                    items-center
                    gap-2
                    disabled:opacity-50
                  "
                >

                  <Upload size={17} />

                  {salvando
                    ? 'Importando...'
                    : 'Importar CSV'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};


export default Indicadores;