# Projeto de análise IVSE — Índice de Vulnerabilidade Social Energética

Plataforma web para análise multicritério da vulnerabilidade social energética de municípios da Bahia, utilizando o método **TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)**.

O sistema permite cadastrar municípios e indicadores, associar valores aos municípios, configurar critérios e pesos, executar análises TOPSIS, calcular o IVSE, gerar rankings, comparar municípios, visualizar resultados em mapa georreferenciado, consultar o histórico de análises, importar dados em lote por CSV, gerar relatórios em PDF e controlar o acesso por autenticação e perfis de usuário.

---

##  Objetivo

Desenvolver uma plataforma computacional capaz de medir indicadores multicritério relacionados à vulnerabilidade social energética, permitindo:

- identificar e organizar indicadores sociais e energéticos;
- configurar pesos e natureza dos critérios;
- executar o método TOPSIS;
- calcular o IVSE de cada município;
- gerar ranking dos municípios analisados;
- visualizar os resultados geograficamente;
- consultar análises anteriores;
- apoiar comparações e futuras análises para suporte à tomada de decisão.

---

##  Método TOPSIS

O TOPSIS é utilizado para classificar alternativas com base na proximidade de uma solução ideal positiva e no afastamento de uma solução ideal negativa.

Fluxo simplificado da análise:

```text
Dados dos municípios
        ↓
Indicadores
        ↓
Matriz de decisão
        ↓
Normalização
        ↓
Aplicação dos pesos
        ↓
Soluções ideais positiva e negativa
        ↓
Distâncias euclidianas
        ↓
Coeficiente de proximidade
        ↓
IVSE
        ↓
Ranking
```

Cada critério pode ser definido como:

- **Benefício**: valores maiores são considerados favoráveis;
- **Custo**: valores menores são considerados favoráveis.

---

##  Área de estudo

A versão atual da plataforma trabalha com os **417 municípios do estado da Bahia**.

Os municípios são identificados pelo **código IBGE** e possuem coordenadas geográficas armazenadas em PostgreSQL/PostGIS.

---

##  Funcionalidades implementadas

### Municípios

- cadastro de municípios;
- sincronização dos 417 municípios da Bahia;
- armazenamento do código IBGE;
- armazenamento de coordenadas geográficas;
- visualização dos municípios no mapa.

### Indicadores

- cadastro de indicadores;
- código identificador;
- nome;
- dimensão;
- unidade de medida;
- fonte;
- fórmula;
- descrição;
- natureza padrão no TOPSIS (`beneficio` ou `custo`);
- associação de valores dos indicadores aos municípios;
- registro por ano de referência.

### TOPSIS

- seleção de indicadores;
- configuração de pesos;
- definição de benefício ou custo;
- seleção de todos os municípios elegíveis;
- seleção de municípios específicos;
- validação de dados antes da execução;
- normalização vetorial;
- matriz ponderada;
- cálculo das soluções ideais;
- cálculo das distâncias euclidianas;
- cálculo do IVSE;
- geração automática do ranking;
- armazenamento dos resultados.

### Histórico

- armazenamento das análises executadas;
- título da análise;
- ano de referência;
- data de execução;
- critérios utilizados;
- pesos utilizados;
- resultados por município;
- consulta de análises anteriores.

### Mapa de Vulnerabilidade

- mapa interativo utilizando Leaflet;
- visualização dos 417 municípios;
- seleção da análise exibida;
- índice IVSE no popup;
- posição no ranking;
- classificação do nível de vulnerabilidade;
- identificação visual por cores.

Escala atualmente utilizada:

| IVSE | Classificação |
|---|---|
| 0,00 – 0,19 | Muito baixa |
| 0,20 – 0,39 | Baixa |
| 0,40 – 0,59 | Moderada |
| 0,60 – 0,79 | Alta |
| 0,80 – 1,00 | Muito alta |

> A interpretação final da escala deve permanecer coerente com a definição metodológica adotada para o IVSE e com a direção dos critérios utilizados.

### Dashboard

