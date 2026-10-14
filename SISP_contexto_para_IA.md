# SISP — Documento de Continuidade para IA (v3.0)

> **Para a IA que vai continuar este projeto:** leia este arquivo inteiro antes de mexer no código. Ele descreve o que o jogo é, por que ele é assim, o que já existe no arquivo `sisp.html`, como o código está organizado, quais decisões já foram tomadas (e por quê) e o que falta fazer. A autora do projeto é a May, que fala português, é detalhista e quer **entender** as decisões, não só recebê-las. Dê opinião honesta quando ela pedir, mesmo discordando.

---

## 1. O que é o SISP

**SISP: Terminal de Inteligência Policial** é um jogo de mistério policial que ensina SQL do zero absoluto até o nível intermediário-avançado. O jogador é um recruta do DTI (Departamento de Tecnologia da Informação) da Polícia Civil e trabalha num computador simulado, o **Pol-OS**. Para resolver crimes, ele precisa consultar bancos de dados reais com SQL.

### Função do jogo (o porquê)
- **Ensinar SQL para quem nunca programou**, sem exigir conhecimento prévio.
- Fazer o jogador sair do jogo capaz de usar SQL no trabalho real (análise de dados, BI, operações, suporte).
- Ensinar **raciocínio dedutivo com dados**: transformar pistas vagas em filtros precisos.
- O SQL não é um enfeite do jogo: **é a mecânica principal**. Sem a consulta certa, o caso não fecha.

### Público principal
Pessoas **sem nenhuma experiência em programação**. Essa é a decisão mais importante do projeto: toda nova fase deve ser testada mentalmente com a pergunta "alguém que nunca viu código entenderia isso?".

### Inspirações
Hypnospace Outlaw, Hacknet, Her Story, Papers, Please, SQL Murder Mystery.

---

## 2. Pilares de design (não quebrar)

1. **Desktop diegético.** Não existem menus abstratos de "fase" ou "pausa". Tudo é aplicativo, janela, arquivo, notificação ou mensagem de chat dentro do Pol-OS.
2. **SQL como mecânica de dedução.** O jogador cruza depoimentos, radares, cadastros e escutas com consultas.
3. **Validar o resultado, nunca o texto da consulta.** Jamais usar regex para checar se o jogador escreveu a query "certa". Executa-se a consulta e confere-se o **conjunto de resultados** (colunas, número de linhas, valores presentes). Assim qualquer abordagem válida é aceita.
4. **O caso só fecha pelo desfecho formal** (mandado ou relatório). As tarefas que se marcam sozinhas são apenas orientação. Isso impede trapaças como `SELECT *` sem filtro.
5. **Andaime que diminui aos poucos (scaffolding).** Cada conceito novo passa por uma escada: ver → prever → trocar uma peça → montar com blocos → completar um molde → escrever do zero. O apoio diminui conforme o jogador avança.
6. **O jogador sempre sabe qual é a próxima ação**, mesmo quando ainda não sabe a resposta.
7. **Foco em DQL e DML.** Sem `CREATE TABLE` nem teoria de normalização. O jogador é analista, não arquiteto de banco.
8. **Arquivo único, 100% no navegador.** HTML + CSS + JS num só arquivo, banco SQLite em memória via `sql.js`. Custo de infraestrutura zero.
9. **Tom:** repartição pública brasileira, burocrática e sarcástica, com colegas estressados e medo constante da Corregedoria.

---

## 3. Estado atual (o que já está pronto)

Arquivo: **`sisp.html`** (anexado junto deste documento). Também publicado como artifact no Claude.

