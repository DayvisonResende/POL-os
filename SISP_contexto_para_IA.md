# SISP — Documento de Continuidade para IA (v3.1)

> **Para a IA que vai continuar este projeto:** leia este arquivo inteiro antes de mexer no código. Ele descreve o que o jogo é, por que ele é assim, o que já existe no código (`index.html` + pastas `css/` e `js/`), como ele está organizado, quais decisões já foram tomadas (e por quê) e o que falta fazer. A autora do projeto é a May, que fala português, é detalhista e quer **entender** as decisões, não só recebê-las. Dê opinião honesta quando ela pedir, mesmo discordando.

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
8. **100% no navegador, sem build.** HTML + CSS + JS em arquivos separados por responsabilidade, carregados por tags `<link>`/`<script>` comuns. Abrir o `index.html` direto no navegador já roda o jogo. Banco SQLite em memória via `sql.js`. Custo de infraestrutura zero.
9. **Tom:** repartição pública brasileira, burocrática e sarcástica, com colegas estressados e medo constante da Corregedoria.

---

## 3. Estado atual (o que já está pronto)

Ponto de entrada: **`index.html`** (o resto está em `css/` e `js/`, ver seção 4). Também publicado como artifact no Claude.

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

## 4. Arquitetura do código

### 4.1 Dependências externas
- `sql.js` **1.8.0, build `sql-asm.js`** via cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-asm.js`
  - **Por que a versão asm e não wasm:** o ambiente de artifact do Claude bloqueia `fetch` de arquivos `.wasm` (CSP). A versão asm é JavaScript puro e não precisa buscar nada. Se o jogo for hospedado em outro lugar, dá para trocar por `sql-wasm.js` (mais rápido).
  - SQLite dessa versão suporta window functions (`ROW_NUMBER`, `LAG`, `LEAD`), CTEs e transações. Os Módulos 3 a 6 funcionam sem trocar a biblioteca.
- Google Fonts: Barlow Condensed (títulos), Barlow Semi Condensed (interface), JetBrains Mono (código). Há fontes de fallback declaradas.

### 4.2 Estrutura de pastas

O jogo foi desmembrado do antigo arquivo único (v3.0) para crescer sem virar um monólito. **Não há build**: são scripts clássicos (não ES modules, porque módulos não carregam de `file://`). Todos compartilham o escopo global, então **a ordem das tags `<script>` no `index.html` é a ordem de dependência**.

```
index.html                  só a marcação (boot, desktop, barra de tarefas) e a lista de CSS/JS, em ordem
css/
  base.css                  tokens do :root (tema único), reset, peças compartilhadas
  desktop.css               boot, área de trabalho, janelas, barra de tarefas, toasts, overlays, seta
  apps/<app>.css            um arquivo por aplicativo
  mobile.css                regras ≤760px e ≤460px (sempre por último)
js/
  core/                     LÓGICA PURA, sem DOM. Roda no navegador e no Node.
    util.js                 mulberry32, sq, escH, toR, has, hasAll, normPlaca, normTxt, esc, rcols, shuffle
    registro.js             CASES, PROVAS, registrarCaso, registrarProva, indiceCaso
    banco/seed.js           buildSeedSQL (dados do jogo)
    banco/fatos.js          F e computeFacts
    sql/lexico.js           KEYWORDS, lev, closest, kwTypo, stripSql, tokSQL, joinToks
    sql/erros.js            translateError, zeroRowHint
    sql/diagnostico.js      diagnosticarSQL (ordem das cláusulas, WHERE sem comparação, aspas duplas), avisoSQL
    sql/permissao.js        isReadOnly
    sql/explicador.js       explainSQL e textos COLDESC/TABDESC
  conteudo/                 CONTEÚDO DO JOGO, sem DOM. É aqui que o jogo mais cresce.
    casos/<id>.js           um arquivo por BO: registrarCaso({...})
    treinamento/moduloN.js  passos do treinamento guiado (TUT)
    provas/moduloN.js       uma prova da ACADEPOL por módulo: registrarProva(N, {...})
    patentes.js             RANKS (com aoPromover)
    arquivos.js             FILES (snippets e evidências)
    personagens.js          PEOPLE (contatos do PolíciaZap)
    dicionario.js           COLNOTES (notas do Dicionário de Dados)
  ui/                       base do Pol-OS (mexe no DOM)
    dom.js, icones.js       $, h, ICONS
    estado.js               S, SAVE_KEY, freshState, save, load, rankT, resetAll
    banco.js                SQL, db, SCHEMA, TABELAS, iniciarBanco
    janelas.js              gerenciador de janelas e barra de tarefas
    notificacoes.js         toast, meters, addCorr, addMetas
    destaque.js             spot e seta "clica aqui"
    desktop.js              ícones, menu iniciar, unlockApp
    telemetria.js           telemetria local de playtest e painel de diagnóstico (ver 4.6)
  apps/                     um arquivo por aplicativo do Pol-OS
    db-investigator.js, ocorrencias.js, policiazap.js, arquivos.js, radar.js,
    treinamento.js (motor do TUT), acadepol.js, relatorio.js
  historia/                 side quests e eventos de enredo (hoje: beto.js)
  main.js                   boot (sempre o último script)
tests/                      testes no Node e no navegador (npm test)
scripts/empacotar.js        gera dist/sisp.html, o jogo num arquivo só (npm run empacotar)
docs/playtest.md            roteiro para conduzir sessões de playtest
```

