// src/services/topsis.service.js

/**
 * Serviço de processamento do método multicritério TOPSIS.
 * Utilizado para calcular o Índice de Vulnerabilidade Social Energética (IVSE).
 */
class TopsisService {
  
  /**
   * Executa o algoritmo TOPSIS completo.
   * @param {Array} matriz - Matriz de decisão (array de arrays com os valores brutos).
   * @param {Array} pesos - Array com os pesos de cada critério.
   * @param {Array} tipos - Array com as direções ('beneficio' ou 'custo').
   * @param {Array} alternativas - Dados de identificação das alternativas (ex: IDs dos municípios).
   * @returns {Array} Ranking ordenado com o IVSE e distâncias euclidianas.
   */
  calcular(matriz, pesos, tipos, alternativas) {
    if (!matriz.length || matriz[0].length !== pesos.length) {
      throw new Error("Erro de dimensão: As colunas da matriz não coincidem com o número de pesos.");
    }

    const numAlternativas = matriz.length;
    const numCriterios = pesos.length;

    // 1. Normalização Vetorial (r_ij)
    const matrizNormalizada = this._normalizar(matriz, numAlternativas, numCriterios);

    // 2. Matriz Ponderada (v_ij)
    const matrizPonderada = matrizNormalizada.map(linha =>
      linha.map((valor, j) => valor * pesos[j])
    );

    // 3. Soluções Ideais Positiva (A+) e Negativa (A-)
    const { idealPositiva, idealNegativa } = this._calcularIdeais(matrizPonderada, tipos, numAlternativas, numCriterios);

    // 4 e 5. Distâncias Euclidianas e Coeficiente de Proximidade (IVSE)
    const resultados = [];
    for (let i = 0; i < numAlternativas; i++) {
      let somaDistPos = 0;
      let somaDistNeg = 0;

      for (let j = 0; j < numCriterios; j++) {
        somaDistPos += Math.pow(matrizPonderada[i][j] - idealPositiva[j], 2);
        somaDistNeg += Math.pow(matrizPonderada[i][j] - idealNegativa[j], 2);
      }

      const distPositiva = Math.sqrt(somaDistPos);
      const distNegativa = Math.sqrt(somaDistNeg);
      
      // Cálculo do Ci: D- / (D+ + D-). Previne divisão por zero (RN09)
      const divisor = distPositiva + distNegativa;
      const ivse = divisor === 0 ? 0 : distNegativa / divisor;

      resultados.push({
        municipio: alternativas[i],
        distancia_positiva: distPositiva.toFixed(8),
        distancia_negativa: distNegativa.toFixed(8),
        ivse_score: parseFloat(ivse.toFixed(8))
      });
    }

    // 6. Ordenar o Ranking (Ordem decrescente de IVSE)
    return resultados
      .sort((a, b) => b.ivse_score - a.ivse_score)
      .map((res, index) => ({
        ...res,
        posicao_ranking: index + 1
      }));
  }

  _normalizar(matriz, numAlternativas, numCriterios) {
    const matrizNorm = Array(numAlternativas).fill(0).map(() => Array(numCriterios).fill(0));
    
    for (let j = 0; j < numCriterios; j++) {
      let somaQuadrados = 0;
      for (let i = 0; i < numAlternativas; i++) {
        somaQuadrados += Math.pow(matriz[i][j], 2);
      }
      
      const raizSoma = Math.sqrt(somaQuadrados);
      
      for (let i = 0; i < numAlternativas; i++) {
        // Se a coluna inteira for 0, o valor normalizado é 0 para evitar Infinity
        matrizNorm[i][j] = raizSoma === 0 ? 0 : matriz[i][j] / raizSoma;
      }
    }
    return matrizNorm;
  }

  _calcularIdeais(matrizPonderada, tipos, numAlternativas, numCriterios) {
    const idealPositiva = Array(numCriterios).fill(0);
    const idealNegativa = Array(numCriterios).fill(0);

    for (let j = 0; j < numCriterios; j++) {
      const coluna = matrizPonderada.map(linha => linha[j]);
      const valorMax = Math.max(...coluna);
      const valorMin = Math.min(...coluna);

      if (tipos[j] === 'beneficio') {
        idealPositiva[j] = valorMax;
        idealNegativa[j] = valorMin;
      } else if (tipos[j] === 'custo') {
        idealPositiva[j] = valorMin;
        idealNegativa[j] = valorMax;
      } else {
        throw new Error(`Tipo de critério inválido: ${tipos[j]}`);
      }
    }

    return { idealPositiva, idealNegativa };
  }
}

module.exports = new TopsisService();