### Fluxo completo jogável hoje
1. **Login** no Pol-OS (tela de boot; o banco carrega enquanto isso).
2. **Treinamento guiado (BO 1001, Módulo 1)** com a Célia, em 14 passos, num painel ao lado do terminal. No começo só existe o DB-Investigator na área de trabalho.
3. Fim do treinamento: são liberados o **SISP Ocorrências** e o **PolíciaZap**. O jogador entrega o relatório do BO 1001 (quantas cores distintas existem).
4. É liberada a **ACADEPOL** (prova). Aprovado, o jogador é **promovido a Estagiário do Arquivo**, o que libera os **Arquivos** e o **BO 1002**.
5. **BO 1002 (furto no shopping):** WHERE, AND, LIKE. Desfecho por mandado de busca.
6. **BO 1003 (assalto na Castelo Branco):** BETWEEN, IN, comparações e o primeiro contato com chave estrangeira (em três consultas, sem JOIN). Desfecho por mandado de prisão (placa + nome).
7. Durante o BO 1003 chega a **side quest do Beto** (consultar a catraca e depois o pedido de fraude de ponto).
8. **Prova do Módulo 2** → promoção a **Investigador Júnior** → relatório de produtividade do turno.

### Funcionalidades prontas
- Gerenciador de janelas (arrastar, minimizar, maximizar, fechar, z-index, barra de tarefas). No celular (≤760px) as janelas ocupam a tela inteira.
- **DB-Investigator:** editor com realce de sintaxe, Ctrl+Enter, grade de resultados, Dicionário de Dados clicável (insere nomes no editor), botão **Explique esta consulta** (traduz a query para português, parte por parte) e fotos de radar clicáveis na grade.
- **Tradução de erros do SQLite** para português, com sugestões (ex.: `FORM` → "você quis dizer FROM?").
- **Dicas para resultado vazio** (ex.: `'Prata'` com maiúscula, data sem hora, placa com traço, LIKE sem `%`).
- **Banco somente leitura** para o perfil atual: UPDATE, DELETE etc. são bloqueados e geram +5% de Corregedoria na primeira tentativa.
- **SISP Ocorrências:** lista de BOs, relato, tarefas com dicas em 2 níveis, Manual do Recruta por caso, formulário de desfecho.
- **PolíciaZap:** chat com Célia e Beto, notificações, respostas por texto e por múltipla escolha.
- **Arquivos:** Snippets (.sql abrem no terminal) e Evidências (.txt e .jpg).
- **Foto de radar** desenhada em canvas a partir dos dados da leitura (placa, velocidade, horário, cor do carro).
- **Medidores** de Metas e Corregedoria, e um relógio de "treino" que não pune.
- **Demissão** (tela vermelha) quando a Corregedoria chega a 100%.
- **Progresso salvo** no `localStorage`.
- **Seta "clica aqui"** que aponta para o botão que o jogador precisa usar no tutorial.

---

## 4. Arquitetura do código (`sisp.html`)

### 4.1 Dependências externas
- `sql.js` **1.8.0, build `sql-asm.js`** via cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-asm.js`
  - **Por que a versão asm e não wasm:** o ambiente de artifact do Claude bloqueia `fetch` de arquivos `.wasm` (CSP). A versão asm é JavaScript puro e não precisa buscar nada. Se o jogo for hospedado em outro lugar, dá para trocar por `sql-wasm.js` (mais rápido).
  - SQLite dessa versão suporta window functions (`ROW_NUMBER`, `LAG`, `LEAD`), CTEs e transações. Os Módulos 3 a 6 funcionam sem trocar a biblioteca.
- Google Fonts: Barlow Condensed (títulos), Barlow Semi Condensed (interface), JetBrains Mono (código). Há fontes de fallback declaradas.

### 4.2 Estrutura do arquivo (de cima para baixo)
1. `<style>`: tokens de cor e fonte no `:root` (tema único, escolhido de propósito: é a tela de um PC de repartição), depois os estilos de boot, desktop, janelas, barra de tarefas, apps, guia do tutorial, ACADEPOL e regras de mobile.
2. HTML: `#boot` (login), `#desk` (ícones, janelas, toasts), `#taskbar`, `#startMenu`, `#ptr` (seta do tutorial).
3. `<script>` do sql.js.
4. `<script>` principal, dividido em duas zonas:
   - **`/*CORE-START*/ … /*CORE-END*/`:** lógica **pura, sem DOM**. Pode ser extraída e testada no Node. Contém geração do banco, fatos, casos, tradução de erros, dicas de resultado vazio, checagem de somente leitura e o explicador de SQL.
   - **UI:** tudo que mexe na tela.

### 4.3 Funções e objetos principais

