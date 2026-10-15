# O Que Falta para Garantir a Contratação? (Exceto DDL / Modelagem)

---

## 1. O Veredito Direto
O currículo atual do jogo ensina a **sintaxe correta**, mas os processos seletivos do mercado (especialmente testes práticos para Analista de Dados, BI e Backend) reprovam candidatos em **4 armadilhas clássicas de dados reais**.

Quem aprende apenas em cursos tradicionais costuma achar que, se a query executou sem erro vermelho e devolveu linhas, a resposta está correta. Na vida real, a query pode rodar com sucesso e devolver **números completamente falsos**.

Abaixo estão os 4 tópicos que faltam para blindar o jogador para qualquer teste técnico de contratação.

---

## 2. Os 4 "Pontos Cegos" que Reprovam em Entrevistas

---

### A. A Armadilha da Granularidade e o "Fan-out" em JOINs (O Maior Assassino de Métricas)

* **O Problema no Mercado:**  
  Quando você junta duas tabelas em uma relação $1:N$ (um-para-muitos) e aplica uma função de agregação como `SUM()`, as linhas da tabela da esquerda são duplicadas antes da soma.
  
  *Exemplo Real de Entrevista:*
  > *"Temos uma tabela de `pedidos` e uma de `itens_pedido`. Escreva uma query para somar o valor total dos pedidos por cliente."*
  
  O candidato novato escreve:
  ```sql
  SELECT p.cliente_id, SUM(p.valor_total_pedido)
  FROM pedidos p
  INNER JOIN itens_pedido i ON p.pedido_id = i.pedido_id
  GROUP BY p.cliente_id;
  ```
  **Resultado:** Se um pedido de R$ 100,00 continha 4 itens, a query somou R$ 100,00 quatro vezes, resultando em R$ 400,00. O candidato é reprovado na hora por não verificar a granularidade da tabela resultante.

* **Como Ensinar no Jogo (Caso Investigativo):**
  - **O Mistério:** A Corregedoria desconfia de um desvio de verba no almoxarifado. O jogador cruza `ordens_pagamento` com `itens_entregues`.
  - **A Lição:** Se ele der `SUM(valor_ordem)` direto no `JOIN`, o rombo parece ser de R$ 50 milhões em vez de R$ 10 milhões. O jogador precisa aprender a usar subqueries pré-agregadas ou CTEs para garantir a unicidade antes de somar.

---

### B. O Perigo Mortal do `NULL` e a Lógica Tri-Valorada

No SQL, `NULL` não significa "zero" ou "vazio"; significa **desconhecido**. Isso gera duas pegadinhas clássicas em testes de empresas:

#### 1. A Falha do `NOT IN` com `NULL` (Pegadinha clássica do HackerRank/LeetCode):
Se uma subquery contiver um único valor `NULL`, a cláusula `NOT IN` falha silenciosamente e não retorna nenhuma linha do banco inteiro:
```sql
-- Se houver um suspeito sem CPF (NULL) na tabela, esta query NÃO RETORNA NINGUÉM:
SELECT * FROM suspeitos 
WHERE cpf NOT IN (SELECT cpf_inocentado FROM investigacoes_arquivadas);
```
*A Solução do Profissional:* Usar `NOT EXISTS` ou filtrar `WHERE cpf_inocentado IS NOT NULL`.

#### 2. Tratamento Obrigatório com `COALESCE()`:
Se você somar um salário com uma comissão nula (`salario + comissao`), o resultado do SQL é `NULL`, e não o salário base.
* O jogador precisa dominar:
  ```sql
  SELECT nome, salario + COALESCE(comissao, 0) AS remuneracao_total FROM agentes;
  ```

* **Como Ensinar no Jogo:**
  - O jogador busca suspeitos que "nunca estiveram presos". Ele usa `NOT IN (SELECT detento_cpf FROM presídios)`. A lista vem vazia porque um presidiário foi registrado sem CPF. Ele aprende na prática a usar `NOT EXISTS` ou `COALESCE`.

---

### C. Performance Básica: "SARGability" (Não Derreter o Banco da Empresa)

Em bases pequenas com 100 linhas (como as da delegacia inicial), qualquer query roda em 1 milissegundo. Em bases com 20 milhões de linhas de clientes, uma função no lugar errado força o banco a ler a tabela inteira do disco (*Full Table Scan*).