- status de conexão com o backend;
- total de municípios cadastrados;
- total de análises realizadas;
- resumo da análise mais recente;
- IVSE médio;
- maior IVSE;
- distribuição por faixa de vulnerabilidade;
- municípios com maiores índices;
- atalhos para mapa, comparação e nova simulação.

### Comparação entre municípios

- seleção de uma análise já executada;
- pesquisa e seleção de municípios;
- comparação do IVSE;
- comparação da posição no ranking;
- comparação das distâncias para as soluções ideais;
- classificação visual do nível de vulnerabilidade.

### Autenticação e perfis

A plataforma utiliza autenticação baseada em **JWT (JSON Web Token)**.

Perfis implementados:

| Perfil | Permissões gerais |
|---|---|
| Administrador | Acesso completo ao sistema |
| Pesquisador | Dashboard, mapa, municípios, indicadores, simulações, comparação e relatórios |
| Gestor | Dashboard, mapa, comparação e relatórios |

### Importação CSV

A tela de indicadores permite importar valores em lote usando arquivo CSV com as colunas:

```csv
codigo_ibge,codigo_indicador,valor,ano_referencia
2910800,TSEE_01,25.4,2026
2905701,TSEE_01,31.7,2026
```

### Relatórios

- seleção de análise concluída;
- geração de relatório em PDF;
- título, ano e data de execução;
- quantidade de municípios analisados;
- IVSE médio, maior e menor IVSE;
- critérios, pesos e direção;
- ranking;
- código IBGE;
- IVSE;
- distâncias TOPSIS `D+` e `D-`.

---

##  Requisitos Funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF01 | Cadastrar municípios | ✅ |
| RF02 | Armazenar informações geográficas | ✅ |
| RF03 | Cadastrar indicadores | ✅ |
| RF04 | Associar valores de indicadores aos municípios | ✅ |
| RF05 | Definir pesos | ✅ |
| RF06 | Definir benefício ou custo | ✅ |
| RF07 | Selecionar municípios para análise | ✅ |
| RF08 | Selecionar indicadores | ✅ |
| RF09 | Executar TOPSIS | ✅ |
| RF10 | Calcular índice dos municípios | ✅ |
| RF11 | Gerar ranking | ✅ |
| RF12 | Comparar municípios | ✅ |
| RF13 | Mapa georreferenciado | ✅ |
| RF14 | Dashboard de resultados | ✅ |
| RF15 | Armazenar histórico | ✅ |
| RF16 | Consultar análises anteriores | ✅ |
| RF17 | Gerar relatórios | ✅ |
| RF18 | Validar dados antes do TOPSIS | ✅ |
| RF19 | Autenticação por login e senha | ✅ |
| RF20 | Controle de perfis de acesso | ✅ |
| RF21 | Importação em lote por CSV | ✅ |

---

##  Arquitetura

```text
┌───────────────────────────────┐
│           Frontend            │
│        React + Leaflet        │
│                               │
│ Dashboard / Mapa / TOPSIS     │
│ Indicadores / Municípios      │
└───────────────┬───────────────┘
                │ HTTP / REST
                ▼
┌───────────────────────────────┐
│            Backend            │
│        Node.js + Express      │
│                               │
│ Controllers / Services / API  │
│ Motor TOPSIS                  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          PostgreSQL           │
│           + PostGIS           │
│                               │
│ Municípios / Indicadores      │
│ Análises / Resultados TOPSIS  │
└───────────────────────────────┘
```

---

##  Tecnologias

### Frontend

- React
- JavaScript
- React Leaflet
- Leaflet
- Tailwind CSS
- Lucide React
- Axios
- React Router
- jsPDF
- jsPDF AutoTable

### Backend

- Node.js
- Express
- JavaScript
- PostgreSQL
- PostGIS
- REST API
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- Multer
- csv-parser

### Infraestrutura

- Docker
- Docker Compose
- Git
- GitHub

---

##  Estrutura geral