| Nome | Zona | O que faz |
|---|---|---|
| `mulberry32(seed)` | core | PRNG determinístico. A seed `1042` garante o mesmo banco para todos os jogadores. |
| `buildSeedSQL()` | core | Gera o SQL de criação e povoamento do banco. |
| `computeFacts(db)` / `F` | core | Calcula fatos do banco usados nas validações (total de veículos, cores distintas, placas prata etc.). **As validações usam `F`, nunca números fixos.** |
| `toR(res)` | core | Converte o resultado do sql.js em `R = {cols: [minúsculas], rows, n}`. |
| `has(R, …)`, `hasAll(R, lista)` | core | Verificam se valores aparecem em alguma célula do resultado (sem diferenciar maiúsculas). |
| `CASES` | core | Lista dos BOs (ver 4.5). |
| `translateError(msg, sql, schema)` | core | Traduz erros do SQLite para português, com sugestão por distância de edição. |
| `kwTypo`, `lev`, `closest` | core | Detectam erro de digitação em palavras-chave (distância com transposição). |
| `zeroRowHint(sql)` | core | Dica quando a consulta roda mas volta vazia. |
| `isReadOnly(sql)` | core | Bloqueia comandos que escrevem no banco. |
| `explainSQL(sql)` | core | Gera a tradução parte por parte usada no botão Explique. |
| `openWin(id, {title,w,h,x,y,build,refresh})` | UI | Cria ou foca uma janela. `build(rec)` recebe `rec.body`. |
| `runQuery()` | UI | Executa a consulta do editor: checa somente leitura → `tutBeforeRun` → executa → traduz erro ou mostra a grade → `checkSteps` → `tutOnRun`. |
| `checkSteps(res)` | UI | Marca as tarefas do caso ativo pelo resultado. |
| `closeCase(i, msg)` | UI | Encerra um caso, avança o relógio, dá metas e dispara as mensagens da Célia. |
| `say(who, html, me)` | UI | Mensagem no chat (`'celia'` ou `'beto'`), com toast e contador de não lidas. |
| `addCorr(n, motivo)`, `addMetas(n)` | UI | Alteram os medidores. |
| `unlockApp(id, label)` | UI | Libera um app na área de trabalho. |
| `TUT`, `tutEnter`, `tutOnRun`, `renderGuide` | UI | Motor do treinamento guiado (ver seção 6). |
| `spot(seletor, rotulo)` | UI | Faz um elemento piscar e, se houver rótulo, mostra a seta "clica aqui". |
| `RANKS`, `PROVAS`, `provaMod`, `newProva`, `gradeProva`, `promote` | UI | Patentes e prova (ver seção 7). |
| `report()`, `fired()` | UI | Relatório do turno e tela de demissão. |

### 4.4 Estado salvo (`S`, chave `localStorage` = `sisp-proto-v2`)
```
caseSel, steps{caseId:[índices]}, closed[ids], metas, corr, clock (minutos),
chat{celia[], beto[]}, unread{}, beto ('none'|'asked'|'wrong'|'favor'|'done'),
writeWarned, queries, errors, editor, hintsSeen{}, fired, done, verdict{},
tut, tutPhase ('doing'|'after'), tutPick, tutPred, tutWrong[], tutBlocks[], tutHint,
tutFb, tutMiss, tutErr, tutBlk, apps[], rank, prova{mod,qs,ord,ans,sql,graded}, provaTries{}
```
`load()` mescla o estado salvo com `freshState()`, então **campos novos ganham valor padrão sozinhos**. Se uma mudança **quebrar** a compatibilidade (mudar o significado de um campo), troque a chave `SAVE_KEY` (ex.: `sisp-proto-v3`).

