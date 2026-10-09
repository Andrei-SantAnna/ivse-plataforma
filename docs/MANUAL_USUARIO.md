# Manual do Usuário — Plataforma IVSE

## 1. Introdução

A Plataforma IVSE foi desenvolvida para apoiar a análise da Vulnerabilidade Social Energética dos municípios da Bahia por meio do método TOPSIS.

O sistema permite cadastrar e consultar municípios, gerenciar indicadores, registrar valores, importar dados por CSV, executar análises TOPSIS, visualizar rankings, consultar mapas, comparar municípios, gerar relatórios em PDF e consultar o histórico de análises.

---

## 2. Acesso ao sistema

Acesse a aplicação pelo endereço definido para o frontend.

Em ambiente local, o endereço padrão é:

```text
http://localhost:5173
```

Ao acessar o sistema, a tela de login será exibida.

Informe:

- e-mail;
- senha.

Depois clique em **Entrar**.

Se as credenciais estiverem corretas, o usuário será direcionado ao Dashboard.

---

## 3. Perfis de acesso

A plataforma possui três perfis de usuário.

### Administrador

Possui acesso completo ao sistema.

### Pesquisador

Pode acessar:

- Dashboard;
- Mapa;
- Municípios;
- Indicadores;
- Simulação TOPSIS;
- Comparação;
- Relatórios.

### Gestor

Pode acessar:

- Dashboard;
- Mapa;
- Comparação;
- Relatórios.

As permissões exibidas no menu variam de acordo com o perfil do usuário autenticado.

---

## 4. Dashboard

O Dashboard apresenta um resumo do estado atual da plataforma.

Entre as informações disponíveis estão:

- status de conexão com o backend;
- quantidade de municípios cadastrados;
- quantidade de análises realizadas;
- quantidade de municípios da análise mais recente;
- IVSE médio;
- análise mais recente;
- maior IVSE identificado;
- distribuição dos municípios por faixa de vulnerabilidade;
- municípios com maiores índices;
- análises recentes.

Também existem atalhos para outras funcionalidades da plataforma.

---

## 5. Municípios

A tela **Municípios** permite consultar os municípios cadastrados.

Cada município possui informações como:

- nome;
- código IBGE;
- UF;
- coordenadas geográficas.

Os municípios cadastrados são utilizados como alternativas nas análises TOPSIS.

---

## 6. Indicadores

A tela **Indicadores** permite consultar e cadastrar indicadores utilizados nas análises.

Um indicador pode possuir:

- código;
- nome;
- dimensão;
- unidade de medida;
- fonte;
- fórmula;
- descrição;
- tipo padrão.

O tipo padrão pode ser:

- **Benefício**;
- **Custo**.

---

## 7. Cadastro de indicador

Na tela de Indicadores:

1. clique em **Novo Indicador**;
2. informe os dados solicitados;
3. escolha o tipo padrão;
4. confirme o cadastro.

O código do indicador deve ser único.

---

## 8. Registro de valor de indicador

Para registrar manualmente um valor:

1. acesse a tela de Indicadores;
2. clique em **Registrar Valor**;
3. selecione o município;
4. selecione o indicador;
5. informe o valor;
6. informe o ano de referência;
7. confirme o registro.

O sistema evita duplicidade para a combinação:

```text
Município + Indicador + Ano
```

---

## 9. Importação de dados por CSV

A plataforma permite importar valores em lote.

O arquivo deve utilizar as colunas:

```csv
codigo_ibge,codigo_indicador,valor,ano_referencia
2910800,TSEE_01,25.4,2026
2905701,TSEE_01,31.7,2026
```

Para importar:

1. acesse **Indicadores**;
2. clique em **Importar CSV**;
3. selecione o arquivo;
4. confirme a importação.

Ao final, o sistema informa:

- total de linhas;
- registros inseridos;
- registros atualizados;
- registros rejeitados;
- erros encontrados.

Linhas completamente vazias são ignoradas.

---

## 10. Simulação TOPSIS

A tela **Simulação TOPSIS** é utilizada para executar uma nova análise.

### Passo 1 — Informações da análise

Informe:

- título;
- ano de referência.

### Passo 2 — Municípios

Escolha entre:

- todos os municípios elegíveis;
- municípios específicos.

Quando municípios específicos forem selecionados, a análise deve possuir quantidade mínima compatível com as validações do sistema.

### Passo 3 — Indicadores

Selecione os indicadores desejados.

A análise exige pelo menos dois critérios válidos.

### Passo 4 — Pesos

Informe o peso de cada critério.

Os pesos devem ser numéricos e maiores que zero.

### Passo 5 — Direção

Cada critério deve ser classificado como:

- **Benefício**;
- **Custo**.

### Passo 6 — Executar

Clique no botão de execução da análise.

O sistema irá:

1. validar os dados;
2. buscar os valores dos indicadores;
3. verificar municípios com dados completos;
4. montar a matriz de decisão;
5. normalizar os dados;
6. aplicar os pesos;
7. calcular as soluções ideais;
8. calcular as distâncias;
9. calcular o IVSE;
10. gerar o ranking;
11. armazenar os resultados.

---