```text
projeto/
│
├── ivse-frontend/
│   └── src/
│       ├── pages/
│       │   ├── Mapa.jsx
│       │   ├── Indicadores.jsx
│       │   └── Simulacao.jsx
│       └── services/
│           └── api.js
│
├── ivse-plataforma/
│   └── src/
│       ├── config/
│       │   └── database.js
│       ├── controllers/
│       │   ├── municipio.controller.js
│       │   ├── indicador.controller.js
│       │   └── topsis.controller.js
│       ├── routes/
│       │   ├── municipio.routes.js
│       │   ├── indicador.routes.js
│       │   └── topsis.routes.js
│       ├── services/
│       │   └── topsis.service.js
│       ├── scripts/
│       │   ├── sincronizarIbge.js
│       │   └── sincronizarCoordenadasBahia.js
│       └── database/
│           └── init.sql
│
├── docker-compose.yml
└── README.md
```

---

##  Banco de dados

Principais tabelas:

### `usuarios`

- `id`
- `email`
- `senha`
- `perfil`
- `criado_em`

Perfis aceitos:

- `administrador`
- `pesquisador`
- `gestor`

### `municipios`

- `id`
- `codigo_ibge`
- `nome`
- `uf`
- `coordenadas`

### `indicadores`

- `id`
- `codigo`
- `nome`
- `dimensao`
- `unidade_medida`
- `fonte`
- `formula`
- `descricao`
- `tipo_padrao`

### `valores_indicadores`

- `municipio_id`
- `indicador_id`
- `valor`
- `ano_referencia`

### `analises`

- `id`
- `titulo`
- `ano_referencia`
- `usuario_id`
- `data_execucao`
- `status`

### `criterios_analise`

- `analise_id`
- `indicador_id`
- `peso`
- `tipo_direcao`

### `resultados_topsis`

- `analise_id`
- `municipio_id`
- `ivse_score`
- `dist_ideal_positiva`
- `dist_ideal_negativa`
- `posicao_ranking`

---

##  Principais endpoints

### Municípios

```http
GET /api/municipios
GET /api/municipios?analise_id=13
POST /api/municipios
```

### Indicadores

```http
GET /api/indicadores
POST /api/indicadores
POST /api/indicadores/valores
POST /api/indicadores/importar-csv
```

### Autenticação

```http
POST /api/auth/login
GET /api/auth/me
GET /api/auth/usuarios
POST /api/auth/usuarios
```

### TOPSIS

```http
POST /api/topsis/simular
POST /api/topsis/executar
GET /api/topsis/analises
GET /api/topsis/analises/:id/relatorio
```

---

## Portas utilizadas

| Serviço | Porta |
|---|---:|
| Frontend Vite | `5173` |
| API Node.js/Express | `3000` |
| PostgreSQL | `5432` |

> A porta `3000` pertence à API. A porta do PostgreSQL é `5432`.

---

##  Instalação

### Pré-requisitos

Antes de executar o projeto, tenha instalado:

- Git
- Docker
- Docker Compose

### 1. Clonar o repositório

```bash
git clone https://github.com/Andrei-SantAnna/ivse-plataforma.git
cd ivse-plataforma
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` conforme o modelo utilizado pelo projeto.

Exemplo:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=ivse
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=gere_uma_chave_secreta_forte
```

> Ajuste os valores conforme o `docker-compose.yml` do projeto. A API utiliza a porta `3000` e o PostgreSQL utiliza a porta `5432`.

### 3. Executar com Docker Compose

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d --build
```

Para encerrar:

```bash
docker compose down
```

---

## Autenticação

Para utilizar as áreas protegidas da plataforma, é necessário possuir um usuário cadastrado.

Fluxo simplificado:

```text
Tela de Login
      ↓
POST /api/auth/login
      ↓
Validação de e-mail e senha
      ↓
Geração do JWT
      ↓
Acesso às rotas protegidas
```

O token é enviado no cabeçalho:

```http
Authorization: Bearer TOKEN
```

> O arquivo `.env` não deve ser versionado e o valor real de `JWT_SECRET` nunca deve ser publicado no repositório.