### 4.5 Formato de um caso (`CASES`)
```js
{
  id:'1002', titulo:'…', modulo:2, natureza:'…', quando:'12/10/2026 19:20', local:'…', solicitante:'…',
  relato:'HTML com o BO e os depoimentos',
  steps:[ { t:'texto da tarefa (HTML)', h:['dica conceitual','dica quase-resposta'], ok:function(R){ return … } } ],
  final:{ tipo:'mandado'|'resposta', titulo:'…', campos:[{id:'placa',label:'…'}],
          check:function(v){ return {ok:true,msg:'…'} ou {ok:false,pen:20,msg:'motivo do indeferimento'} } },
  manual:'HTML do Manual do Recruta deste caso'
}
```
- **`steps[].ok(R)`** valida pelo resultado, nunca pelo texto.
- **`final.check`** precisa explicar o motivo de cada resposta errada plausível, especialmente os falsos positivos planejados ("Corolla é sedã, as testemunhas viram uma caminhonete").
- Desbloqueio: `caseUnlocked(i)` (caso anterior fechado + patente mínima).
- Arquivos de cada caso: `FILES[]` com `from: índice do caso` em que o arquivo aparece.

---

## 5. Banco de dados atual

```sql
CREATE TABLE pessoas (cpf TEXT PRIMARY KEY, nome TEXT NOT NULL, data_nascimento DATE, cidade TEXT);
CREATE TABLE veiculos (placa TEXT PRIMARY KEY, modelo TEXT NOT NULL, cor TEXT NOT NULL, ano INTEGER,
                       cpf_proprietario TEXT NOT NULL REFERENCES pessoas(cpf));
CREATE TABLE leituras_radar (id INTEGER PRIMARY KEY AUTOINCREMENT, placa TEXT NOT NULL REFERENCES veiculos(placa),
                       local_radar TEXT NOT NULL, data_hora DATETIME NOT NULL, velocidade_kmh INTEGER NOT NULL,
                       foto_radar_url TEXT NOT NULL);
CREATE TABLE catraca_acessos (id INTEGER PRIMARY KEY AUTOINCREMENT, funcionario TEXT NOT NULL, cargo TEXT NOT NULL,
                       data DATE NOT NULL, horario_entrada TEXT NOT NULL, horario_saida TEXT NOT NULL);
```
**Mudança em relação ao documento original v2.1:** `veiculos` deixou de ter `proprietario_nome`. Agora aponta para `pessoas` por `cpf_proprietario`. Motivo: com o nome dentro de `veiculos`, o JOIN do Módulo 4 seria opcional e o jogador não entenderia por que ele existe.

### Convenções dos dados (o jogo depende delas)
- **Cores em minúsculas:** preto, prata, branco, vermelho, cinza, azul.
- **Placas no padrão Mercosul, sem traço** (ex.: `KZX9B21`).
- **Datas** como texto `AAAA-MM-DD HH:MM:SS`, para que BETWEEN funcione por ordem alfabética.
- Locais dos radares: `Rod. Castelo Branco - Km 18`, `Rod. Raposo Tavares - Km 92`, `Av. Dom Aguirre`, `Av. São Paulo`.
- "Hoje" no jogo é terça, **13/10/2026**. "Ontem" é 12/10.
- Todos os nomes, placas e CPFs são fictícios e gerados.

### Registros plantados (o enredo depende deles)
| Placa | Veículo | Dono | Papel |
|---|---|---|---|
| FTR7A93 | Virtus prata | Denise Albuquerque Prado | **alvo do BO 1002** |
| FTR2C41 / FTR1D08 / FTR9B50 | Onix branco / Corolla preto / Kwid vermelho | — | falsos positivos do BO 1002 |
| KZX9B21 | Hilux preta, 154 km/h, Km 18, 22:58:14 | **Valdemar Silveira** (CPF 318.442.907-15) | **alvo do BO 1003** |
| JKL4A12 | Corolla preto, 128 km/h, 22:51 | — | falso positivo (sedã) |
| RTA8K02 | S10 prata, 139 km/h, 23:09 | — | falso positivo (cor) |
| MNP3F77 | Hilux preta, 97 km/h, 23:05 | — | falso positivo (lenta) |
| LMB6G55 | Hilux preta, 141 km/h, 21:32 | — | falso positivo (horário) |
| HBD2D44 | HB20 preto, Av. Dom Aguirre | — | falso positivo (local) |

