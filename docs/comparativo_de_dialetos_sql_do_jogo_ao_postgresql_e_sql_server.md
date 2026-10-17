# Comparativo de Dialetos SQL & Guia de Empregabilidade: Do Jogo ao PostgreSQL e SQL Server

---

## 1. O Veredito de Transferibilidade e Empregabilidade

**A taxa de aproveitamento prático do jogador será de 85% a 90%.**

O jogador **não** terá que reaprender SQL para trabalhar com **PostgreSQL** ou **Microsoft SQL Server (T-SQL)**. A razão é direta: o jogo ensina a **lógica relacional declarativa e o padrão ANSI SQL**, que constitui o núcleo universal compartilhado por todos os sistemas modernos de banco de dados.

A transição entre SQLite, Postgres e SQL Server é análoga a trocar de veículo: os comandos fundamentais (volante, acelerador, freio e leis de trânsito) são rigorosamente idênticos. O que muda são particularidades de acabamento e botões proprietários (os chamados "dialetos").

Além da sintaxe, este documento integra as **armadilhas reais de contratação** (granularidade, lógica tri-valorada, SARGability e relatórios matriciais), demonstrando como cada sistema se comporta e como o jogo prepara o candidato para testes técnicos corporativos.

---

## 2. O Núcleo Universal (100% Idêntico em Todos os Bancos)

Toda a fundação lógica que o jogador exercita durante as investigações roda sem alterar uma única linha de código no PostgreSQL e no SQL Server:

* **Estrutura Declarativa Base:** `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `DISTINCT`.
* **Filtros e Operadores Lógicos:** `AND`, `OR`, `NOT`, `IN (...)`, `BETWEEN`, `IS NULL`, `IS NOT NULL`.
* **Junções Relacionais:** `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`.
* **Agregações Numéricas:** `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`, `GROUP BY`, `HAVING`.
* **Condicionais Universais:** `CASE WHEN ... THEN ... ELSE ... END`.
* **Consultas Estruturadas:** Subqueries correlacionadas e CTEs (`WITH ... AS (...)`).
* **Funções de Janela Analíticas:** `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD() OVER (PARTITION BY ... ORDER BY ...)`.

---

## 3. As Diferenças Práticas de Dialeto (Os Pontos de Atrito)

As variações entre **SQLite (Motor do Jogo)**, **PostgreSQL** e **Microsoft SQL Server** concentram-se em convenções sintáticas específicas:

---

### A. Limitação e Paginação de Registros (`LIMIT` vs. `TOP` vs. `OFFSET-FETCH`)

Em testes práticos e na rotina de relatórios, limitar linhas é mandatório:

| Sistema | Sintaxe Prática | Padrão ANSI Moderno |
| :--- | :--- | :--- |
| **No Jogo (SQLite)** | `SELECT * FROM veiculos ORDER BY data DESC LIMIT 10;` | `LIMIT 10` |
| **PostgreSQL** | `SELECT * FROM veiculos ORDER BY data DESC LIMIT 10;` | `FETCH FIRST 10 ROWS ONLY;` |
| **SQL Server (T-SQL)** | `SELECT TOP 10 * FROM veiculos ORDER BY data DESC;` | `OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;` |

*Impacto no Jogador:* O SQL Server coloca a limitação no início da declaração (`SELECT TOP n`), enquanto SQLite e Postgres aceitam a palavra-chave no final (`LIMIT n`). Ambos suportam a paginação ANSI padrão via `OFFSET / FETCH`.

---

### B. Funções de Data, Intervalos e Manipulação Temporal

O tratamento de datas é o ponto onde os fabricantes historicamente mais se distanciaram:

| Operação | No Jogo (SQLite) | PostgreSQL | SQL Server (T-SQL) |
| :--- | :--- | :--- | :--- |
| **Data/Hora Atual** | `datetime('now')` | `NOW()` ou `CURRENT_TIMESTAMP` | `GETDATE()` ou `SYSDATETIME()` |
| **Diferença de Dias** | `julianday(d2) - julianday(d1)` | `(d2::date - d1::date)` ou `AGE(d2, d1)` | `DATEDIFF(day, d1, d2)` |
| **Adicionar 7 Dias** | `datetime(d, '+7 days')` | `d + INTERVAL '7 days'` | `DATEADD(day, 7, d)` |
| **Extrair o Ano** | `strftime('%Y', data)` | `EXTRACT(YEAR FROM data)` | `YEAR(data)` ou `DATEPART(year, data)` |
| **Início do Mês** | `date(data, 'start of month')` | `DATE_TRUNC('month', data)` | `DATETRUNC(month, data)` |

*Impacto no Jogador:* A lógica pericial de filtrar uma "janela de 48 horas" ou "reconstituir itinerários" é a mesma. No mercado, o profissional apenas consulta a assinatura da função temporal nativa do banco corporativo.

---

### C. Rigidez de Tipos e Conversão Explícita (`Type Casting`)

* **No Jogo (SQLite):** Sistema de tipagem flexível (*Dynamic Typeless*). Se você comparar o número `10` com o texto `'10'`, o banco faz a coerção automática sem erro.
* **No PostgreSQL:** Altamente estrito. Rejeita comparações entre tipos incompatíveis e exige conversão explícita:
  ```sql
  -- Sintaxe Padrão ANSI ou Abreviação Nativa Postgres (::):
  SELECT CAST(codigo AS INT) FROM registros;
  SELECT codigo::INTEGER FROM registros;
  ```
* **No SQL Server (T-SQL):** Também estrito, suportando a função proprietária `CONVERT` com formatações de data:
  ```sql
  SELECT CAST(codigo AS INT) FROM registros;
  SELECT CONVERT(VARCHAR(10), data_registro, 103) FROM registros; -- Padrão dd/mm/yyyy
  ```

---

### D. Concatenação de Texto e Sensibilidade a Caixa (Case Sensitivity)

* **Concatenação:**
  - *SQLite & PostgreSQL:* Padrão ANSI com barras duplas `||`:
    ```sql
    SELECT primeiro_nome || ' ' || sobrenome AS nome_completo FROM agentes;
    ```
  - *SQL Server:* Tradicionalmente usa o sinal de mais `+` ou a função segura `CONCAT()`:
    ```sql
    SELECT CONCAT(primeiro_nome, ' ', sobrenome) AS nome_completo FROM agentes;
    ```
* **Busca Case-Insensitive (Ignorar Maiúsculas/Minúsculas):**
  - *SQLite:* O operador `LIKE` já é *case-insensitive* por padrão para caracteres ASCII.
  - *PostgreSQL:* Diferencia rigorosamente maiúsculas/minúsculas no `LIKE`. Exige o operador nativo `ILIKE` ou normalização:
    ```sql
    SELECT * FROM suspeitos WHERE nome ILIKE '%silva%';
    -- ou padrão ANSI: WHERE LOWER(nome) LIKE '%silva%'
    ```
  - *SQL Server:* É configurado via *Collation* da base (geralmente `Latin1_General_CI_AS`, onde `CI` significa *Case Insensitive*). Logo, o `LIKE` padrão não diferencia maiúsculas de minúsculas na maioria das instalações corporativas brasileiras.

---

## 4. Os 4 Pontos Cegos de Contratação Aplicados a Cada Banco

Em processos seletivos de nível Júnior/Pleno para Dados, BI ou Backend, os candidatos não são reprovados por esquecer um comando, mas por **cair em armadilhas de lógica relacional**. Abaixo está o comportamento de cada banco diante desses desafios:

---

### A. Granularidade e o Efeito "Fan-out" em JOINs ($1:N$)

* **O Problema Universal:**  
  Quando cruzamos uma tabela de cabeçalho (ex: `ocorrencias`) com uma de múltiplos itens (ex: `itens_apreendidos`), cada item gera uma nova linha antes de aplicar o `SUM()`. O valor total da ocorrência é multiplicado pelo número de itens vinculados.

* **Exemplo de Teste de Empresa:**
  > *"Calcule o valor total roubado por delegacia regional."*

* **Como Resolver nos Dialetos:**
  A solução mais segura e legível tanto no PostgreSQL quanto no SQL Server é isolar a agregação prévia usando uma CTE (`WITH`):

  ```sql
  -- Funciona identicamente em SQLite, PostgreSQL e SQL Server:
  WITH totais_por_ocorrencia AS (
      SELECT ocorrencia_id, SUM(valor_estimado) AS total_itens
      FROM itens_apreendidos
      GROUP BY ocorrencia_id
  )
  SELECT 
      o.delegacia_id,
      SUM(t.total_itens) AS montante_total_regional
  FROM ocorrencias o
  INNER JOIN totais_por_ocorrencia t ON o.id = t.ocorrencia_id
  GROUP BY o.delegacia_id;
  ```

---

### B. A Falha do `NOT IN` com `NULL` e a Lógica Tri-Valorada

O SQL adota a lógica tri-valorada: `TRUE`, `FALSE` e `UNKNOWN` (`NULL`).

* **A Pegadinha de Processo Seletivo:**
  Se você buscar registros que não estão em uma lista que contém um único valor nulo, a comparação resulta em `UNKNOWN` e a query retorna **zero linhas**:
  ```sql
  -- Se houver UM detento sem CPF (NULL) na tabela de liberados, esta query NÃO RETORNA NINGUÉM:
  SELECT * FROM suspeitos 
  WHERE cpf NOT IN (SELECT cpf FROM detentos_liberados);
  ```

* **Tratamento Específico nos Dialetos:**
  1. **Solução Universal Recomendada:** Substituir por `NOT EXISTS`, que lida com nulos de forma segura em todos os motores:
     ```sql
     SELECT s.* FROM suspeitos s
     WHERE NOT EXISTS (
         SELECT 1 FROM detentos_liberados d WHERE d.cpf = s.cpf
     );
     ```
  2. **Tratamento de Nulos com Funções:**
     - *SQLite:* `COALESCE(coluna, valor_padrao)` ou `IFNULL(coluna, 0)`.
     - *PostgreSQL:* `COALESCE(coluna, valor_padrao)` ou `NULLIF(a, b)`.
     - *SQL Server:* `COALESCE(coluna, valor_padrao)` ou a proprietária `ISNULL(coluna, 0)`.

---

### C. Performance e SARGability (Uso Eficiente de Índices)

Em bases grandes de produção, escrever uma query que não aproveita os índices da tabela (*Non-SARGable*) derruba o servidor da empresa ao forçar um *Full Table Scan* ou *Index Scan*.

* **O Erro Clássico de Candidatos:** Aplicar funções sobre a coluna indexada na cláusula `WHERE`:
  ```sql
  -- RUIM (Ignora o índice da data em todos os bancos):
  -- PostgreSQL:
  SELECT * FROM logs WHERE EXTRACT(YEAR FROM data_hora) = 2026;
  -- SQL Server:
  SELECT * FROM logs WHERE YEAR(data_hora) = 2026;
  ```

* **A Escrita Profissional (SARGable):** Deixar a coluna limpa e aplicar a lógica sobre os valores escalares constantes:
  ```sql
  -- EXCELENTE (Permite Index Seek / Busca Direta no Índice B-Tree):
  -- Funciona em SQLite, Postgres e SQL Server:
  SELECT * FROM logs 
  WHERE data_hora >= '2026-01-01 00:00:00' 
    AND data_hora <  '2027-01-01 00:00:00';
  ```

---

### D. Agregação Condicional vs. Comandos Proprietários de Pivot

Em testes corporativos de BI e Engenharia de Dados, frequentemente se exige transformar linhas em colunas (resumos gerenciais matriciais).

* **A Solução Universal com `CASE WHEN` (Recomendada no Jogo):**
  Roda exatamente igual no SQLite, PostgreSQL e SQL Server:
  ```sql
  SELECT 
      departamento_id,
      COUNT(CASE WHEN gravidade = 'BAIXA'  THEN 1 END) AS chamados_leves,
      COUNT(CASE WHEN gravidade = 'MEDIA'  THEN 1 END) AS chamados_medios,
      COUNT(CASE WHEN gravidade = 'GRAVE'  THEN 1 END) AS chamados_graves
  FROM ocorrencias
  GROUP BY departamento_id;
  ```

* **Diferença Proprietária nos Dialetos Avançados:**
  - *No PostgreSQL:* Possui a cláusula ANSI moderna `FILTER (WHERE ...)`:
    ```sql
    SELECT 
        departamento_id,
        COUNT(*) FILTER (WHERE gravidade = 'GRAVE') AS chamados_graves
    FROM ocorrencias
    GROUP BY departamento_id;
    ```
  - *No SQL Server:* Possui o operador específico `PIVOT`:
    ```sql
    SELECT departamento_id, [BAIXA], [MEDIA], [GRAVE]
    FROM (SELECT departamento_id, gravidade, id FROM ocorrencias) AS Fonte
    PIVOT (COUNT(id) FOR gravidade IN ([BAIXA], [MEDIA], [GRAVE])) AS TabelaPivot;
    ```

---

## 5. Tabela Comparativa Rápida (Cheat Sheet de Mercado)

| Recurso | No Jogo (SQLite) | PostgreSQL | SQL Server (T-SQL) |
| :--- | :--- | :--- | :--- |
| **Limitar Resultados** | `LIMIT n` | `LIMIT n` ou `FETCH FIRST` | `TOP (n)` ou `FETCH NEXT` |
| **Data Atual** | `datetime('now')` | `NOW()` ou `CURRENT_TIMESTAMP` | `GETDATE()` |
| **Diferença de Dias** | `julianday(b) - julianday(a)` | `b::date - a::date` | `DATEDIFF(day, a, b)` |
| **Truncar Mês** | `strftime('%Y-%m-01', data)` | `DATE_TRUNC('month', data)` | `DATETRUNC(month, data)` |
| **Conversão de Tipo** | `CAST(x AS INT)` | `x::INT` ou `CAST(x AS INT)` | `CAST(x AS INT)` ou `CONVERT` |
| **Concatenação** | `a \|\| b` | `a \|\| b` ou `CONCAT(a, b)` | `CONCAT(a, b)` ou `a + b` |
| **Case Insensitive** | `LIKE` nativo (ASCII) | `ILIKE` ou `LOWER(a) LIKE` | `LIKE` nativo (Collation CI) |
| **Tratar Nulo** | `COALESCE` ou `IFNULL` | `COALESCE` | `COALESCE` ou `ISNULL` |
| **Função de Janela** | `OVER (PARTITION BY ...)` | `OVER (PARTITION BY ...)` | `OVER (PARTITION BY ...)` |
| **Agregação em Texto** | `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` | `STRING_AGG(col, ', ')` |

---

## 6. Estratégia Didática no Design do Jogo

Para transformar o jogador em um candidato disputado no mercado de trabalho, aplicamos três regras de ouro no design das missões:

1. **Priorizar Sempre o Padrão ANSI Neutro:**
   - Ensinar `CAST()` em vez de operadores proprietários.
   - Ensinar `CASE WHEN` para pivotamento (garante compatibilidade universal).
   - Ensinar `NOT EXISTS` em vez de arriscar falhas silenciosas com `NOT IN (NULL)`.
2. **Dicas Técnicas Periciais no Terminal:**
   - Ao ensinar comandos de limite no Módulo 1, o terminal exibe uma nota lateral:
     > *"Dica de Mercado: No Microsoft SQL Server, este mesmo comando é executado no início da query com a instrução `TOP (n)`."*
3. **Simulação de Ambientes Federados:**
   - Nas fases de Assuntos Federais, o jogador invade bases que simulam dialetos corporativos, aprendendo a lidar com funções de data rigorosas e exigências de tipagem estrita.