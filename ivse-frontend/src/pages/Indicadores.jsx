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
  Save
} from 'lucide-react';

import api from '../services/api';


const Indicadores = () => {

  // ============================================================
  // ESTADOS
  // ============================================================

  const [indicadores, setIndicadores] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarFormularioValor, setMostrarFormularioValor] =
    useState(false);

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);


  // ============================================================
  // FORMULÁRIO DE INDICADOR
  // ============================================================

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


  const [formulario, setFormulario] =
    useState(formularioInicial);


  // ============================================================
  // FORMULÁRIO DE VALOR
  // ============================================================

  const formularioValorInicial = {
    municipio_id: '',
    indicador_id: '',
    valor: '',
    ano_referencia: 2026
  };


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
  // ATUALIZAR FORMULÁRIO DE INDICADOR
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


  // ============================================================
  // ATUALIZAR FORMULÁRIO DE VALOR
  // ============================================================

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
  // ABRIR FORMULÁRIO INDICADOR
  // ============================================================

  const abrirFormulario = () => {

    setFormulario(
      formularioInicial
    );

    setErro(null);
    setSucesso(null);

    setMostrarFormulario(true);

  };


  // ============================================================
  // FECHAR FORMULÁRIO INDICADOR
  // ============================================================

  const fecharFormulario = () => {

    if (salvando) {
      return;
    }

    setMostrarFormulario(false);

    setFormulario(
      formularioInicial
    );

  };


  // ============================================================
  // ABRIR FORMULÁRIO VALOR
  // ============================================================

  const abrirFormularioValor = () => {

    setFormularioValor(
      formularioValorInicial
    );

    setErro(null);
    setSucesso(null);

    setMostrarFormularioValor(true);

  };


  // ============================================================
  // FECHAR FORMULÁRIO VALOR
  // ============================================================

  const fecharFormularioValor = () => {

    if (salvando) {
      return;
    }

    setMostrarFormularioValor(false);

    setFormularioValor(
      formularioValorInicial
    );

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


        setSucesso(
          'Indicador cadastrado com sucesso.'
        );


        setMostrarFormulario(false);

        setFormulario(
          formularioInicial
        );


        await carregarDados();


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


        setSucesso(
          'Valor do indicador registrado com sucesso.'
        );


        setMostrarFormularioValor(false);

        setFormularioValor(
          formularioValorInicial
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

      {sucesso && (

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
       !mostrarFormularioValor && (

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
                    <strong>Fonte:</strong>{' '}
                    {indicador.fonte ||
                      'Não informada'}
                  </p>


                  <p>
                    <strong>Unidade:</strong>{' '}
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
                onClick={fecharFormulario}
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={cadastrarIndicador}
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

                  <label className="block text-sm font-medium mb-2">
                    Código *
                  </label>

                  <input
                    type="text"
                    required
                    value={formulario.codigo}
                    onChange={
                      e =>
                        atualizarCampo(
                          'codigo',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium mb-2">
                    Natureza TOPSIS *
                  </label>

                  <select
                    value={formulario.tipo_padrao}
                    onChange={
                      e =>
                        atualizarCampo(
                          'tipo_padrao',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
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

                <label className="block text-sm font-medium mb-2">
                  Nome *
                </label>

                <input
                  type="text"
                  required
                  value={formulario.nome}
                  onChange={
                    e =>
                      atualizarCampo(
                        'nome',
                        e.target.value
                      )
                  }
                  className="w-full border rounded-lg p-3"
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

                  <label className="block text-sm font-medium mb-2">
                    Dimensão
                  </label>

                  <input
                    type="text"
                    value={formulario.dimensao}
                    onChange={
                      e =>
                        atualizarCampo(
                          'dimensao',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium mb-2">
                    Unidade
                  </label>

                  <input
                    type="text"
                    value={formulario.unidade_medida}
                    onChange={
                      e =>
                        atualizarCampo(
                          'unidade_medida',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Fonte
                </label>

                <input
                  type="text"
                  value={formulario.fonte}
                  onChange={
                    e =>
                      atualizarCampo(
                        'fonte',
                        e.target.value
                      )
                  }
                  className="w-full border rounded-lg p-3"
                />

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Fórmula
                </label>

                <textarea
                  rows="2"
                  value={formulario.formula}
                  onChange={
                    e =>
                      atualizarCampo(
                        'formula',
                        e.target.value
                      )
                  }
                  className="w-full border rounded-lg p-3"
                />

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>

                <textarea
                  rows="3"
                  value={formulario.descricao}
                  onChange={
                    e =>
                      atualizarCampo(
                        'descricao',
                        e.target.value
                      )
                  }
                  className="w-full border rounded-lg p-3"
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
                  onClick={fecharFormulario}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={salvando}
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
                onClick={fecharFormularioValor}
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={registrarValor}
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


              {/* MUNICÍPIO */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Município *
                </label>

                <select
                  required
                  value={formularioValor.municipio_id}
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
                        key={municipio.id}
                        value={municipio.id}
                      >
                        {municipio.nome}
                        {' - '}
                        {municipio.codigo_ibge}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* INDICADOR */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Indicador *
                </label>

                <select
                  required
                  value={formularioValor.indicador_id}
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
                        key={indicador.id}
                        value={indicador.id}
                      >
                        {indicador.codigo}
                        {' - '}
                        {indicador.nome}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ANO + VALOR */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label className="block text-sm font-medium mb-2">
                    Ano *
                  </label>

                  <input
                    type="number"
                    required
                    value={formularioValor.ano_referencia}
                    onChange={
                      e =>
                        atualizarCampoValor(
                          'ano_referencia',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium mb-2">
                    Valor *
                  </label>

                  <input
                    type="number"
                    step="any"
                    required
                    value={formularioValor.valor}
                    onChange={
                      e =>
                        atualizarCampoValor(
                          'valor',
                          e.target.value
                        )
                    }
                    className="w-full border rounded-lg p-3"
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
                  onClick={fecharFormularioValor}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={salvando}
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

    </div>

  );

};


export default Indicadores;