- **Catraca:** Roberto "Beto" Silva saiu às **16:40:12** em 12/10 (resposta da side quest). Existe uma "Roberta Silva Lima" de propósito, para confundir buscas com LIKE.
- **Regra do gerador:** radares aleatórios no Km 18 entre 22:40 e 23:20 de 12/10 ficam com no máximo 115 km/h, para não criar suspeitos acidentais. **Ao adicionar dados aleatórios, garanta que eles não quebram nenhum enigma.**
- **Atenção:** mudar a ordem das chamadas ao PRNG em `buildSeedSQL` muda todos os dados aleatórios. As validações por `F` se adaptam, mas textos que citam números (ex.: "48 veículos") podem ficar errados. Prefira acrescentar novos dados **depois** dos existentes.

---

## 6. O treinamento guiado (`TUT`)

O BO 1001 é um tutorial de 14 passos. Cada passo é um objeto com `type`:

| type | Comportamento | Campos |
|---|---|---|
| `msg` | Texto e botão de continuar. Editor travado. | `text`, `extra` (HTML ilustrativo), `text2`, `btn` |
| `run` | Consulta pronta e travada; o jogador só executa. | `sql`, `spot`, `point`, `ok(R)`, `after` |
| `explain` | O jogador precisa clicar em "Explique esta consulta". | `spot`, `point`, `after` |
| `predict` | Múltipla escolha **antes** de executar; Executar fica bloqueado até acertar. | `sql`, `q`, `opts[{t,ok,fb}]`, `ok(R)`, `after` |
| `slot` | Molde com `___` e peças clicáveis (algumas erradas de propósito). | `template`, `chips[{t,bad}]`, `ok`, `miss(R,k)`, `after` |
| `blocks` | Peças embaralhadas para clicar na ordem certa. | `pool`, `answer`, `wrong[]`, `ok`, `after` |
| `mold` | Molde editável; o jogador digita só uma parte. | `template`, `ok`, `miss(R,k)`, `after` |
| `free` | Editor vazio, escrever do zero, com 2 dicas opcionais. | `hints[]`, `hintBtns[]`, `ok`, `miss(R,k)`, `after` |
| `final` | Encerra e libera Ocorrências e PolíciaZap. | `text`, `btn` |

- `after`: texto de reforço mostrado ao acertar, com botão Continuar. Aceita `{n}` (total de veículos) e `{cores}` (cores distintas).
- `miss(R, k)` e `wrong[]`: o `k` é quantas vezes o jogador já errou naquele passo. Use `esc(k, [msg1, msg2])` para **escalonar**: a bronca fica mais firme e a ajuda fica mais concreta.
- `spot` + `point`: a seta amarela aponta para o elemento (`#runBtn`, `#explBtn`).
- **Para aplicar a escada nos próximos módulos**, reutilize esse motor. Hoje ele está ligado só ao BO 1001 (`tutActive()` = `S.tut < TUT.length`). O próximo passo natural é generalizar para "um tutorial por conceito novo", com menos degraus a cada módulo.

---

## 7. Patentes e prova de promoção

### Patentes (`RANKS`)
| Índice | Patente | Como chega | Libera |
|---|---|---|---|
| 0 | Recruta | início | DB-Investigator; depois do tutorial, Ocorrências e PolíciaZap |
| 1 | Estagiário do Arquivo | prova do Módulo 1 | Arquivos e BO 1002 |
| 2 | Investigador Júnior | BOs 1002 e 1003 + prova do Módulo 2 | fim do conteúdo atual |

### Plano para as próximas patentes
| Patente | Módulo | Promoção libera (dentro da história) |
|---|---|---|
| Inspetor Analítico | 3 | tabelas financeiras (contas, transferências) |
| Agente Especial | 4 | cruzamento de bases (JOIN) |
| Perito Forense | 5 | **permissão de escrita** (UPDATE, DELETE, transações) |
| Perito Federal | 6 | dossiês, escutas completas, histórico |

**Princípio:** a recompensa da promoção é **acesso no sistema**, não pontos. O momento mais forte é quando o Perito Forense finalmente pode escrever no banco, depois de cinco módulos ouvindo "acesso negado".