**Regras da divisão:**
- `core/` e `conteudo/` **nunca** usam `document` ou `window` no momento em que são carregados. Funções de conteúdo podem *chamar* funções de UI (`say`, `unlockApp`…) dentro de callbacks como `aoEncerrar`, porque elas só rodam no navegador; os testes do Node nunca as disparam.
- Arquivo novo = uma tag `<script>` nova no `index.html`, no grupo certo. Os testes leem essa lista, então não há uma segunda lista para manter.
- Regras de progressão **ficam no conteúdo, não na UI**: patente mínima, tempo gasto e reação da história ficam no próprio caso; o efeito de cada promoção fica na patente; o requisito de cada prova fica na prova. A UI não deve ter `if (i === 1)` nem índices fixos de caso.

### 4.3 Funções e objetos principais

"core" = `js/core/` ou `js/conteudo/` (sem DOM); "UI" = `js/ui/`, `js/apps/` ou `js/historia/`. Para achar onde algo está: `grep -rn "function nome" js/`.

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
registrarCaso({                     // em js/conteudo/casos/1002.js
  id:'1002', titulo:'…', modulo:2, natureza:'…', quando:'12/10/2026 19:20', local:'…', solicitante:'…',
  relato:'HTML com o BO e os depoimentos',
  steps:[ { t:'texto da tarefa (HTML)', h:['dica conceitual','formato com nomes genéricos (sem os valores do caso)','consulta pronta'],
            ok:function(R){ return … },
            quase:function(R){ if(mesmasLinhas(R,F.lXXXX)&&falta(R,'placa')) return 'o que falta' } } ],   // opcional
  final:{ tipo:'mandado'|'resposta', titulo:'…', campos:[{id:'placa',label:'…'}],
          check:function(v){ return {ok:true,msg:'…'} ou {ok:false,pen:20,msg:'motivo do indeferimento'} } },
  manual:'HTML do Manual do Recruta deste caso',
  rankMin:1,                       // opcional: patente mínima para o caso abrir (índice em RANKS)
  tempo:150,                       // opcional: minutos que o relógio avança ao fechar (padrão 60)
  aoEncerrar:function(){ … }       // opcional: reação da história (mensagens da Célia, liberar app, side quest)
});
```
- **`steps[].ok(R)`** valida pelo resultado, nunca pelo texto.
- **`steps[].quase(R)`** (opcional) explica o jeito comum de chegar perto sem acertar; aparece como "Quase lá" no terminal quando nenhuma tarefa marcou. Use `mesmasLinhas(R, linhasEsperadas)` (linhas exatas, calculadas em `computeFacts` como `F.l<caso><tarefa>`), nunca só a contagem de linhas, que dispara por coincidência.
- **`final.check`** precisa explicar o motivo de cada resposta errada plausível, especialmente os falsos positivos planejados ("Corolla é sedã, as testemunhas viram uma caminhonete").
- Desbloqueio: `caseUnlocked(i)` (caso anterior fechado + `rankMin`). Os casos são ordenados pelo `id` no registro.
- Arquivos de cada caso: `FILES[]` com `caso: 'id do BO'` a partir do qual o arquivo aparece.

### 4.6 Telemetria local (playtest)
- `js/ui/telemetria.js` grava eventos em `localStorage` na chave **`sisp-telemetria-v1`**, separada do progresso (`Reiniciar turno` não apaga). Nada é enviado para fora do navegador. Limite de 4000 eventos (os mais antigos saem).
- Cada evento: `{t, s (sessão), tipo, onde, …}`. `onde` é o passo do treino (`Treino 06 · predict`), o BO ativo (`BO 1002`) ou a prova (`Prova Módulo 1`).
- Tipos: `sessao`, `consulta` (`res`: ok, vazio, erro, bloqueada), `treino_passo`, `treino_ok`, `tropeco` (toda bronca da Célia que não é de acerto), `dica`, `explique`, `tarefa`, `desfecho`, `prova`, `corregedoria`.
- Painel **Diagnóstico de playtest** no menu iniciar, **só** quando o jogo é aberto com `?teste` no endereço. Mostra tempo, consultas, erros, tropeços e dicas por lugar; destaca lugares com 3+ erros/tropeços ou 5+ minutos; exporta JSON.
- Ao criar algo novo que o jogador possa errar, chame `tele('tipo', {...})` no ponto do erro.

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
- Cada prova fica em `js/conteudo/provas/moduloN.js`: `registrarProva(N, {requer: 'id do BO', para: índiceDaPatente, titulo, mcq:[…], write:[…]})`.
- Cada prova sorteia **3 de múltipla escolha + 2 de escrever consulta**. Aprovação com **4 de 5**.
- Múltipla escolha: `{id, q, code?, opts[3], ok: índice, exp}`. As alternativas são embaralhadas.
- Escrever: `{id, q, check(R), model}`. Corrigida **pelo resultado** (`runSafe` + `check`). O jogador pode testar antes de entregar.
- Prova **com consulta** (terminal, Dicionário e Explique liberados). Reprovar **não pune**: mostra a correção e permite refazer com outro sorteio.
- `provaMod()` decide qual prova está disponível: a que promove para a patente seguinte, desde que o BO em `requer` esteja encerrado.
- O que a promoção libera fica em `RANKS[n].aoPromover` (`js/conteudo/patentes.js`).
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

**Achados de playtest (registro):**
| Data | Onde | Problema | O que foi feito |
|---|---|---|---|
| 14/10/2026 | Treino 11 e 12 (`mold`) | O jogador digitava a resposta e sobrava `Veiculo___`; não percebia que precisava apagar os tracinhos. | A lacuna `___` fica selecionada ao clicar no editor (`tutMarcarLacuna`), então digitar substitui. Textos da Célia ajustados. |
| 14/10/2026 | Treino 11 (`mold`), celular | O jogador apagou o editor inteiro e ficou sem o molde, sem jeito de recuperar. A Célia mandava "ler a mensagem vermelha embaixo do editor", que no celular fica atrás do teclado. | Molde nunca se perde: botão **Voltar o molde**, Limpar devolve o molde, executar vazio e reabrir o jogo restauram. A tradução do erro aparece dentro da fala da Célia, e o painel rola até ela. |
| 14/10/2026 | BO 1002, tarefa 1 (jogador iniciante) | `SELECT cor WHERE "prata" FROM veiculos;` recebia só "o banco se perdeu perto de FROM". A dica 1 não ensinava o formato, então o único caminho era ver a consulta pronta. Corrigida a ordem, `WHERE "prata"` voltava vazio sem dica; `cor = "prata"` funcionava por sorte (SQLite aceita aspas duplas como texto; PostgreSQL e SQL Server não). | `js/core/sql/diagnostico.js` lista todos os problemas de estrutura de uma vez (erro e resultado vazio) e avisa quando a consulta "funcionou por sorte". Dicas dos BOs ganharam um degrau intermediário: o **formato** com nomes genéricos (conceito → formato → consulta). O Explique entende aspas duplas. |
| 14/10/2026 | BO 1002, tarefa 1 (jogador iniciante) | `SELECT cor FROM veiculos WHERE cor = 'prata';`: filtro certo, mas só a coluna cor (nove vezes "prata"). A tarefa não marcou e o jogo ficou calado. A dica do formato ("troque tabela, coluna e valor") induziu a trocar o `*` também. | Tarefas ganharam `quase(R)` com mensagem "Quase lá" (todas as tarefas de 1002 e 1003). A dica do formato diz "mantenha o `*`". |
| 14/10/2026 | BO 1002, tarefa 2 (jogador iniciante) | `SELECT * FROM veiculos LIKE placa = 'FRT';` (sem WHERE, LIKE fora do lugar e com =, sem %, letras FTR trocadas) recebia só "o banco se perdeu perto de placa". A grade continuava mostrando o resultado da consulta anterior, como se fosse desta. A dica antiga de "LIKE sem %" sugeria literalmente `'FTR%'` (a resposta). | O diagnóstico aponta WHERE ausente, LIKE fora do lugar e LIKE sem % (com o texto do próprio jogador). Resultado vazio com LIKE manda conferir letra por letra com a pista. Erro limpa a grade. |
| 14/10/2026 | DB-Investigator | Ao selecionar texto no editor, o texto sumia: a seleção da caixa de digitação (camada de cima, texto invisível) era opaca e cobria o texto colorido da camada de baixo. | `--code-sel` virou translúcido. Regra: **a cor de seleção do editor tem que ter transparência.** |
| 14/10/2026 | DB-Investigator | Erro de digitação no início (`SELEC`) era tratado como tentativa de escrita: +5% de Corregedoria. (Achado pela telemetria.) | `isReadOnly` só bloqueia comandos que o SQLite reconhece como escrita; o resto vira erro traduzido. |

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
- ~~**Telemetria local**~~: feita (seção 4.6).

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

1. **Sem build e sem servidor.** Scripts clássicos carregados pelo `index.html`; abrir o arquivo no navegador tem que funcionar. Um assunto por arquivo; se um arquivo passar de ~300 linhas, provavelmente é hora de dividir.
2. **Lógica pura vai em `js/core/`, conteúdo em `js/conteudo/`** (sem `document` no carregamento), para poder ser testado no Node. Regras de progressão moram no conteúdo, nunca como `if` por índice na UI.
3. **Toda validação usa `F` ou consulta o banco.** Nunca escrever números fixos nas checagens.
4. **Nunca validar o texto da query.** Única exceção aceita: o degrau `blocks` do tutorial, que compara a ordem das peças.
5. **Erros e dicas em português simples**, dizendo o que fazer, sem jargão.
6. **Mobile:** em telas ≤760px as janelas ocupam a tela toda; teste nos dois tamanhos.
7. **Cores só por tokens** do `:root`.
8. Elementos com o atributo `hidden` precisam da regra `[hidden]{display:none!important}` (já existe). Sem ela, a tela de login invisível bloqueava os cliques.
9. Ao mudar o formato do estado de forma incompatível, **trocar `SAVE_KEY`**.
10. Para distribuir como arquivo único: `npm run empacotar` gera `dist/sisp.html` (não versionado).
11. Se publicar como artifact do Claude: só scripts externos de cdnjs, jsDelivr ou unpkg; nada de `fetch` externo, `alert()`, `confirm()` ou `window.print()`. Publicar o `index.html` como página e todos os arquivos de `css/` e `js/` como arquivos de apoio (parâmetro `files`), mantendo os mesmos caminhos.

---

## 13. Como testar

### Tudo de uma vez
```bash
npm install     # sql.js 1.8.0 e playwright-core (sem baixar navegador)
npm test
```

### Lógica e conteúdo (Node) — `tests/jogo.test.js`
`tests/carregar.js` lê a lista de `<script>` do `index.html`, carrega no Node só o que está em `js/core/` e `js/conteudo/`, gera o banco e devolve `{T, db, run}`. Cobre: arquivos do index existem, registro consistente (FILES e provas apontam para casos existentes), banco determinístico, soluções e falsos positivos dos BOs, consultas prontas do treinamento, respostas-modelo da ACADEPOL e as funções de SQL.

Para cada caso novo, teste: (a) a solução esperada passa; (b) consultas "quase certas" e trapaças (`SELECT *` sem filtro) **não** passam; (c) cada falso positivo gera a explicação certa no mandado.

### Interface (Chrome headless) — `tests/navegador.test.js`
Joga o jogo inteiro (treinamento errando de propósito em cada degrau, BO 1001, prova 1, BO 1002 com mandado errado, BO 1003, prova 2, promoção) nas larguras 1366 e 400, e verifica estado final, telemetria, painel de diagnóstico (só com `?teste`) e **zero erros no console**. O sql.js é servido do `node_modules`; o resto da rede é bloqueado.
- Usa o Chrome/Chromium instalado no sistema (variável `CHROME` para outro caminho). Sem navegador, o teste é pulado.
- Se `dist/sisp.html` existir, a versão empacotada também é jogada.
- Ao mudar o fluxo do treinamento ou dos BOs, atualize a função `treinamento()` desse arquivo.

### Com pessoas — `docs/playtest.md`

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
- [ ] Arquivo `js/conteudo/casos/<id>.js` com `registrarCaso`, e a tag `<script>` no `index.html`.
- [ ] `rankMin`, `tempo` e `aoEncerrar` definidos no próprio caso (nada de `if` por índice na UI).
- [ ] Falas da Célia no tom certo; evidências em `FILES` com `caso` correto.
- [ ] Testes em `tests/` (solução passa, trapaça não passa, falsos positivos explicados) e no navegador.

---

## 15. Glossário
- **BO:** Boletim de Ocorrência (os casos do jogo).
- **DTI:** Departamento de Tecnologia da Informação.
- **ACADEPOL:** Academia de Polícia (app da prova).
- **Corregedoria:** órgão que fiscaliza policiais; aqui, o medidor de risco.
- **Diegético:** que existe dentro do mundo do jogo (uma janela do Pol-OS) e não como menu externo.
- **Scaffolding / escada:** apoio que diminui à medida que o jogador aprende.
- **Recordset:** o conjunto de linhas e colunas devolvido por uma consulta.
