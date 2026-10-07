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

  const [municipios, setMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Centro aproximado da Bahia
  const posicaoBahia = [-12.9714, -38.5014];


  // ============================================================
  // CARREGAR MUNICÍPIOS
  // ============================================================

  useEffect(() => {

    const carregarDadosMapa = async () => {

      try {

        setCarregando(true);
        setErro(null);

        const resposta = await api.get('/municipios');

        console.log(
          'DADOS DO MAPA RECEBIDOS:',
          resposta.data
        );

        setMunicipios(resposta.data);

      } catch (erro) {

        console.error(
          'Erro ao carregar dados geográficos para o mapa:',
          erro
        );

        setErro(
          'Não foi possível carregar os dados do mapa.'
        );

      } finally {

        setCarregando(false);

      }

    };

    carregarDadosMapa();

  }, []);


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
  // MUNICÍPIOS COM TOPSIS
  // ============================================================

  const municipiosComAnalise = municipios.filter(
    municipio =>
      municipio.ivse_score !== null &&
      municipio.ivse_score !== undefined
  ).length;


  // ============================================================
  // MUNICÍPIOS SEM TOPSIS
  // ============================================================

  const municipiosSemAnalise =
    municipios.length - municipiosComAnalise;


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
            Carregando mapa dos municípios...
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // ERRO
  // ============================================================

  if (erro) {

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


            // Coordenada inexistente ou inválida
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
                  mun.codigo_ibge ||
                  mun.id
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


                      {/* VERIFICA SE EXISTE TOPSIS */}
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
                              {formatarScore(mun.ivse_score)}
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
                          Município ainda sem resultado TOPSIS.
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