### Prova (app ACADEPOL)
- `PROVAS[mod] = {para: índiceDaPatente, titulo, mcq:[…], write:[…]}`.
- Cada prova sorteia **3 de múltipla escolha + 2 de escrever consulta**. Aprovação com **4 de 5**.
- Múltipla escolha: `{id, q, code?, opts[3], ok: índice, exp}`. As alternativas são embaralhadas.
- Escrever: `{id, q, check(R), model}`. Corrigida **pelo resultado** (`runSafe` + `check`). O jogador pode testar antes de entregar.
- Prova **com consulta** (terminal, Dicionário e Explique liberados). Reprovar **não pune**: mostra a correção e permite refazer com outro sorteio.
- `provaMod()` decide qual prova está disponível.
- **Regra de conteúdo:** nada de decoreba ("defina SELECT"). As questões devem ser de prever resultado, achar erro, escolher a consulta certa ou escrever uma consulta.
- **Toda questão de escrever deve ter `model` testado**: a resposta-modelo precisa passar no próprio `check`.

---

## 8. Personagens e voz

### Célia Moura, supervisora do DTI
Veterana ("macaca velha"), 22 anos de DTI, desconfiada, ensina do jeito dela e dá esporro. Regras de escrita, **obrigatórias**:
1. **Bronca na atitude, nunca na ignorância.** Ela pega no pé de quem chuta, pula instrução ou tenta atalho. Para quem não sabe, ela ensina, mesmo resmungando.
2. **A primeira frase é a personalidade; a segunda é sempre a instrução útil.** A piada nunca pode esconder o que fazer.
3. **Elogio raro e seco:** "Não fez mais que a obrigação", "Hm. Funcionou."
4. **Erro repetido:** a bronca sobe de tom **e** a ajuda fica mais concreta.
5. **Sem palavrão** (o jogo deve servir para escolas e faculdades). Use "pelo amor de Deus, recruta", "ô, criatura", "na minha época".
6. Ela trata o jogador de "recruta", usa "tu/teu" às vezes, e fala com metáforas de repartição ("tabela é gaveta").

### Roberto "Beto" Silva, investigador da baia 05
Malandro simpático que vive pedindo favor. Ele é a fonte das **side quests** e dos **dilemas morais** (ex.: pedir para alterar o ponto). Não deve pisar no espaço da Célia: ele é charmoso e pidão, ela é a autoridade.

### Outros já citados
Jairo Teixeira (investigador impaciente), Marina Okada (perita), Paulo Henrique Dias (delegado, assina ou indefere mandados).

---

## 9. Medidores e regras de risco

| Medidor | Sobe com | Efeito |
|---|---|---|
| Metas | +30 por caso fechado, +10 pela side quest do Beto | hoje só indicador |
| Corregedoria | mandado errado (+15 a +20), resposta errada ao Beto (+15), aceitar fraude de ponto (+15), tentar escrever no banco (+5, só na 1ª vez), relatório errado (+5) | 100% = demissão |
| Relógio | avança ao fechar casos | modo "treino", não pune |

**Decisões:**
- O relógio **não pressiona** nos Módulos 1 e 2. Pressão de tempo só a partir do Módulo 3.
- A prova **não** mexe na Corregedoria.
- **Patente não cai** (decisão provisória; confirmar com a May).

---

## 10. Como evoluir o jogo (roadmap em ordem de prioridade)

### Prioridade 1 — validar com gente real
Antes de criar muito conteúdo novo: colocar **2 ou 3 pessoas que nunca programaram** para jogar, sem ajudar, e anotar onde elas param. Ajustar o tutorial com base nisso.

### Prioridade 2 — escada guiada no Módulo 2
**Lacuna conhecida:** BETWEEN, IN e ORDER BY aparecem só no manual e nas dicas do BO 1003. Eles nunca passaram pela escada (ver → prever → peça → blocos → molde). Criar mini-tutoriais da Célia no começo dos BOs 1002 e 1003, mais curtos que o do Módulo 1 (começando no degrau de prever ou de trocar uma peça).