---

##  Sincronização dos municípios

A plataforma possui scripts auxiliares para cadastro dos municípios da Bahia.

### Sincronizar municípios pelo IBGE

```bash
node src/scripts/sincronizarIbge.js
```

### Sincronizar coordenadas

```bash
node src/scripts/sincronizarCoordenadasBahia.js
```

O processo utiliza o código IBGE como chave de associação.

---

##  Executando uma análise TOPSIS

Na tela **Simulação TOPSIS**:

1. informe o título da análise;
2. informe o ano de referência;
3. escolha se deseja analisar todos os municípios elegíveis ou apenas municípios específicos;
4. selecione os indicadores;
5. informe os pesos;
6. defina cada critério como benefício ou custo;
7. execute o motor TOPSIS.

O sistema irá:

1. buscar os valores dos indicadores;
2. eliminar municípios sem todos os dados necessários;
3. construir a matriz de decisão;
4. executar o TOPSIS;
5. calcular o IVSE;
6. gerar o ranking;
7. salvar a análise e os resultados.

---

##  Visualização no mapa

Na tela **Mapa de Vulnerabilidade** é possível:

- selecionar uma análise já executada;
- visualizar os municípios da Bahia;
- identificar a vulnerabilidade por cores;
- clicar em um município;
- visualizar IVSE;
- visualizar ranking estadual;
- consultar a análise utilizada.

---

##  Validações já implementadas

Entre as validações atuais estão:

- código IBGE único;
- código de indicador único;
- validação de natureza `beneficio` ou `custo`;
- município existente;
- indicador existente;
- valor de indicador numérico;
- ano de referência válido;
- prevenção de valor duplicado para município + indicador + ano;
- indicador obrigatório na análise;
- prevenção de indicador duplicado em uma mesma configuração;
- peso maior que zero;
- seleção mínima de municípios para análises específicas;
- matriz TOPSIS compatível com a quantidade de pesos;
- tratamento de divisão por zero na normalização;
- validação de dados completos antes da execução;
- mínimo de dois indicadores;
- mínimo de dois municípios em análises específicas;
- rejeição de pesos inválidos;
- prevenção de indicadores duplicados;
- verificação de IDs inexistentes;
- rejeição de critérios sem variação;
- validação da normalização;
- validação do intervalo do IVSE;
- verificação da integridade do ranking.

---

##  Testes

A suíte automatizada deverá contemplar:

- testes unitários do motor TOPSIS;
- testes de normalização;
- testes das soluções ideais;
- testes de ranking;
- testes de validação de entrada;
- testes de integração da API;
- testes de persistência das análises;
- testes de autenticação;
- testes de autorização por perfil;
- testes da importação CSV;
- testes das validações do RF18.

> A suíte automatizada ainda faz parte das etapas de validação final do projeto.

---

##  Próximas etapas

Os requisitos funcionais RF01 a RF21 estão implementados.

Próximas etapas acadêmicas e técnicas:

- documentação Swagger/OpenAPI;
- testes automatizados unitários e de integração;
- diagramas UML;
- manual do usuário;
- revisão metodológica final do IVSE/TOPSIS;
- apresentação final;
- roteiro de demonstração ao vivo.

---

##  Documentação acadêmica

O projeto deverá possuir, além deste README:

- Documento de Requisitos;
- Diagrama de Casos de Uso;
- Diagrama de Classes;
- Diagrama de Sequência;
- documentação da API com Swagger/OpenAPI;
- manual do usuário;
- apresentação final;
- roteiro de demonstração ao vivo.

---

##  Norma de referência

O desenvolvimento do projeto considera os processos de ciclo de vida de software definidos pela **ISO/IEC 12207**, incluindo atividades relacionadas a desenvolvimento, operação e manutenção.

---

##  Projeto acadêmico

Projeto desenvolvido no curso de **Engenharia da Computação** por Andrei Boulhosa de Sant'Anna.

---

## 📄 Licença

Uso acadêmico e educacional.