* **O Erro Comum de Candidatos:**
  ```sql
  -- LENTO / RUIM: Aplica a função em milhões de linhas, ignorando o índice da coluna
  SELECT * FROM transacoes WHERE strftime('%Y', data_transacao) = '2026';
  
  -- RÁPIDO / PROFISSIONAL (SARGable): Permite ao banco buscar direto no índice
  SELECT * FROM transacoes 
  WHERE data_transacao >= '2026-01-01' AND data_transacao < '2027-01-01';
  ```

* **Como Ensinar no Jogo:**
  - No Arco de Assuntos Federais, o jogador precisa consultar a base nacional de radares com 10 milhões de linhas.
  - Se ele usar `strftime('%Y', data) = '2026'`, o terminal exibe: *"Tempo limite excedido: O servidor da PF derrubou sua consulta por alto consumo de memória"*.
  - Ele é obrigado a reescrever a busca usando um intervalo limpo (`BETWEEN` ou `>= AND <`).

---

### D. Agregações Condicionais ("Pivot Manual" com `CASE WHEN`)

Em praticamente toda entrevista para Analista de Dados ou BI, pedem para você criar um resumo gerencial onde valores de linhas viram colunas.

* **Exemplo de Teste de Empresa:**
  > *"Monte uma tabela com o total movimentado por cada agência, separando em colunas o total de PIX, Cartão e Boleto."*

* **A Sintaxe que Garante a Vaga:**
  ```sql
  SELECT 
      agencia_id,
      SUM(CASE WHEN tipo_operacao = 'PIX' THEN valor ELSE 0 END) AS total_pix,
      SUM(CASE WHEN tipo_operacao = 'CARTAO' THEN valor ELSE 0 END) AS total_cartao,
      SUM(CASE WHEN tipo_operacao = 'BOLETO' THEN valor ELSE 0 END) AS total_boleto
  FROM transacoes
  GROUP BY agencia_id;
  ```
Essa técnica (conhecida como *Conditional Aggregation*) é usada diariamente para gerar relatórios e dashboards.

* **Como Ensinar no Jogo:**
  - O delegado exige um relatório comparativo da criminalidade por bairro, separando em colunas distintas: `Qtd Homicídios`, `Qtd Furtos` e `Qtd Tráfico`. O jogador resolve com um único `GROUP BY` e três `SUM(CASE WHEN ...)`.

---

## 3. Matriz de Cobertura de Empregabilidade

Integrando esses 4 conceitos ao currículo que já desenhamos, a matriz de prontidão para o mercado fica completa:

| Habilidade Exigida no Mercado | Está no Jogo? | Como o Jogo Exercita |
| :--- | :---: | :--- |
| **Consultas Básicas e Filtros** | Sim | Módulos 1 e 2 (Casos municipais de trânsito e furto) |
| **Relacionamentos e Cruzamentos (`JOIN`)** | Sim | Módulo 4 e Assuntos Federais |
| **Window Functions (`LAG`, `LEAD`, `ROW_NUMBER`)** | Sim | Rastreamento de rotas e triangulação de antenas |
| **CTEs e Subqueries Complexas** | Sim | Casos de corrupção corporativa e quadrilhas |
| **Tratamento de Nulos (`COALESCE`, `NOT EXISTS`)** | **Novo** | Evita falhas silenciosas em listas de suspeitos |
| **Prevenção de Duplicação (Fan-out / Granularidade)** | **Novo** | Auditoria financeira e cálculo exato de cargas roubadas |
| **Agregação Condicional (Pivot com `CASE`)** | **Novo** | Relatórios gerenciais e inteligência estratégica |
| **Consciência de Performance (SARGability)** | **Novo** | Bloqueios de memória e tempo limite em bases federais |

---

## 4. Conclusão

Adicionar esses 4 tópicos não deixa o jogo mais chato; pelo contrário, transforma o jogo no **melhor simulador de resolução de problemas reais do mercado**.

O jogador que terminar a campanha não apenas saberá sintaxe de SQL: ele terá adquirido o que os recrutadores chamam de **"maturidade de dados"**, que é a capacidade de olhar para um resultado de query e saber imediatamente se aquele número faz sentido ou se foi inflado por um erro de lógica.