### Prioridade 3 — Módulo 3 (COUNT, SUM, AVG, MIN, MAX, aritmética, GROUP BY, HAVING)
- Patente ao final: **Inspetor Analítico**.
- Tabelas novas sugeridas:
```sql
CREATE TABLE contas_bancarias (id INTEGER PRIMARY KEY, banco TEXT, agencia TEXT, numero TEXT,
                               cpf_titular TEXT REFERENCES pessoas(cpf));
CREATE TABLE transferencias (id INTEGER PRIMARY KEY AUTOINCREMENT, conta_origem INTEGER, conta_destino INTEGER,
                             valor REAL, data_hora DATETIME, descricao TEXT);
```
- Caso sugerido: **lavagem de dinheiro com depósitos fracionados** (muitos valores pouco abaixo de R$ 10.000 para a mesma conta), resolvido com `GROUP BY conta_destino HAVING COUNT(*) > N`.
- Ligar ao enredo: o dinheiro da carga roubada no BO 1003.
- `explainSQL` hoje só diz "agrupando (Módulo 3)" para GROUP BY e HAVING. Precisa explicar as agregações de verdade.
- A partir daqui o relógio do expediente pode começar a pressionar.

### Prioridade 4 — Módulo 4 (JOIN)
- Agora o JOIN tem motivo: `leituras_radar → veiculos → pessoas → enderecos` (criar tabela de endereços/galpões para o esconderijo do bando).
- Mostrar ao jogador que as 3 consultas do BO 1003 viram **uma só**.
- `explainSQL` **não entende JOIN** ainda; precisa ser estendido. `translateError` já trata `ambiguous column`.
- Considerar um mini diagrama de tabelas (ERD) no Dicionário de Dados.

### Prioridade 5 — Módulo 5 (INSERT, UPDATE, DELETE, transações)
- A promoção a Perito Forense libera a escrita: mudar `isReadOnly` para depender da patente.
- Implementar o **snapshot**: `db.export()` ao abrir o caso e `new SQL.Database(snapshot)` no botão "Restaurar ponto de backup".
- Cena-chave: **UPDATE sem WHERE** altera o ponto de todos os funcionários. A Corregedoria dispara e a Célia dá o maior esporro do jogo. Ensinar `BEGIN` / `ROLLBACK` como salvação.
- Retomar o dilema do Beto: agora o jogador **pode** alterar o ponto. Consequências reais.
- Atenção: comandos de escrita alteram `F`. Recalcular os fatos ou usar o snapshot nas validações.

### Prioridade 6 — Módulo 6 (texto, datas, CASE, subqueries, CTE, window functions)
Limpeza de dados sujos (`TRIM`, `UPPER`, `REPLACE` em placas com traço e nomes com espaços), reconstituição de rota com `LAG`/`LEAD` em antenas de celular, dossiê final com CTEs.

### Outras melhorias pendentes
- **Cada módulo como um dia de expediente:** a tela de login abre com data nova, patente nova e um e-mail da chefia com as permissões. Isso substitui a ideia de "fase".
- **Corregedoria suspendendo promoção:** se o medidor estiver alto na prova, exigir um "chamado de redenção" limpo antes de promover. Precisa de conteúdo extra.
- **Banco de questões maior** na ACADEPOL (hoje 5 de múltipla escolha + 3 de escrever por módulo).
- **Áudio das escutas** com Web Audio API (ruído de linha telefônica) + SpeechSynthesis, como previsto no documento original. Hoje a escuta é um .txt.
- **Quadro de Pistas** (fixar linhas do resultado para comparar suspeitos).
- **Telemetria local** (opcional): registrar em que passo o jogador mais erra, para orientar ajustes.

---

## 11. Diferenças em relação ao documento original v2.1

| Original | Atual | Motivo |
|---|---|---|
| `veiculos.proprietario_nome` | tabela `pessoas` + `cpf_proprietario` | dar sentido ao JOIN |
| Validação "o resultado contém a placa" | desfecho formal por mandado; tarefas só orientam | evitar `SELECT *` como trapaça |
| Relógio avança e pune desde o início | relógio de treino nos Módulos 1 e 2 | não punir quem está aprendendo |
| Primeiro contato pela query salva nos Arquivos | treinamento guiado no próprio terminal | o iniciante travava na navegação antes de ver SQL |
| Célia genérica | Célia veterana com regras de voz | personagem memorável sem humilhar o iniciante |
| Sem patentes | patentes + prova ACADEPOL | progressão diegética |
| Percentuais de "aderência ao mercado" (até 100%) | removidos do discurso do jogo | soavam como promessa exagerada |

