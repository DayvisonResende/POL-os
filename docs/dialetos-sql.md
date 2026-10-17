# Do jogo para o mercado: SQLite, PostgreSQL e SQL Server

O jogo roda **SQLite** (versão 3.39, dentro do sql.js). No trabalho, o jogador vai encontrar quase sempre **PostgreSQL** ou **SQL Server**. Este documento diz o que muda, para que o jogo ensine do jeito que serve nos três e mostre a diferença onde ela existe.

Usado em: **dicas de mercado nas anotações da Célia** (os `.txt` de cada treinamento) e na **prova final** (ver `SISP_contexto_para_IA.md`, Prioridade 7).

---

## 1. O que é igual nos três

Tudo o que o currículo ensina como conceito roda igual: `SELECT`, `FROM`, `WHERE`, `DISTINCT`, `ORDER BY`, `AND`/`OR`/`NOT`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`, `COUNT`/`SUM`/`AVG`/`MIN`/`MAX`, `GROUP BY`, `HAVING`, `INNER`/`LEFT JOIN`, `CASE WHEN`, `COALESCE`, subconsultas, `WITH` (CTE), `UNION` e funções de janela (`ROW_NUMBER`, `RANK`, `LAG`, `LEAD`). Todos foram conferidos no SQLite do jogo.

O que muda é o acabamento: limite de linhas, datas, concatenação e tipos.

## 2. O que muda

| Para quê | No jogo (SQLite) | PostgreSQL | SQL Server |
|---|---|---|---|
| Limitar linhas | `… LIMIT 10` | `… LIMIT 10` | `SELECT TOP (10) …` |
| Pular linhas (paginar) | `LIMIT 10 OFFSET 20` | `LIMIT 10 OFFSET 20` | `ORDER BY … OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY` |
| Data e hora de agora | `datetime('now')` (em UTC) | `NOW()` | `GETDATE()` |
| Ano de uma data | `strftime('%Y', d)` (devolve texto) | `EXTRACT(YEAR FROM d)` | `YEAR(d)` |
| Somar 7 dias | `date(d, '+7 days')` | `d + INTERVAL '7 days'` | `DATEADD(day, 7, d)` |
| Dias entre duas datas | `julianday(b) - julianday(a)` | `b::date - a::date` | `DATEDIFF(day, a, b)` |
| Juntar textos | `a \|\| b` | `a \|\| b` ou `CONCAT(a, b)` | `CONCAT(a, b)` ou `a + b` |
| Juntar textos de um grupo | `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` | `STRING_AGG(col, ', ')` |
| Trocar o vazio | `COALESCE` ou `IFNULL` | `COALESCE` | `COALESCE` ou `ISNULL` |
| Converter tipo | `CAST(x AS INTEGER)` | `CAST(x AS INTEGER)` ou `x::int` | `CAST(x AS INT)` ou `CONVERT` |
| Nome de coluna com espaço | `"nome da coluna"` | `"nome da coluna"` | `[nome da coluna]` |

Regra do jogo: **quando existe a forma padrão (ANSI), o jogo ensina ela** (`CAST`, `COALESCE`, `CASE WHEN`). A forma própria de cada banco aparece só como dica.

## 3. Três diferenças que pegam de surpresa

**Datas são texto no SQLite.** No jogo, `data_hora` é texto no formato `AAAA-MM-DD HH:MM:SS`, e por isso `BETWEEN '2026-10-13 00:00:00' AND '2026-10-13 23:59:59'` funciona. No PostgreSQL e no SQL Server a coluna é de data de verdade, e o mesmo filtro funciona, mas pode perder registros com fração de segundo depois de `23:59:59`. O hábito que serve nos três: `data_hora >= '2026-10-13' AND data_hora < '2026-10-14'`.

**Tipos.** O SQLite é tolerante: numa coluna numérica, `ano = '2022'` funciona. Mas comparar valores soltos não converte: `SELECT 10 = '10'` dá **falso**, sem erro nenhum. O PostgreSQL é rígido e reclama de comparar tipos diferentes; o SQL Server converte em alguns casos e dá erro em outros. Moral: número sem aspas, texto com aspas, nos três.

**Maiúsculas, minúsculas e acentos no `LIKE`.** No SQLite, o `LIKE` ignora maiúsculas só nas letras **sem acento**: `'Silva' LIKE '%silva%'` é verdadeiro, mas `'ÉDSON' LIKE '%édson%'` é falso. O PostgreSQL diferencia sempre (use `ILIKE` ou `LOWER(nome) LIKE …`). No SQL Server depende da configuração do banco; nas instalações brasileiras, quase sempre ignora maiúsculas e acentos.

E uma que o jogo já trata: **aspas duplas são para nomes de coluna**, não para texto. O SQLite, quando não acha a coluna, aceita `"prata"` como texto e segue em frente; o PostgreSQL dá erro. O diagnóstico do jogo já avisa (`avisoSQL`).

## 4. Dicas de mercado por módulo

No fim das anotações da Célia, num bloco "FORA DAQUI (no trabalho)", só quando o módulo tiver diferença. Feito nos Módulos 1 e 2. Fica fora da fala da Célia e das tarefas, para não encher o iniciante de informação antes da hora.

| Módulo | Dica |
|---|---|
| 1 | `LIMIT 10` no SQL Server é `SELECT TOP (10) …`, no começo da consulta. |
| 2 | `LIKE` no PostgreSQL diferencia maiúscula; lá se usa `ILIKE`. Dia inteiro: `>= 'dia' AND < 'dia seguinte'`. |
| 3 | Nada muda: `COUNT`, `SUM`, `GROUP BY`, `HAVING` e `COALESCE` são iguais nos três. Sem dica. |
| 4 | `JOIN` igual nos três. |
| 5 | Transação: `BEGIN` no SQLite e no PostgreSQL; `BEGIN TRANSACTION` no SQL Server. |
| 6 | Funções de texto e data são o que mais muda; consulte a tabela da seção 2. `GROUP_CONCAT` vira `STRING_AGG`. |