## 11. Interpretação do IVSE

O IVSE é calculado pelo método TOPSIS.

A escala exibida pela plataforma é:

| IVSE | Classificação |
|---|---|
| 0,00 a 0,19 | Muito baixa |
| 0,20 a 0,39 | Baixa |
| 0,40 a 0,59 | Moderada |
| 0,60 a 0,79 | Alta |
| 0,80 a 1,00 | Muito alta |

A interpretação final depende da configuração metodológica dos critérios utilizados na análise.

---

## 12. Ranking

Ao concluir uma análise, a plataforma gera um ranking dos municípios.

O ranking considera o coeficiente calculado pelo TOPSIS.

Os resultados armazenam:

- IVSE;
- distância para a solução ideal positiva;
- distância para a solução ideal negativa;
- posição no ranking.

---

## 13. Mapa de Vulnerabilidade

A tela **Mapa de Vulnerabilidade** permite visualizar os resultados geograficamente.

Para utilizar:

1. selecione uma análise;
2. aguarde o carregamento dos municípios;
3. clique em um marcador para visualizar os detalhes.

O popup apresenta informações como:

- município;
- código IBGE;
- IVSE;
- posição no ranking;
- classificação de vulnerabilidade.

Os marcadores possuem cores de acordo com a faixa de vulnerabilidade.

---

## 14. Histórico de análises

As análises executadas são armazenadas no sistema.

Isso permite consultar resultados anteriores sem executar novamente o método TOPSIS.

O histórico mantém informações como:

- título;
- ano;
- data de execução;
- critérios;
- pesos;
- municípios;
- ranking;
- IVSE.

---

## 15. Comparação entre municípios

A tela **Comparação** permite comparar municípios de uma mesma análise.

Para utilizar:

1. selecione uma análise;
2. pesquise os municípios desejados;
3. selecione os municípios;
4. consulte os resultados comparativos.

A comparação pode apresentar:

- IVSE;
- posição no ranking;
- classificação;
- distância positiva;
- distância negativa.

---

## 16. Relatórios

A tela **Relatórios** permite gerar um documento em PDF de uma análise existente.

Para gerar:

1. acesse **Relatórios**;
2. selecione uma análise;
3. clique em **Gerar PDF**.

O relatório pode apresentar:

- título da análise;
- ano de referência;
- data de execução;
- total de municípios;
- IVSE médio;
- maior IVSE;
- menor IVSE;
- critérios;
- pesos;
- direção dos critérios;
- ranking;
- código IBGE;
- IVSE;
- distância positiva;
- distância negativa.

---

## 17. Logout

Para encerrar a sessão:

1. localize o botão **Sair** no menu lateral;
2. clique no botão;
3. o sistema retornará à tela de login.

---

## 18. Mensagens e validações

A plataforma apresenta mensagens quando identifica dados inválidos.

Exemplos:

- título não informado;
- ano inválido;
- menos de dois indicadores;
- peso igual ou menor que zero;
- indicador duplicado;
- município inexistente;
- indicador inexistente;
- quantidade insuficiente de municípios;
- dados incompletos;
- critério sem variação;
- arquivo CSV inválido;
- credenciais inválidas;
- acesso sem permissão.

Quando uma mensagem for exibida, corrija os dados informados e tente novamente.

---

## 19. Segurança

A plataforma utiliza autenticação baseada em JWT.

Boas práticas:

- não compartilhe sua senha;
- não compartilhe tokens de autenticação;
- encerre a sessão ao finalizar o uso;
- não armazene credenciais em arquivos públicos;
- administradores devem criar usuários somente com os perfis necessários.

---

## 20. Solução de problemas

### Não consigo entrar no sistema

Verifique:

- e-mail;
- senha;
- se o backend está em execução.

### O sistema não carrega dados

Confirme se:

- a API está disponível;
- o banco de dados está em execução;
- a conexão com o backend aparece como ativa no Dashboard.

### A análise TOPSIS não executa

Verifique:

- ano de referência;
- quantidade de indicadores;
- pesos;
- direção dos critérios;
- quantidade de municípios;
- existência de valores para os indicadores selecionados.

### O CSV foi rejeitado

Confirme se o arquivo contém as colunas:

```text
codigo_ibge
codigo_indicador
valor
ano_referencia
```

### O relatório não é gerado

Confirme se:

- existe uma análise concluída;
- a análise foi selecionada;
- o navegador permite o salvamento do PDF.

---

## 21. Fluxo recomendado de uso

```text
Login
  ↓
Consultar/Cadastrar Indicadores
  ↓
Registrar ou Importar Valores
  ↓
Executar Simulação TOPSIS
  ↓
Consultar Ranking
  ↓
Visualizar Mapa
  ↓
Comparar Municípios
  ↓
Gerar Relatório PDF
```

---

## 22. Considerações finais

A Plataforma IVSE centraliza o cadastro, análise e visualização de indicadores de vulnerabilidade social energética.

O uso correto dos indicadores, pesos e direções dos critérios é essencial para garantir a coerência dos resultados obtidos pelo método TOPSIS.

Este manual deve ser atualizado sempre que novas funcionalidades forem adicionadas à plataforma.