---

## 12. Regras técnicas para quem for mexer

1. **Manter tudo num arquivo só** (HTML + CSS + JS), sem build e sem servidor.
2. **Lógica pura vai na zona CORE** (sem `document`), para poder ser testada no Node.
3. **Toda validação usa `F` ou consulta o banco.** Nunca escrever números fixos nas checagens.
4. **Nunca validar o texto da query.** Única exceção aceita: o degrau `blocks` do tutorial, que compara a ordem das peças.
5. **Erros e dicas em português simples**, dizendo o que fazer, sem jargão.
6. **Mobile:** em telas ≤760px as janelas ocupam a tela toda; teste nos dois tamanhos.
7. **Cores só por tokens** do `:root`.
8. Elementos com o atributo `hidden` precisam da regra `[hidden]{display:none!important}` (já existe). Sem ela, a tela de login invisível bloqueava os cliques.
9. Ao mudar o formato do estado de forma incompatível, **trocar `SAVE_KEY`**.
10. Se publicar como artifact do Claude: só scripts de cdnjs, jsDelivr ou unpkg; nada de `fetch` externo, `alert()`, `confirm()` ou `window.print()`.

---

## 13. Como testar

### Lógica (Node)
```bash
npm i sql.js@1.8.0
```
```js
const fs = require('fs');
const html = fs.readFileSync('sisp.html', 'utf8');
const core = html.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const initSqlJs = require('./node_modules/sql.js/dist/sql-asm.js');
eval(core + ';global.T={buildSeedSQL,computeFacts,CASES,toR,translateError,explainSQL,F}');
initSqlJs().then(SQL => {
  const db = new SQL.Database(); db.run(T.buildSeedSQL()); T.computeFacts(db);
  const run = q => { const r = db.exec(q); return T.toR(r.length ? r[r.length - 1] : null) };
  console.log(T.CASES[1].steps[2].ok(run("SELECT * FROM veiculos WHERE cor='prata' AND placa LIKE 'FTR%'")));
});
```
Para cada caso novo, teste: (a) a solução esperada passa; (b) consultas "quase certas" e trapaças (`SELECT *` sem filtro) **não** passam; (c) cada falso positivo gera a explicação certa no mandado.

### Interface (Playwright)
Abra o arquivo local e redirecione o pedido do cdnjs para o `sql-asm.js` local (o resto da rede pode ser bloqueado). Percorra o tutorial inteiro errando de propósito em cada degrau, nas larguras 1366 e 400. Verifique que nenhum erro aparece no console.

---

## 14. Checklist para criar um novo caso
- [ ] Qual conceito SQL ele ensina e em qual módulo?
- [ ] O conceito já passou pela escada guiada antes de aparecer aqui sem ajuda?
- [ ] Relato do BO com pistas que viram filtros (cor, horário, trecho de placa, local).
- [ ] Registros plantados: o alvo + pelo menos 2 falsos positivos com motivo de descarte claro.
- [ ] Os dados aleatórios não criam suspeitos acidentais.
- [ ] `steps` com `ok(R)` pelo resultado e 2 dicas cada (conceito → quase-resposta).
- [ ] `final.check` com explicação para cada erro plausível e penalidade.
- [ ] Manual do Recruta com exemplos usando **outras** tabelas (não entregar a resposta).
- [ ] Falas da Célia no tom certo; evidências em `FILES` com `from` correto.
- [ ] Testes no Node e no navegador.

---

## 15. Glossário
- **BO:** Boletim de Ocorrência (os casos do jogo).
- **DTI:** Departamento de Tecnologia da Informação.
- **ACADEPOL:** Academia de Polícia (app da prova).
- **Corregedoria:** órgão que fiscaliza policiais; aqui, o medidor de risco.
- **Diegético:** que existe dentro do mundo do jogo (uma janela do Pol-OS) e não como menu externo.
- **Scaffolding / escada:** apoio que diminui à medida que o jogador aprende.
- **Recordset:** o conjunto de linhas e colunas devolvido por uma consulta.
