// src/pages/Mapa.jsx

import { useState, useEffect } from 'react';

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import api from '../services/api';


const Mapa = () => {

  // ============================================================
  // ESTADOS
  // ============================================================

  const [municipios, setMunicipios] = useState([]);

  const [analises, setAnalises] = useState([]);

  const [analiseSelecionada, setAnaliseSelecionada] = useState('');

  const [carregando, setCarregando] = useState(true);

  const [carregandoMapa, setCarregandoMapa] = useState(false);

  const [erro, setErro] = useState(null);


  // Centro aproximado da Bahia
  const posicaoBahia = [-12.9714, -38.5014];


  // ============================================================
  // CARREGAR HISTÓRICO DE ANÁLISES
  // ============================================================

  useEffect(() => {

    const carregarAnalises = async () => {

      try {

        setCarregando(true);

        setErro(null);

        const resposta = await api.get('/topsis/analises');

        const listaAnalises = resposta.data;

        console.log(
          'ANÁLISES RECEBIDAS:',
          listaAnalises
        );

        setAnalises(listaAnalises);


        // ------------------------------------------------------
        // Selecionar automaticamente a análise mais recente
        // ------------------------------------------------------

        if (listaAnalises.length > 0) {

          setAnaliseSelecionada(
            String(listaAnalises[0].id)
          );

        } else {

          // Caso ainda não exista nenhuma análise,
          // carrega os municípios sem resultados TOPSIS.

          const respostaMunicipios =
            await api.get('/municipios');

          setMunicipios(
            respostaMunicipios.data
          );

        }

      } catch (erro) {

        console.error(
          'Erro ao carregar histórico de análises:',
          erro
        );

        setErro(
          'Não foi possível carregar o histórico de análises.'
        );

      } finally {

        setCarregando(false);

      }

    };


    carregarAnalises();

  }, []);


  // ============================================================
  // CARREGAR MUNICÍPIOS DA ANÁLISE SELECIONADA
  // ============================================================

  useEffect(() => {

    if (!analiseSelecionada) {
      return;
    }


    const carregarDadosMapa = async () => {

      try {

        setCarregandoMapa(true);

        setErro(null);


        const resposta = await api.get(
          `/municipios?analise_id=${analiseSelecionada}`
        );


        console.log(
          `DADOS DA ANÁLISE ${analiseSelecionada}:`,
          resposta.data
        );


        setMunicipios(
          resposta.data
        );


      } catch (erro) {

        console.error(
          'Erro ao carregar dados geográficos:',
          erro
        );

        setErro(
          'Não foi possível carregar os dados da análise selecionada.'
        );

      } finally {

        setCarregandoMapa(false);

      }

    };


    carregarDadosMapa();

  }, [analiseSelecionada]);


  // ============================================================
  // ANÁLISE ATUAL
  // ============================================================

  const analiseAtual = analises.find(
    analise =>
      Number(analise.id) ===
      Number(analiseSelecionada)
  );


  // ============================================================
  // COR POR NÍVEL DE VULNERABILIDADE
  // ============================================================

  const obterCorVulnerabilidade = (score) => {

    if (
      score === null ||
      score === undefined ||
      Number.isNaN(Number(score))
    ) {
      return '#9CA3AF';
    }


    const valor = Number(score);


    if (valor < 0.20) {
      return '#22C55E';
    }


    if (valor < 0.40) {
      return '#84CC16';
    }


    if (valor < 0.60) {
      return '#EAB308';
    }


    if (valor < 0.80) {
      return '#F97316';
    }


    return '#EF4444';

  };


  // ============================================================
  // TEXTO DO NÍVEL
  // ============================================================

  const obterNivelVulnerabilidade = (score) => {

    if (
      score === null ||
      score === undefined ||
      Number.isNaN(Number(score))
    ) {
      return 'Não calculado';
    }


    const valor = Number(score);


    if (valor < 0.20) {
      return 'Muito baixa';
    }


    if (valor < 0.40) {
      return 'Baixa';
    }


    if (valor < 0.60) {
      return 'Moderada';
    }


    if (valor < 0.80) {
      return 'Alta';
    }


    return 'Muito alta';

  };


  // ============================================================
  // FORMATAR SCORE
  // ============================================================

  const formatarScore = (score) => {

    if (
      score === null ||
      score === undefined ||
      Number.isNaN(Number(score))
    ) {
      return 'Não calculado';
    }


    return Number(score)
      .toFixed(4)
      .replace('.', ',');

  };


  // ============================================================
  // FORMATAR DATA
  // ============================================================

  const formatarData = (data) => {

    if (!data) {
      return '-';
    }


    return new Date(data).toLocaleString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  };


  // ============================================================
  // MUNICÍPIOS COM TOPSIS
  // ============================================================

  const municipiosComAnalise =
    municipios.filter(
      municipio =>
        municipio.ivse_score !== null &&
        municipio.ivse_score !== undefined
    ).length;


  // ============================================================
  // MUNICÍPIOS SEM TOPSIS
  // ============================================================

  const municipiosSemAnalise =
    municipios.length -
    municipiosComAnalise;


  // ============================================================
  // LOADING INICIAL
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
            Carregando histórico de análises...
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // ERRO
  // ============================================================

  if (erro && municipios.length === 0) {

    return (

      <div className="p-6">

        <div
          className="
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-xl
            p-4
          "
        >

          {erro}

        </div>

      </div>

    );

  }


  // ============================================================
  // MAPA
  // ============================================================

  return (

    <div
      className="
        p-6
        h-[calc(100vh-2rem)]
        flex
        flex-col
      "
    >


      {/* ====================================================== */}
      {/* CABEÇALHO */}
      {/* ====================================================== */}

      <div
        className="
          mb-4
          flex
          justify-between
          items-start
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
            Mapa de Vulnerabilidade
          </h1>


          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Visualização geoespacial dos municípios da Bahia
            com base no Índice de Vulnerabilidade Social Energética
          </p>

        </div>


        {/* ==================================================== */}
        {/* CONTADORES */}
        {/* ==================================================== */}

        <div
          className="
            flex
            gap-2
            flex-wrap
          "
        >


          <div
            className="
              text-sm
              font-medium
              text-gray-600
              bg-white
              px-4
              py-2
              rounded-lg
              shadow-sm
              border
              border-gray-100
            "
          >

            Mapeados:

            <strong className="ml-1">
              {municipios.length}
            </strong>

          </div>


          <div
            className="
              text-sm
              font-medium
              text-gray-600
              bg-white
              px-4
              py-2
              rounded-lg
              shadow-sm
              border
              border-gray-100
            "
          >

            Com análise:

            <strong className="ml-1">
              {municipiosComAnalise}
            </strong>

          </div>


          <div
            className="
              text-sm
              font-medium
              text-gray-600
              bg-white
              px-4
              py-2
              rounded-lg
              shadow-sm
              border
              border-gray-100
            "
          >

            Sem análise:

            <strong className="ml-1">
              {municipiosSemAnalise}
            </strong>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* SELETOR DA ANÁLISE */}
      {/* ====================================================== */}

      <div
        className="
          bg-white
          border
          border-gray-100
          shadow-sm
          rounded-xl
          px-4
          py-3
          mb-4
          flex
          items-center
          justify-between
          gap-4
          flex-wrap
        "
      >


        <div>

          <label
            htmlFor="analise-mapa"
            className="
              block
              text-xs
              font-semibold
              text-gray-500
              uppercase
              tracking-wide
              mb-1
            "
          >
            Análise exibida no mapa
          </label>


          {analises.length > 0 ? (

            <select
              id="analise-mapa"

              value={analiseSelecionada}

              onChange={(event) =>
                setAnaliseSelecionada(
                  event.target.value
                )
              }

              disabled={carregandoMapa}

              className="
                min-w-[320px]
                max-w-full
                border
                border-gray-300
                bg-white
                text-gray-700
                text-sm
                rounded-lg
                px-3
                py-2
                outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                disabled:opacity-60
              "
            >

              {analises.map(
                analise => (

                  <option
                    key={analise.id}
                    value={analise.id}
                  >

                    {analise.titulo}
                    {' — '}
                    {analise.ano_referencia || 'Ano não informado'}
                    {' — '}
                    {analise.total_municipios} municípios

                  </option>

                )
              )}

            </select>

          ) : (

            <p className="text-sm text-gray-500">

              Nenhuma análise TOPSIS disponível.

            </p>

          )}

        </div>


        {/* ==================================================== */}
        {/* DADOS DA ANÁLISE SELECIONADA */}
        {/* ==================================================== */}

        {analiseAtual && (

          <div
            className="
              flex
              gap-6
              flex-wrap
              text-sm
            "
          >

            <div>

              <div
                className="
                  text-xs
                  text-gray-400
                  mb-1
                "
              >
                Ano de referência
              </div>

              <strong
                className="
                  text-gray-700
                "
              >
                {analiseAtual.ano_referencia || '-'}
              </strong>

            </div>


            <div>

              <div
                className="
                  text-xs
                  text-gray-400
                  mb-1
                "
              >
                Municípios
              </div>

              <strong
                className="
                  text-gray-700
                "
              >
                {analiseAtual.total_municipios}
              </strong>

            </div>


            <div>

              <div
                className="
                  text-xs
                  text-gray-400
                  mb-1
                "
              >
                Executada em
              </div>

              <strong
                className="
                  text-gray-700
                "
              >
                {formatarData(
                  analiseAtual.data_execucao
                )}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* ====================================================== */}
      {/* AVISO DE CARREGAMENTO DA ANÁLISE */}
      {/* ====================================================== */}

      {carregandoMapa && (

        <div
          className="
            mb-3
            bg-blue-50
            border
            border-blue-100
            text-blue-700
            rounded-lg
            px-4
            py-2
            text-sm
          "
        >
          Carregando resultados da análise selecionada...
        </div>

      )}


      {/* ====================================================== */}
      {/* ERRO NÃO BLOQUEANTE */}
      {/* ====================================================== */}

      {erro && municipios.length > 0 && (

        <div
          className="
            mb-3
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-lg
            px-4
            py-2
            text-sm
          "
        >
          {erro}
        </div>

      )}


      {/* ====================================================== */}
      {/* MAPA */}
      {/* ====================================================== */}

      <div
        className="
          flex-1
          bg-white
          rounded-xl
          shadow-sm
          border
          border-gray-100
          overflow-hidden
          relative
          z-0
        "
      >


        <MapContainer

          center={posicaoBahia}

          zoom={7}

          scrollWheelZoom={true}

          style={{
            width: '100%',
            height: '100%'
          }}

        >


          <TileLayer

            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          />


          {/* ================================================== */}
          {/* MUNICÍPIOS */}
          {/* ================================================== */}

          {municipios.map((mun) => {


            const latitude =
              Number(mun.latitude);


            const longitude =
              Number(mun.longitude);


            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) {
              return null;
            }


            const cor =
              obterCorVulnerabilidade(
                mun.ivse_score
              );


            const nivel =
              mun.nivel_vulnerabilidade ||
              obterNivelVulnerabilidade(
                mun.ivse_score
              );


            return (

              <CircleMarker

                key={
                  `${analiseSelecionada}-${mun.codigo_ibge || mun.id}`
                }

                center={[
                  latitude,
                  longitude
                ]}

                radius={7}

                pathOptions={{
                  color: cor,
                  fillColor: cor,
                  fillOpacity: 0.85,
                  weight: 2
                }}

              >


                {/* ================================================= */}
                {/* POPUP */}
                {/* ================================================= */}

                <Popup>


                  <div
                    style={{
                      minWidth: '250px',
                      margin: '-13px -20px -13px -20px'
                    }}
                  >


                    {/* FAIXA COLORIDA */}

                    <div
                      style={{
                        height: '7px',
                        backgroundColor: cor,
                        borderRadius: '8px 8px 0 0'
                      }}
                    />


                    <div
                      style={{
                        padding: '16px'
                      }}
                    >


                      {/* MUNICÍPIO */}

                      <div
                        style={{
                          marginBottom: '4px'
                        }}
                      >

                        <strong
                          style={{
                            fontSize: '18px',
                            color: '#111827'
                          }}
                        >
                          {mun.nome}
                        </strong>

                      </div>


                      {/* UF + IBGE */}

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          marginBottom: '14px'
                        }}
                      >
                        {mun.uf} • IBGE {mun.codigo_ibge}
                      </div>


                      {/* TOPSIS */}

                      {mun.ivse_score !== null &&
                      mun.ivse_score !== undefined ? (

                        <>


                          {/* IVSE */}

                          <div
                            style={{
                              backgroundColor: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              marginBottom: '10px'
                            }}
                          >


                            <div
                              style={{
                                fontSize: '10px',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Índice IVSE
                            </div>


                            <div
                              style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#111827',
                                marginTop: '2px'
                              }}
                            >
                              {formatarScore(
                                mun.ivse_score
                              )}
                            </div>

                          </div>


                          {/* RANKING */}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px',
                              paddingBottom: '10px',
                              borderBottom: '1px solid #E5E7EB'
                            }}
                          >


                            <span
                              style={{
                                fontSize: '12px',
                                color: '#6B7280'
                              }}
                            >
                              Ranking estadual
                            </span>


                            <strong
                              style={{
                                fontSize: '13px',
                                color: '#111827'
                              }}
                            >
                              {mun.posicao_ranking
                                ? `${mun.posicao_ranking}º de ${municipiosComAnalise}`
                                : '-'}
                            </strong>

                          </div>


                          {/* VULNERABILIDADE */}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >


                            <span
                              style={{
                                fontSize: '12px',
                                color: '#6B7280'
                              }}
                            >
                              Vulnerabilidade
                            </span>


                            <span
                              style={{
                                color: cor,
                                fontWeight: '700',
                                fontSize: '12px',
                                backgroundColor: `${cor}18`,
                                padding: '4px 8px',
                                borderRadius: '999px'
                              }}
                            >
                              {nivel}
                            </span>

                          </div>


                          {/* ANÁLISE */}

                          {analiseAtual && (

                            <div
                              style={{
                                marginTop: '12px',
                                paddingTop: '10px',
                                borderTop: '1px solid #E5E7EB',
                                fontSize: '10px',
                                color: '#9CA3AF'
                              }}
                            >

                              Análise: {analiseAtual.titulo}

                            </div>

                          )}

                        </>

                      ) : (

                        <div
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#6B7280',
                            fontSize: '12px',
                            textAlign: 'center'
                          }}
                        >

                          Município sem resultado
                          na análise selecionada.

                        </div>

                      )}

                    </div>

                  </div>

                </Popup>

              </CircleMarker>

            );

          })}

        </MapContainer>


        {/* ==================================================== */}
        {/* LEGENDA */}
        {/* ==================================================== */}

        <div
          className="
            absolute
            bottom-5
            right-5
            z-[1000]
            bg-white
            rounded-lg
            shadow-lg
            border
            border-gray-200
            p-3
          "
        >


          <div
            className="
              text-xs
              font-bold
              text-gray-700
              mb-2
            "
          >
            Vulnerabilidade
          </div>


          <LegendaItem
            cor="#22C55E"
            texto="Muito baixa"
          />


          <LegendaItem
            cor="#84CC16"
            texto="Baixa"
          />


          <LegendaItem
            cor="#EAB308"
            texto="Moderada"
          />


          <LegendaItem
            cor="#F97316"
            texto="Alta"
          />


          <LegendaItem
            cor="#EF4444"
            texto="Muito alta"
          />


          <LegendaItem
            cor="#9CA3AF"
            texto="Sem análise"
          />

        </div>

      </div>

    </div>

  );

};


// ============================================================
// ITEM DA LEGENDA
// ============================================================

const LegendaItem = ({
  cor,
  texto
}) => {

  return (

    <div
      className="
        flex
        items-center
        gap-2
        text-xs
        text-gray-600
        mb-1
      "
    >


      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: cor,
          display: 'inline-block'
        }}
      />


      {texto}

    </div>

  );

};


export default Mapa;