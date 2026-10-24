# SISP — Documento de Continuidade para IA (v3.6)

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

### História
O arco completo do Módulo 1 ao 6 e o **currículo** de cada ato (seção 11) ("Operação Véio": elenco com segredos, as viradas de cada ato, o mapa de pistas e o final) está em **`docs/historia.md`**. **Leia antes de escrever qualquer caso, fala, evidência ou dado plantado.** Contém spoilers: não mostrar a playtesters.

---

## 2. Pilares de design (não quebrar)

1. **Desktop diegético.** Não existem menus abstratos de "fase" ou "pausa". Tudo é aplicativo, janela, arquivo, notificação ou mensagem de chat dentro do Pol-OS.
2. **SQL como mecânica de dedução.** O jogador cruza depoimentos, radares, cadastros e escutas com consultas.
3. **Validar o resultado, nunca o texto da consulta.** Jamais usar regex para checar se o jogador escreveu a query "certa". Executa-se a consulta e confere-se o **conjunto de resultados** (colunas, número de linhas, valores presentes). Assim qualquer abordagem válida é aceita.
4. **O caso só fecha pelo desfecho formal** (mandado ou relatório). As tarefas que se marcam sozinhas são apenas orientação. Isso impede trapaças como `SELECT *` sem filtro.
5. **Andaime que diminui aos poucos (scaffolding).** Cada conceito novo passa por uma escada: ver → prever → trocar uma peça → montar com blocos → completar um molde → escrever do zero. O apoio diminui conforme o jogador avança.
6. **O jogador sempre sabe qual é a próxima ação**, mesmo quando ainda não sabe a resposta.
7. **Foco em DQL e DML.** Sem `CREATE TABLE` nem teoria de normalização. O jogador é analista, não arquiteto de banco.
8. **100% no navegador, sem build.** HTML + CSS + JS em arquivos separados por responsabilidade, carregados por tags `<link>`/`<script>` comuns. Abrir o `index.html` direto no navegador já roda o jogo. Banco SQLite em memória via `sql.js`. Custo de infraestrutura zero. **Única exceção:** a telemetria remota opcional (Supabase, plano grátis), que só envia com consentimento e, se falhar, não afeta o jogo.
9. **Tom:** repartição pública brasileira, burocrática e sarcástica, com colegas estressados e medo constante da Corregedoria.

---

## 3. Estado atual (o que já está pronto)

Ponto de entrada: **`index.html`** (o resto está em `css/` e `js/`, ver seção 4). Publicado no **GitHub Pages**, com domínio próprio: https://polos.useconectai.com.br/ (o endereço github.io redireciona para ele) (cada push na `main` atualiza; para playtest, mandar o link com `?teste`).

### Fluxo completo jogável hoje
1. **Login** no Pol-OS (tela de boot; o banco carrega enquanto isso).
2. **Treinamento guiado (BO 1001, Módulo 1)** com a Célia, em 14 passos, num painel ao lado do terminal. No começo só existe o DB-Investigator na área de trabalho. O passo 1 **abre pelo crime** (versão `2026-10-21-plantao`, ideia do livro *Storytelling com Dados*): um cartão de **plantão** do assalto de 12/10 na Castelo Branco (campo `antes` do passo: aparece, mas a voz não lê) e a Célia promete que até o fim do dia quem acha a caminhonete é o jogador. Não citar Hilux, dono nem valor da carga ali. O botão de avançar do painel fica preso ao rodapé (`.guide>.gact`, sticky) para nunca sumir abaixo da dobra. **No celular** (≤760 px), nos passos em que a Célia só fala (`msg`/`final`), o editor e a barra somem e ela ganha a tela (classe `db-so-fala`, `css/mobile.css`; versão `2026-10-22-celular`); quando o passo pede consulta, voltam.
   - **Achados** (versão `2026-10-21-achados`, cap. 4 do mesmo livro): tarefas de descoberta dos BOs têm `achado:{valores:function(){…},frase}`. Ao concluir uma delas, o DB-Investigator acende as células com esses valores (e a linha delas) e mostra a faixa **ACHADO** com a frase (`mostrarAchados` em `js/apps/db-investigator.js`; comparação em `valorBate`, `js/core/util.js`; evento de telemetria `achado`). Hoje são 8: 1002·3, 1003·2, 1003·3, 1004·4, 1004·6, 1005·5, 1006·5, 1007·3. Regra: no máximo 2 por BO (há teste), frase sem adiantar o que o jogador ainda não descobriu.
3. Fim do treinamento: são liberados o **SISP Ocorrências** e o **PolíciaZap**. O jogador entrega o relatório do BO 1001 (quantas cores distintas existem).
4. É liberada a **ACADEPOL** (prova). Aprovado, o jogador é **promovido a Estagiário do Arquivo**, o que libera os **Arquivos** e o **BO 1002**.
5. **BO 1002 (furto no shopping):** WHERE, AND, LIKE. Desfecho por mandado de busca.
6. **BO 1003 (assalto na Castelo Branco):** BETWEEN, IN, comparações e o primeiro contato com chave estrangeira (em três consultas, sem JOIN). Desfecho por mandado de prisão (placa + nome).
7. Durante o BO 1003 chega o **dilema do Beto** (consultar a catraca e depois o pedido de fraude de ponto).
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
    i18n.js                 L('texto em português', {vars}), Lp (plural), escolha de idioma (docs/idiomas.md)
    vozes.js                idFala, textoFalado, PRONUNCIA, registrarVozes (docs/vozes.md)
    registro.js             CASES, PROVAS, registrarCaso, registrarProva, indiceCaso
    servicos.js             serviços do Beto: CONCEITOS, SERVICOS, sorteio, conferência da resposta e domínio
    guia.js                 Guia SQL: VERBETES, registrarVerbete, verbetesLiberados, buscarVerbetes
    banco/seed.js           buildSeedSQL (dados do jogo)
    banco/fatos.js          F e computeFacts
    sql/lexico.js           KEYWORDS, lev, closest, kwTypo, stripSql, tokSQL, joinToks
    sql/erros.js            translateError, zeroRowHint
    sql/diagnostico.js      diagnosticarSQL (ordem das cláusulas, WHERE sem comparação, aspas duplas, LIKE, BETWEEN,
                            agregação no WHERE, HAVING sem GROUP BY), avisoSQL (aspas duplas, coluna solta no GROUP BY)
    sql/permissao.js        isReadOnly
    sql/executar.js         executarSQL: resultado de cada consulta do editor, inclusive as vazias
    sql/explicador.js       explainSQL e textos COLDESC/TABDESC
    sql/formatar.js         formatarSQL: botão Organizar (uma parte por linha, palavras do SQL em maiúsculas)
    sql/sugerir.js          sugerirSQL: autocompletar só de nomes (tabelas, colunas, palavras do SQL)
  i18n/                     traduções: <idioma>.js mapeia texto em português → tradução (carregadas antes do conteúdo)
  vozes/                    manifesto dos áudios gravados por idioma (gerado por npm run vozes -- manifesto)
  conteudo/                 CONTEÚDO DO JOGO, sem DOM. É aqui que o jogo mais cresce.
    casos/<id>.js           um arquivo por BO: registrarCaso({...})
    treinamento/*.js        treinamentos guiados: registrarTreino({id, titulo, passos, aoConcluir}) (ver seção 6)
    provas/moduloN.js       uma prova da ACADEPOL por módulo: registrarProva(N, {...})
    patentes.js             RANKS (com aoPromover)
    arquivos.js             FILES (snippets e evidências)
    personagens.js          PEOPLE (contatos do PolíciaZap)
    dicionario.js           COLNOTES (notas do Dicionário de Dados)
  ui/                       base do Pol-OS (mexe no DOM)
    dom.js, icones.js       $, h, ICONS
    estado.js               S, SAVE_KEY, freshState, save, load, rankT, resetAll
    banco.js                SQL, db, SCHEMA, TABELAS (com rankMin), iniciarBanco, atualizarSchema, tabelaBloqueada
    janelas.js              gerenciador de janelas e barra de tarefas
    notificacoes.js         toast, meters, addCorr, addMetas
    destaque.js             spot e seta "clica aqui"
    desktop.js              ícones, menu iniciar, unlockApp
    telemetria.js           telemetria local de playtest e painel de diagnóstico (ver 4.6)
    backup.js               salvar/carregar progresso em arquivo, confirmação de reinício, caixa confirmar()
                            (o menu iniciar fica em desktop.js: programas, Relatório e Configurações ▸ com submenu)
  apps/                     um arquivo por aplicativo do Pol-OS
    db-investigator.js, ocorrencias.js, policiazap.js, arquivos.js, radar.js,
    treinamento.js (motor do TUT), acadepol.js, relatorio.js
  historia/                 dilemas, pedidos e serviços dos colegas (beto.js, pedidos.js, servicos.js; ver Glossário)
  main.js                   boot (sempre o último script)
tests/                      testes no Node e no navegador (npm test)
supabase/setup.sql          tabela da telemetria remota (rodar uma vez no Supabase)
scripts/telemetria*.js      npm run telemetria: baixa do Supabase e gera telemetria/relatorio.md
scripts/empacotar.js        gera dist/sisp.html, o jogo num arquivo só (npm run empacotar)
scripts/vozes.js            npm run vozes: roteiro de gravação das falas; "-- manifesto" lista os mp3 gravados (docs/vozes.md)
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
treino (id do treinamento ativo ou null), treinosFeitos[ids], tutEntrou ('treino:passo' já iniciado),
tut (passo dentro do treino ativo), tutPhase ('doing'|'after'), tutPick, tutPred, tutWrong[], tutBlocks[], tutHint,
tutFb, tutMiss, tutErr, tutBlk, apps[], rank, prova{mod,qs,ord,ans,sql,graded}, provaTries{},
servicos{conceitos{id:{seguidos,acertos,erros,dominado,visto}}, n, ultimo, ultimaVariacao, aberto{id,p,tentativas,chegaEm,entregue}, turno, noTurno, apresentado}
```
**Backup em arquivo** (`js/ui/backup.js`): menu SISP › **Configurações** › *Salvar progresso em arquivo* baixa `sisp-progresso-AAAA-MM-DD-HH-MM.json` = `{jogo:'sisp', formato:SAVE_KEY, salvoEm, patente, encerrados, estado:S}`. *Carregar progresso de arquivo* (só no menu Configurações, depois de entrar; a tela de login não oferece carregar, por decisão do Dayvison) valida `jogo` e `formato`, pede confirmação e grava no `localStorage` antes de recarregar; formatos antigos de `S` passam pela migração normal do `load()`. *Reiniciar turno* pede confirmação e oferece salvar antes. Ao trocar `SAVE_KEY`, decidir se backups antigos devem ser aceitos (hoje são recusados com aviso).

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
  aoEncerrar:function(){ … }       // opcional: reação da história (mensagens da Célia, liberar app, dilema)
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
- Tipos: `sessao`, `consulta` (`res`: ok, vazio, erro, bloqueada; `consultas`: quantas havia no editor), `treino_passo` (`degrau`: tipo do passo), `quase`, `treino_ok`, `tropeco` (toda bronca da Célia que não é de acerto), `dica`, `explique`, `tarefa`, `desfecho`, `prova`, `corregedoria`.
- Painel **Diagnóstico de playtest** no menu iniciar, **só** quando o jogo é aberto com `?teste` no endereço. Mostra tempo, consultas, erros, tropeços e dicas por lugar; destaca lugares com 3+ erros/tropeços ou 5+ minutos; exporta JSON.
- Ao criar algo novo que o jogador possa errar, chame `tele('tipo', {...})` no ponto do erro.

### 4.6.1 Dias de expediente, pedidos e PolíciaZap
- **Dias** (`js/conteudo/dias.js` + `js/ui/expediente.js`): cada módulo é um dia. `S.dia` (0 = terça 13/10), `S.diaConcluido`, `S.diaIniciado`. A promoção do fim do módulo chama `concluirDia()`; o Relatório do turno mostra **Encerrar expediente** (se existir o dia seguinte), com transição e recarga. No primeiro login do dia, o **e-mail da manhã** abre antes do treinamento. Casos têm `diaMin`; tabelas têm `diaMin` (acesso provisório) além de `rankMin`.
- **Pedidos dos colegas** (`registrarPedido` em `js/core/registro.js`, conteúdo em `js/conteudo/pedidos.js`, motor em `js/historia/pedidos.js`): prática opcional pelo PolíciaZap; acerto dá Metas, erro não pune. Primeiro: `jairo-radares` (GROUP BY + ORDER BY), depois do BO 1004.
- **Serviços do Beto ("Tem serviço?")** (ideia do Dayvison, iniciante: "só pratiquei na história e já não lembro tanto"): treino livre e **sem limite** dos conceitos já aprendidos. Lógica pura em `js/core/servicos.js` (testada no Node), conteúdo em `js/conteudo/servicos.js`, motor em `js/historia/servicos.js`, página **Treino com o Beto** no Caderno.
  - Libera depois do dilema do ponto (`S.beto==='done'`); o Beto se apresenta uma vez. Quem deixou o pedido sem resposta: no dia seguinte o Beto desiste do assunto (`betoDesiste`, `S.betoIgnorou=true`, telemetria `dilema` com `escolha:'ignorou'`) e os serviços liberam. O Ato IV pode levar em conta quem ignorou. Cada conceito (`registrarConceito`) é liberado pelo treinamento que o ensina.
  - O jogador pede, o Beto "organiza" por **20 a 60 s** (`SERV_ESPERA`, sorteado; sobrevive a recarregar a página) e manda um serviço. Resposta digitada no chat, conferida pelo **resultado** de uma consulta de referência (`sql(p)`); número com tolerância, texto pelas palavras que importam. Erro: dica, sem punição. "Deixa pra lá": o Beto mostra a consulta (`mostrar(p)`, só com o que o jogador já sabe) e a resposta.
  - **Metas só nos 3 primeiros de cada turno** (turno = dia + BOs fechados), +5 cada: treinar mais é livre, mas não infla a progressão.
  - **Domínio:** 3 acertos seguidos de primeira; o selo não cai. **Mistura** (serviço com vários conceitos) só aparece quando cada conceito já está dominado sozinho. O sorteio favorece o não dominado, o errado e o que não aparece há tempo.
  - Variações vêm do banco (`variar()`), e nada entrega pista da história (lista `SERV_FORA`; há teste). Módulos novos: registrar os conceitos e uns 3 a 5 serviços por conceito, mais misturas com os módulos anteriores.
  - Telemetria: `servico` (`pedido`, `resposta`, `desistiu`, `dominou`).
- **Tarefas com `aoConcluir`**: fala da história disparada no momento em que o jogador conclui a tarefa (a virada da Denise no BO 1004).
- **Caderno do Investigador** (`js/apps/caderno.js`, `S.caderno`): uma página "Geral" e uma por BO liberado (casos futuros não aparecem). Anotação livre salva sozinha; o 📌 em cada linha da grade do DB-Investigator fixa a linha (com a consulta) na página do BO em andamento; clicar num valor fixado cola no editor, com aspas se for texto. Liberado com Ocorrências e PolíciaZap; saves antigos ganham automaticamente. Telemetria: `caderno` (`fixar`, `colar`, `nota`), resumida no relatório.
- **PolíciaZap, lidas e não lidas** (playtest da Mayumi): `S.lidas[contato]`; mensagem só conta como lida com o PolíciaZap em primeiro plano; divisória "N mensagens novas", destaque, botão "↓ Nova mensagem" quando o jogador está lendo mensagens antigas, horário do jogo em cada mensagem.

### 4.6.2 Ajustes do playtest de 17/10/2026 (jogadora experiente)
- **Editor:** inserções do jogo usam `editorDigitar` (`execCommand('insertText')`) para o **Ctrl+Z** funcionar; **autocompletar** em faixa abaixo do editor (Tab aceita, Esc esconde; desligado no celular e só com nomes, nunca a consulta); botão **Organizar** (fora do treinamento); clicar num **valor do resultado** copia (sem aspas, com aviso discreto "Copiado"; fora do treinamento; `copiarTexto` tenta a API moderna e cai no jeito antigo); números com no máximo 2 casas (`numTela`).
- **Ocorrências:** o que foi digitado no desfecho sobrevive ao redesenho (`rascunhoBO`); **aviso fixo de prova pendente** ("Próximo passo") e "!" no ícone da ACADEPOL; pílula "Aguarda a prova".
- **Dicionário:** tabelas fechadas por padrão (`S.dictAbertas` lembra), dica fixa no topo. `COLNOTES` só em `js/conteudo/dicionario.js` (havia cópia em `db-investigator.js` que apagava as notas das contas). Contas: `id` × `numero` explicado; dicas do BO 1005 falam em **id**.
- **Erros de outros bancos** (`DIALETOS` em `js/core/sql/erros.js`): `::`, `TOP`, `ILIKE`, `NOW()`/`GETDATE()`, `ISNULL`, `LEN`, `DATEDIFF`, `CONCAT`, `EXTRACT`.
- **Manual do Recruta** (`manual/index.html`, versão `2026-10-24-manual`): folha-resumo de SQL dos Módulos 1 a 4 para imprimir e divulgar, com a logo. `npm run manual` gera `manual/manual-do-recruta.pdf` (A4, uma página) e `manual/manual-do-recruta.png` (imagem 4:5 para redes sociais). Link no rodapé do Guia SQL (na versão de arquivo único, vai para o site). Regras em `tests/manual.test.js`: todo exemplo roda no banco do jogo e traz linhas; nada de pista ou resposta de caso (FTR, Hilux, Denise, Valdemar, 'prata', Km 18/92/93, faixa 9000–9999…); PDF em uma página. Ao mudar o banco ou os casos, rode `npm run manual` de novo.
- **Onde está o erro** (versão `2026-10-24-sublinhado`, ideia do *Database Detective*): `localErroSQL(msg, sql, testar, schema)` em `js/core/sql/erros.js` acha o trecho e o editor o sublinha em vermelho ondulado (`marcaErro` em `js/apps/db-investigator.js`) até o jogador mexer na consulta. Regras: palavra-chave digitada errada (`kwTypo`, a mesma da mensagem traduzida) tem prioridade; palavra repetida é decidida cortando a consulta depois de cada ocorrência e compilando com `db.prepare` (não executa nada); `;` final com parêntese aberto marca o parêntese; aspas sem fechar marcam o texto. Teste em `tests/jogo.test.js`.
- **Conteúdo:** passo "prever" do COALESCE antes do molde; "boas manias" nas anotações do Módulo 3 (AS, uma parte por linha, executar só o trecho selecionado).
- **Notificações:** somem descendo; "Som de mensagem" opcional (SISP › Configurações › Som, desligado por padrão, gerado com Web Audio).

### 4.6.3 Guia SQL (17/10/2026)
- App **Guia SQL** no Pol-OS (`js/apps/guia.js`): referência rápida, com busca, de cada comando **já ensinado** (o verbete aparece quando o treinamento indicado em `treino` termina; o ícone aparece sozinho, inclusive em saves antigos). Cada verbete: o que faz, formato, exemplos com **Testar no editor** (fora do treinamento) e **Copiar**, erros comuns, "No trabalho" (diferença para outros bancos) e "Veja também".
- Conteúdo: `js/conteudo/guia.js` (22 verbetes dos Módulos 1 a 3). **Regra: ensina o "como", nunca o "o quê" dos BOs.** `tests/guia.test.js` reprova texto com valores dos casos e **resultado curto** (até 10 linhas) que mostre resposta (placas, nomes, CPFs dos laranjas). O teste já pegou 4 exemplos que entregavam algo (a Denise é a 1ª pessoa da tabela; o Virtus aparece nas passagens rápidas e entre 19h e 20h; um sobrenome era de laranja).
- Módulo novo: acrescentar os verbetes do módulo com o `treino` dele; rodar `node --test tests/guia.test.js`.
- **Atalhos (18/10/2026):** erros e dicas do DB-Investigator ganham "📖 Ver no Guia: …" (`verbeteDoTexto`, por palavra-chave da mensagem); o Explique lista "No Guia:" os comandos da consulta (`guiaDaConsulta`). Só verbetes já liberados.
- Ainda não ligado: selo de domínio dos serviços do Beto no verbete.

### 4.6.4 Nivelamento "Já sei SQL" (18/10/2026)
- Ideia do playtest da Mayumi (profissional de BI). Questões em `js/conteudo/nivelamento.js` (`NIVELAMENTO`: Módulos 2, 3 e 4, 3 questões cada, só com tabelas liberadas no começo e sem repetir prova nem BO); app em `js/apps/nivelamento.js` (visual da prova da ACADEPOL).
- O treinamento do Módulo 1 é obrigatório para todos (apresenta a tela). No fim dele, a Célia pergunta pelo PolíciaZap se o jogador já mexe com SQL (notificação clicável, **sem janela que bloqueia**); também fica no menu SISP enquanto `nivelamentoDisponivel()`.
- Um módulo por vez: acertou todas, os treinamentos do módulo entram em `S.treinosFeitos` (anotações, Guia e serviços liberados) e passa ao próximo; errou alguma, encerra e segue o treinamento normal. BOs, provas e história continuam iguais. Estado em `S.nivelamento`; telemetria `nivelamento` (`oferecido`, `comecou`, `modulo`, `fim`).

### 4.6.5 Pausar o treinamento (18/10/2026)
- Playtest do iniciante: "no treinamento eu fico preso, não dá pra adiantar o trabalho do Beto". Botão **Pausar** no painel da Célia (menos no Módulo 1). Pausado (`S.tutPausado`), `tutActive()` é falso: o DB-Investigator fica livre (sem painel, sem correção, editor destrancado); o editor do treinamento fica em `S.editorTreino` e o livre em `S.editorLivre`. **Voltar ao treinamento** (barra do DB-Investigator) retoma no mesmo passo, sem repetir a fala (`S.tutEntrou`). `verificarTreinos` não reinicia treinamento pausado; ao abrir o jogo pausado, uma notificação lembra. Telemetria `treino_pausa` / `treino_volta`.

### 4.7 Telemetria remota (Supabase)
- `js/ui/telemetria-remota.js` manda cada evento de `tele()` para a tabela `eventos` do Supabase, **só** se `js/config.js` tiver `url` e `chave` **e** o jogador aceitou o termo (`js/conteudo/termo.js`, guardado em `localStorage['sisp-consentimento']` com `TERMO_VERSAO`). Sem isso, não faz nada.
- **Termos de uso (v3, 19/10/2026; v2 de 17/10):** `js/conteudo/termo.js` é um contrato completo em duas partes: (1) termos do jogo, aceitos nas duas escolhas: jogo de simulação, ensino de SQL, obra de ficção (personagens, casos, placas e CPFs inventados), **sem relação com a polícia ou órgãos públicos**, sem garantias, progresso local; (2) coleta de dados de uso **opcional** (LGPD: responsável identificado só pelo e-mail de contato, por decisão do Dayvison; base legal consentimento, retenção de até 5 anos, direitos e contato). Não cita o fornecedor do banco (há teste). Tradução completa para o inglês. **Recomendado:** revisão por advogado antes de publicar nas lojas.
- Lotes de 40 eventos, a cada 15 s e ao sair/esconder a aba (`keepalive`); fila em `localStorage['sisp-telemetria-fila']` (até 1000), reenviada depois se a internet cair. No envio de saída o lote **sai da fila antes da resposta** (a página pode fechar antes dela); até a versão `2026-10-21-fila` ele ficava e era reenviado a cada fechamento (29% dos eventos eram cópias). O relatório ignora as cópias antigas (`semDuplicados` em `scripts/telemetria-analise.js`).
- Identidade: `sisp-jogador` (código aleatório por navegador) e um código por abertura do jogo. **Nunca** enviar nome, login, senha, contato nem o nome do certificado (há teste).
- Eventos extras (além dos da 4.6): `sessao` com aparelho em categorias (`faixa`, `navegador`, `sistema`, `idioma`, `toque`, `msBanco`, `versao`), `janela`, `escolha` (opções e peças dos treinamentos), `dilema`, `beto`, `promocao`, `demitido`, `relatorio`, `dica_auto` (dica exibida), `erro_js` (erros técnicos), `pausa`/`volta`/`saida`, `consentimento`, `treino_inicio`/`treino_fim`.
- Configurações › Privacidade (só aparece se configurado): liga/desliga, mostra o código anônimo e o termo completo.
- Lado do servidor: `supabase/setup.sql` (tabela só-inserção para `anon`, limites de tamanho, view `sessoes_resumo`). Download e relatório: `npm run telemetria` → `telemetria/` (fora do git). Instalação: `docs/telemetria-supabase.md`; comandos e consultas do dia a dia: `docs/telemetria-comandos.md`. **Configurado e no ar desde 17/10/2026** (projeto `hkltzqavgnqfnvxdszgi`).
- **Cláudio Prates, do TI (problemas e sugestões, termo v3 de 19/10/2026):** o jogador escolhe **Problema** ou **Sugestão** (vai em `contexto.tipo`: `bug`/`sugestao`; a tabela não mudou; quem conversou antes recebe uma vez o aviso da novidade, flag `S.claudioSugestoes`). contato `claudio` do PolíciaZap (sempre visível) e SISP › Falar com o TI. `js/apps/suporte.js`: o jogador escreve (10 a 1000 caracteres, até 5 por dia), revisa numa tela que mostra o texto e o contexto (onde está, dia, patente, treino, última consulta e erro, último erro do jogo, janelas, aparelho, versão, código anônimo) e só então envia para a tabela `relatos` (`supabase/relatos.sql`, só inserção). Vai **mesmo sem o consentimento da telemetria**: cada envio é uma escolha explícita, com aviso "fora da história" na conversa e na revisão (termo, seção 11). Sem rede: fila em `localStorage['sisp-relatos-fila']`, reenviada a cada minuto. Erro técnico do jogo (`erro_js`): o Cláudio se oferece uma vez por sessão. Ler: `npm run bugs` (marca como visto; `--resolver`, `--descartar`, `--nota`). Dúvida de SQL não é com ele: a conversa manda para a Célia e o Guia SQL.
- **Testes nunca enviam para o Supabase de verdade:** `abrir()` define `window.SISP_CONFIG_TESTE`, que `js/config.js` usa no lugar da configuração real.

### 4.8 Vozes dos personagens (preparado, sem áudios ainda)
- Guia completo: `docs/vozes.md`. Gravação prevista no ElevenLabs **depois que os textos estabilizarem**.
- `idFala(personagem, html)` (`js/core/vozes.js`): hash FNV-1a do personagem + texto visível (sem HTML) → `celia-3fa9c21b`. Arquivo: `audio/<idioma>/<id>.mp3`. Mudou o texto, muda o id (o áudio antigo para de tocar e a ferramenta avisa).
- `js/vozes/<idioma>.js` (manifesto, **gerado** por `npm run vozes -- manifesto`): o jogo só pede os áudios listados. Sem áudio, a fala fica muda, sem erro.
- `js/ui/vozes.js`: `falar()` com fila, `botaoOuvir()` (🔊), preferência em `localStorage['sisp-vozes']` (desligada por padrão). Menu **Configurações › Som** aparece quando há algum áudio (ou em `?teste`).
- Ganchos: `say()` do PolíciaZap; balão do guia do treinamento (`tutEnter`, `tutComplete`, `tutFeedback` sem o bloco técnico do erro). `fill()` foi para `js/core/banco/fatos.js` para o roteiro usar o mesmo texto da tela.
- `npm run vozes` gera `audio/<idioma>/roteiro.csv` e `roteiro-<personagem>.txt` (fora do git), com texto falado (`PRONUNCIA`: `*` → "asterisco"…) e ajustes manuais em `audio/<idioma>/ajustes.json`. Hoje: ~248 falas, ~28 mil caracteres. Falas com valor calculado na hora são marcadas como "dinâmica" e não se gravam.
- **Nunca** clonar voz de pessoa real sem autorização por escrito.

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
-- Módulo 3 (seedFinanceiro; visíveis só a partir de Inspetor Analítico, rank 3):
CREATE TABLE contas_bancarias (id INTEGER PRIMARY KEY, banco TEXT NOT NULL, agencia TEXT NOT NULL, numero TEXT NOT NULL,
                       cpf_titular TEXT NOT NULL REFERENCES pessoas(cpf));
CREATE TABLE transferencias (id INTEGER PRIMARY KEY AUTOINCREMENT, conta_origem INTEGER NOT NULL REFERENCES contas_bancarias(id),
                       conta_destino INTEGER NOT NULL REFERENCES contas_bancarias(id), valor REAL NOT NULL,
                       data_hora DATETIME NOT NULL, descricao TEXT);
```
**Tabelas por patente:** `TABELAS` em `js/ui/banco.js` tem `rankMin`/`patente`. Tabela não liberada não aparece no Dicionário nem nas sugestões de erro, e consultá-la (terminal ou prova) dá "Acesso negado… liberada para Inspetor Analítico", **sem** Corregedoria. A promoção chama `atualizarSchema()`.

**Dados financeiros (`seedFinanceiro`):** ~44 contas e 220 transferências aleatórias de 01/09 a 12/10/2026, com **PRNG próprio (seed 2042)**: não mexem nos dados de `buildSeedSQL`. As transferências aleatórias **evitam a faixa de R$ 8.500 a R$ 10.500**, reservada para os depósitos fracionados plantados do caso de lavagem (Sprint 4). Registros plantados devem ser acrescentados **depois** dos aleatórios. Valores em reais com centavos (`REAL`).

**Plantado para o Ato II (Módulo 3):** 8 laranjas (idosos de Piedade e Itu, acrescentados ao fim de `pessoas`), as contas deles (`aberta_em` entre 15/09 e 01/10/2026), a conta da Denise (`48211-6`), 14 depósitos em espécie (`conta_origem` NULL, "DEPÓSITO EM ESPÉCIE") e 14 repasses de R$ 9.000–9.999 para a Denise, todos em 13/10. `contas_bancarias` ganhou `aberta_em`; `conta_origem` aceita NULL. Fatos em `F` (`contaDenise`, `contasLaranja`, `laranjas`, `soma13`, `nSemOrigem`, `somaEspecie`…). Regra: só os plantados caem na faixa de R$ 8.500–10.500, e o padrão HAVING aponta uma conta só (testado).

**Garantia:** `tests/jogo.test.js` guarda a impressão digital (contagem + hash) das quatro tabelas originais. Se ela mudar, alguma alteração no gerador mexeu em dados de que o enredo depende.
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

- **Catraca:** Roberto "Beto" Silva saiu às **16:40:12** em 12/10 (resposta do dilema do Beto). Existe uma "Roberta Silva Lima" de propósito, para confundir buscas com LIKE.
- **Regra do gerador:** radares aleatórios no Km 18 entre 22:40 e 23:20 de 12/10 ficam com no máximo 115 km/h, para não criar suspeitos acidentais. **Ao adicionar dados aleatórios, garanta que eles não quebram nenhum enigma.**
- **Atenção:** mudar a ordem das chamadas ao PRNG em `buildSeedSQL` muda todos os dados aleatórios. As validações por `F` se adaptam, mas textos que citam números (ex.: "48 veículos") podem ficar errados. Prefira acrescentar novos dados **depois** dos existentes.

---

## 6. Os treinamentos guiados

Cada conceito novo passa por um treinamento com a Célia no painel do DB-Investigator, **antes** do caso que o cobra. Hoje existem três:

| id | Arquivo | Antes do | Passos | Ensina |
|---|---|---|---|---|
| `m1` | `treinamento/modulo1.js` | BO 1001 | 14 | SELECT, FROM, *, DISTINCT, AS, LIMIT |
| `m2-filtros` | `treinamento/modulo2-filtros.js` | BO 1002 | 12 | WHERE, aspas simples, ordem das partes, coluna que identifica, Explique, LIKE e %, AND, conferir pista letra por letra |
| `m2-intervalos` | `treinamento/modulo2-intervalos.js` | BO 1003 | 9 | > < >= <=, BETWEEN (número e data/hora), ORDER BY, IN |
| `m3-agregacao` | `treinamento/modulo3-agregacao.js` | BO 1004 | 13 | COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING |
| `m3-nulos` | `treinamento/modulo3-nulos.js` | BO 1005 | 6 | NULL, COUNT(coluna), IS NULL, COALESCE |

**Como funciona:**
- `registrarTreino({id, titulo, passos, aoConcluir})`; o caso declara `treino: 'id'`.
- **Regra única (`verificarTreinos`)**: quando um caso vira o caso ativo e o treinamento dele não está em `S.treinosFeitos`, o treinamento começa. Ela roda ao entrar no jogo, depois de promoção e depois de fechar um caso. Assim um save antigo que já está no meio do BO 1002 também recebe o treinamento.
- `aoConcluir` diz o que acontece no fim (liberar apps, abrir o BO, fala da Célia).
- `anotacoes: {arquivo, texto}`: a "cola" da Célia sobre o treinamento. Aparece em **Arquivos › Anotações** para todo treinamento em `S.treinosFeitos` (inclusive de saves antigos). Escrever como resumo para consultar no meio do BO, com exemplos que não entregam respostas.
- **Histórico**: o painel mostra "Rever falas anteriores" com os passos já feitos do treinamento ativo (só leitura; não deixa voltar e refazer). O rótulo de cada passo é o campo `tema`, obrigatório em todo passo (há teste).
- Migração: saves de antes do Sprint 2 (sem `S.treino`) são convertidos em `load()` por `migrarTreino()`: no meio do `m1` continua do mesmo passo; quem já terminou ganha `treinosFeitos: ['m1']`. A chave `SAVE_KEY` não mudou.
- **Regra de conteúdo:** treinamento ensina com **outros dados**. Nunca usar os valores que resolvem o BO seguinte nem as respostas da prova (há teste que proíbe `FTR`, `'prata'`, `Km 18`, `Itu`/`Salto`, `Dom Aguirre` etc. nos treinos do Módulo 2).
- Validação dos passos: `bate(R, "SELECT * FROM … WHERE …")` (o jogador trouxe exatamente essas linhas, com qualquer subconjunto de colunas), `falta(R, 'coluna')`, `ordenado(R, 'coluna', desc)`. Nunca contagem de linhas sozinha.
- Testes: todo passo precisa da resposta esperada. Passos `mold`/`free` têm `solucao`; a peça certa do `slot` tem `certo: true`. O teste do Node confere que cada resposta passa no `ok` e que o molde sem preencher não passa; o de navegador joga todos os treinamentos pela interface (`jogarTreino`).

Cada passo é um objeto com `type`:

| type | Comportamento | Campos |
|---|---|---|
| `msg` | Texto e botão de continuar. Editor travado. | `text`, `extra` (HTML ilustrativo), `text2`, `btn` |
| `run` | Consulta pronta e travada; o jogador só executa. | `sql`, `spot`, `point`, `ok(R)`, `after` |
| `explain` | O jogador precisa clicar em "Explique esta consulta". | `spot`, `point`, `after` |
| `predict` | Múltipla escolha **antes** de executar; Executar fica bloqueado até acertar. | `sql`, `q`, `opts[{t,ok,fb}]`, `ok(R)`, `after` |
| `slot` | Molde com `___` e peças clicáveis (algumas erradas de propósito). | `template`, `chips[{t,bad,certo}]`, `ok`, `miss(R,k)`, `after` |
| `blocks` | Peças embaralhadas para clicar na ordem certa. | `pool`, `answer`, `wrong[]`, `ok`, `after` |
| `mold` | Molde editável; o jogador digita só uma parte (a lacuna `___` fica selecionada ao clicar; botão Voltar o molde). | `template`, `solucao`, `ok`, `miss(R,k)`, `after` |
| `free` | Editor vazio, escrever do zero, com 2 dicas opcionais. | `solucao`, `hints[]`, `hintBtns[]`, `ok`, `miss(R,k)`, `after` |
| `final` | Último passo: resumo e botão que chama `aoConcluir`. | `text`, `btn` |

- `after`: texto de reforço mostrado ao acertar, com botão Continuar. Aceita `{n}` (total de veículos), `{cores}` (cores distintas) e `{chave}` (valor de `F.chave`; lista vira o tamanho dela).
- `miss(R, k)` e `wrong[]`: o `k` é quantas vezes o jogador já errou naquele passo. Use `esc(k, [msg1, msg2])` para **escalonar**: a bronca fica mais firme e a ajuda fica mais concreta.
- `spot` + `point`: a seta amarela aponta para o elemento (`#runBtn`, `#explBtn`).
- **Para um módulo novo**, crie `treinamento/moduloN-assunto.js`, declare `treino` no caso e acrescente a tag no `index.html`. A cada módulo, menos degraus: começar no `predict` ou no `slot`, e ter sempre um `free` no fim.

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

> Segredos e arcos de cada personagem: `docs/historia.md`, seção 3. A Célia **nunca** é a vilã (regra 4 da bíblia).

### Célia Moura, supervisora do DTI
Veterana ("macaca velha"), 22 anos de DTI, desconfiada, ensina do jeito dela e dá esporro. Regras de escrita, **obrigatórias**:
1. **Bronca na atitude, nunca na ignorância.** Ela pega no pé de quem chuta, pula instrução ou tenta atalho. Para quem não sabe, ela ensina, mesmo resmungando.
2. **A primeira frase é a personalidade; a segunda é sempre a instrução útil.** A piada nunca pode esconder o que fazer.
3. **Elogio raro e seco:** "Não fez mais que a obrigação", "Hm. Funcionou."
4. **Erro repetido:** a bronca sobe de tom **e** a ajuda fica mais concreta.
5. **Sem palavrão** (o jogo deve servir para escolas e faculdades). Use "pelo amor de Deus, recruta", "ô, criatura", "na minha época".
6. Ela trata o jogador de "recruta", usa "tu/teu" às vezes, e fala com metáforas de repartição ("tabela é gaveta").

### Roberto "Beto" Silva, investigador da baia 05
Malandro simpático que vive pedindo favor. Ele é a fonte dos **dilemas morais** (ex.: pedir para alterar o ponto) e dos **serviços** (treino livre, "Tem serviço?"). Não deve pisar no espaço da Célia: ele é charmoso e pidão, ela é a autoridade.

### Outros já citados
Jairo Teixeira (investigador impaciente), Marina Okada (perita), Paulo Henrique Dias (delegado, assina ou indefere mandados).

---

## 9. Medidores e regras de risco

| Medidor | Sobe com | Efeito |
|---|---|---|
| Metas | +30 por caso fechado, +10 pelo dilema do Beto (horário certo), +10 por pedido de colega, +5 por serviço do Beto (só os 3 primeiros de cada turno) | hoje só indicador |
| Corregedoria | mandado errado (+15 a +20), resposta errada ao Beto (+15), aceitar fraude de ponto (+15), tentar escrever no banco (+5, só na 1ª vez), relatório errado (+5) | 100% = demissão |
| Relógio | avança ao fechar casos | modo "treino", não pune |

**Decisões:**
- O relógio **não pressiona** nos Módulos 1 e 2. Pressão de tempo só a partir do Módulo 3.
- A prova **não** mexe na Corregedoria.
- **Patente não cai** (decisão provisória; confirmar com a May).

---

## 10. Como evoluir o jogo (roadmap em ordem de prioridade)

### Status dos sprints
| Sprint | Tema | Status |
|---|---|---|
| — | Refatoração: arquivo único → `css/` + `js/` | ✅ concluído (14/10/2026) |
| 1 | Consolidar e testar com gente real (Prioridade 1) | ✅ concluído (15/10/2026) |
| 2 | Escada guiada no Módulo 2 (Prioridade 2) | 🟡 implementado; playtest com profissional de BI (Mayumi, 16/10): fluido, BO 1002 em 2,5 min, "quer muito mais". **Falta validar com iniciante.** |
| 3 | Infraestrutura do Módulo 3 | ✅ dados, Explique, diagnóstico e "cada módulo é um dia" (17/10/2026). Relógio **não** pressiona por enquanto (decisão: esperar dados de iniciantes) |
| 4 | Conteúdo do Módulo 3 | ✅ implementado (17/10/2026): treinos `m3-agregacao` e `m3-nulos`, BOs 1004 e 1005, prova 3, Inspetor Analítico, pedido do Jairo; falta playtest |
| — | Serviços do Beto (treino livre com domínio por conceito) | ✅ implementado (17/10/2026): Módulos 1–3, 12 conceitos, 21 serviços (118 variações); falta playtest |
| — | Vozes dos personagens (base técnica) | ✅ preparado (17/10/2026): tocador, manifesto, roteiro `npm run vozes`; gravar depois (`docs/vozes.md`) |
| 5 | Módulo 4 (JOIN) | ✅ implementado (18/10/2026): treinos `m4-join` e `m4-left`, BOs 1006 e 1007, prova 4, Agente Especial, quinta-feira, escolha da Marina, galpão vazio; falta playtest |
| 6 | Módulo 5 (escrita, transações) | — |
| 7 | Módulo 6 (avançado) | — |
| 8 | Prova final e certificado (Prioridade 7) | — |
| — | Arte dos personagens (transversal, ver "Arte" abaixo) | — |

### Prioridade 1 — validar com gente real ✅
Colocar **2 ou 3 pessoas que nunca programaram** para jogar, sem ajudar, e anotar onde elas param. Roteiro em `docs/playtest.md`; sessões em `docs/playtest/sessoes/` (telemetria `.json` + relatório `.md`).

**Fechamento do Sprint 1 (15/10/2026):** ferramentas prontas (teste de navegador, telemetria + painel `?teste`, empacotador, roteiro). Playtests: um iniciante em desktop com telemetria completa (`2026-10-15-dayvison`) e uma sessão parcial no celular. Resultado: o treinamento do Módulo 1 flui (~13 min, 1 tropeço); o **BO 1002 custou ~49 min** a um iniciante, todos os travamentos de *estrutura* da consulta. Os 2 ou 3 playtests restantes com quem nunca viu o jogo ficam para **depois do Sprint 2**: hoje eles só confirmariam o gargalo já conhecido. Para playtest (inclusive no celular): https://dayvisonresende.github.io/POL-os/?teste

**Achados de playtest (registro):**
| Data | Onde | Problema | O que foi feito |
|---|---|---|---|
| 14/10/2026 | Treino 11 e 12 (`mold`) | O jogador digitava a resposta e sobrava `Veiculo___`; não percebia que precisava apagar os tracinhos. | A lacuna `___` fica selecionada ao clicar no editor (`tutMarcarLacuna`), então digitar substitui. Textos da Célia ajustados. |
| 14/10/2026 | Treino 11 (`mold`), celular | O jogador apagou o editor inteiro e ficou sem o molde, sem jeito de recuperar. A Célia mandava "ler a mensagem vermelha embaixo do editor", que no celular fica atrás do teclado. | Molde nunca se perde: botão **Voltar o molde**, Limpar devolve o molde, executar vazio e reabrir o jogo restauram. A tradução do erro aparece dentro da fala da Célia, e o painel rola até ela. |
| 14/10/2026 | BO 1002, tarefa 1 (jogador iniciante) | `SELECT cor WHERE "prata" FROM veiculos;` recebia só "o banco se perdeu perto de FROM". A dica 1 não ensinava o formato, então o único caminho era ver a consulta pronta. Corrigida a ordem, `WHERE "prata"` voltava vazio sem dica; `cor = "prata"` funcionava por sorte (SQLite aceita aspas duplas como texto; PostgreSQL e SQL Server não). | `js/core/sql/diagnostico.js` lista todos os problemas de estrutura de uma vez (erro e resultado vazio) e avisa quando a consulta "funcionou por sorte". Dicas dos BOs ganharam um degrau intermediário: o **formato** com nomes genéricos (conceito → formato → consulta). O Explique entende aspas duplas. |
| 14/10/2026 | BO 1002, tarefa 1 (jogador iniciante) | `SELECT cor FROM veiculos WHERE cor = 'prata';`: filtro certo, mas só a coluna cor (nove vezes "prata"). A tarefa não marcou e o jogo ficou calado. A dica do formato ("troque tabela, coluna e valor") induziu a trocar o `*` também. | Tarefas ganharam `quase(R)` com mensagem "Quase lá" (todas as tarefas de 1002 e 1003). A dica do formato diz "mantenha o `*`". |
| 14/10/2026 | BO 1002, tarefa 2 (jogador iniciante) | `SELECT * FROM veiculos LIKE placa = 'FRT';` (sem WHERE, LIKE fora do lugar e com =, sem %, letras FTR trocadas) recebia só "o banco se perdeu perto de placa". A grade continuava mostrando o resultado da consulta anterior, como se fosse desta. A dica antiga de "LIKE sem %" sugeria literalmente `'FTR%'` (a resposta). | O diagnóstico aponta WHERE ausente, LIKE fora do lugar e LIKE sem % (com o texto do próprio jogador). Resultado vazio com LIKE manda conferir letra por letra com a pista. Erro limpa a grade. |
| 14/10/2026 | DB-Investigator | Ao selecionar texto no editor, o texto sumia: a seleção da caixa de digitação (camada de cima, texto invisível) era opaca e cobria o texto colorido da camada de baixo. | `--code-sel` virou translúcido. Regra: **a cor de seleção do editor tem que ter transparência.** |
| 15/10/2026 | BO 1002 (telemetria da sessão do Dayvison, ~49 min no BO) | (1) Com duas consultas no editor e a última vazia (`… 'Preto'`), o jogo mostrava o resultado da **primeira** como se fosse da última; o jogador executou 14 vezes em 6 s achando que nada acontecia, e a dica de minúsculas nunca apareceu. (2) `placa = 'FRT'` voltava vazio sem dica (3×). (3) 6 min parado depois da última dica da tarefa 3, que começava com `… WHERE`. (4) Telemetria: o campo `tipo` do passo do treino sobrescrevia o tipo do evento. | (1) `executarSQL` roda consulta por consulta; o resultado mostrado é sempre o da última, mesmo vazio, com aviso "o editor tem N consultas". Selecionar um trecho e Executar roda só ele. A barra de status mostra a hora da execução e pisca. (2) Dica para `=` com valor parcial (usar LIKE). (3) Última dica de cada tarefa é sempre a consulta completa. (4) Campo renomeado para `degrau`; `tipo` virou reservado. |
| 15/10/2026 | Treino `m2-intervalos`, passo do BETWEEN com data e hora (Dayvison) | Travou: o passo pedia para escrever as duas pontas inteiras (`'2026-10-12 18:00:00' AND '2026-10-12 20:00:00'`) logo depois de só ter *visto* BETWEEN com números. O conceito pulou do "ver" direto para o "escrever". O erro de `BETWEEN ;` dizia só "o banco se perdeu perto de ;". | Passo novo de **prever** com uma consulta pronta de data e hora. O molde passou a ter **duas lacunas pequenas** (`'2026-10-12 ___'`), só as horas; clicar seleciona a lacuna seguinte. O diagnóstico acusa "BETWEEN sem as duas pontas". Passos alterados entre versões reiniciam ao reabrir o jogo (`tutChavePasso`). |
| 16/10/2026 | PolíciaZap (Mayumi) | Com a janela aberta, mensagens novas chegavam sem sinal; com várias, não dava para saber onde tinha parado de ler. | Divisória "N mensagens novas", destaque, rolagem até a primeira não lida, botão "↓ Nova mensagem", horário em cada mensagem; lida só em primeiro plano (seção 4.6.1). |
| 15/10/2026 | Treinamentos (Dayvison) | Não dá para reler as falas anteriores da Célia; quem se perde trava. | **Histórico** no painel da Célia ("Rever falas anteriores", recolhido, só leitura, rótulo = `tema` do passo). **Anotações da Célia**: cada treinamento tem um resumo (`anotacoes`) que aparece em Arquivos › Anotações ao ser concluído, também em saves antigos. Telemetria: `releu` e `anotacoes`. |
| 16/10/2026 | Jogo completo (Mayumi, `docs/playtest/sessoes/2026-10-17-mayumi`) | (1) `order by desc` sem coluna: o SQLite lê `desc` como coluna e o jogo mandava pôr entre aspas. (2) Consultou a catraca certo e tomou +15% do Beto: formatos como `16h40m12s` eram recusados. | (1) Diagnóstico de ORDER BY sem coluna. (2) Beto aceita qualquer formato do horário certo (`horarioBateBeto`) e a resposta vai para a telemetria. |
| 18/10/2026 | Jogo até o BO 1004 (**primeiro iniciante de verdade**, `docs/playtest/sessoes/2026-10-18-iniciante-1.md`) | (1) Fonte desenhava `>=` como `≥`. (2) Passo do ORDER BY pedia ASC/DESC sem ter explicado. (3) BO 1003: ~50 min, 82 consultas; `= '…' BETWEEN …` (sem coluna) recebia a dica errada "tente LIKE"; ORDER BY usado como filtro (15×) e `AND ORDER BY` sem aviso; nunca abriu as dicas e foi ao ChatGPT. (4) Autocompletar trocou `Ve` por `veiculos` depois do AS. | Ligaduras desligadas; ORDER BY, ASC/DESC, `>=`/`<=` explicados; diagnósticos de BETWEEN sem coluna, `AND ORDER BY`, ORDER BY com comparação, condição solta; dica do LIKE só se o texto não existir; **empurrão para as dicas** após 3 tentativas sem avanço; autocompletar sem sugestão após AS e desligado nas lacunas. |
| 14/10/2026 | DB-Investigator | Erro de digitação no início (`SELEC`) era tratado como tentativa de escrita: +5% de Corregedoria. (Achado pela telemetria.) | `isReadOnly` só bloqueia comandos que o SQLite reconhece como escrita; o resto vira erro traduzido. |

### Prioridade 2 — escada guiada no Módulo 2
**Lacuna conhecida:** WHERE, LIKE, BETWEEN, IN e ORDER BY são cobrados nos BOs 1002 e 1003 sem nunca terem passado pela escada (ver → prever → peça → blocos → molde). Criar mini-tutoriais da Célia no começo dos BOs 1002 e 1003, mais curtos que o do Módulo 1 (começando no degrau de prever ou de trocar uma peça).

**Requisitos tirados do playtest do Sprint 1** (o mini-treinamento do BO 1002 precisa cobrir cada um destes, porque foi exatamente onde o iniciante travou):
1. A **ordem das partes**: `SELECT … FROM … WHERE …` (ele escreveu WHERE antes de FROM).
2. O WHERE é uma **comparação completa**: coluna, operador, valor (ele escreveu só `WHERE "prata"`).
3. Texto entre **aspas simples** (ele usou duplas).
4. O que o SELECT mostra precisa **identificar** o resultado: filtrar por cor e mostrar só a cor não diz quais carros são.
5. O **LIKE** entra no lugar do `=`, entre a coluna e o padrão, e precisa do **%** para "começa com".
6. Conferir o **valor da pista letra por letra** (FTR × FRT custou 12 min).
7. Lembrar do **Explique** quando travar: não foi usado nenhuma vez fora do tutorial.
- ✅ Motor generalizado (seção 6), treinamentos `m2-filtros` (cobre os 7 requisitos acima + AND) e `m2-intervalos` criados, saves antigos migrados.
- ⏳ **Falta:** playtest com 2 ou 3 pessoas que nunca viram o jogo, comparando o tempo no BO 1002 com os ~49 min da sessão de referência (`docs/playtest/sessoes/2026-10-15-dayvison`). Meta: menos de 20 min no BO 1002 sem ver a consulta pronta.

### Prioridade 3 — Módulo 3 (COUNT, SUM, AVG, MIN, MAX, aritmética, GROUP BY, HAVING)
- Patente ao final: **Inspetor Analítico**.
- ✅ **Infraestrutura (Sprint 3, 15/10/2026):** tabelas `contas_bancarias` e `transferencias` (seção 5), restritas a Inspetor Analítico; Explique traduz COUNT/SUM/AVG/MIN/MAX (inclusive COUNT DISTINCT), GROUP BY e HAVING; diagnóstico explica agregação no WHERE e HAVING sem GROUP BY e avisa "funcionou por sorte" quando há coluna solta (fora do GROUP BY e fora de agregação), que o SQLite aceita e PostgreSQL/SQL Server recusam.
- ⏳ **A decidir com o Dayvison antes de implementar:** "cada módulo é um dia de expediente" (login com data nova e e-mail da chefia) e o relógio passando a pressionar.
- Caso sugerido: **lavagem de dinheiro com depósitos fracionados** (muitos valores pouco abaixo de R$ 10.000 para a mesma conta), resolvido com `GROUP BY conta_destino HAVING COUNT(*) > N`.
- Ligar ao enredo: o dinheiro da carga roubada no BO 1003.
- A partir daqui o relógio do expediente pode começar a pressionar.

### Prioridade 4 — Módulo 4 (JOIN)
**Feito: parte técnica (17/10/2026) e conteúdo (18/10/2026).**
- **Dados** (`seedModulo4` em `js/core/banco/seed.js`, PRNG 5042, depois de todo o resto): `empresas` (cnpj, razao_social, cidade, aberta_em, cpf_responsavel), `imoveis` (id, tipo, endereco, bairro, cidade, referencia, cnpj_locatario, alugado_em), `notas_fiscais` (id, numero, cnpj_emitente, cnpj_transportadora, data_emissao, valor_total), `itens_nota` (id, nota_id, produto, quantidade, valor_unitario). Bloqueadas até a quinta (`diaMin:2`) ou a patente **Agente Especial** (`rankMin:4`).
- **Plantado (Ato III):** a Hilux (KZX9B21) passou no Km 92 às 23:41 → dono no papel: **Valdemar** (laranja) → empresa de fachada **VS Armazéns Gerais ME** (aberta em 08/09/2026, no nome dele) → **galpão na Raposo Tavares, Km 93**, alugado em 30/09. Uma consulta com 5 tabelas (`F.Q4CADEIA`) chega a um imóvel só. Distratores: outros 4 galpões entre o Km 90 e o 95, de empresas comuns (alugados há anos) ou vagos.
- **A soma que infla (★):** a carga da Transportadora Central em 12/10 são 3 notas, **R$ 380.000** (`F.valorCarga`, bate com o relato do BO 1004). `SUM(n.valor_total)` depois do JOIN com `itens_nota` dá **R$ 1.879.350** (`F.somaInflada`).
- **LEFT JOIN (★):** imóveis sem inquilino (`cnpj_locatario` NULL); contas que nunca receberam (já existiam).
- **Ferramentas:** Explique entende `JOIN`, `LEFT JOIN`, apelidos (`v.placa`), vírgula no FROM e JOIN sem ON; avisos de JOIN sem ON (o SQLite roda e combina tudo com tudo), apelido não definido, coluna que não existe na tabela do apelido, coluna ambígua (diz em quais tabelas está), ON ligando colunas que não combinam (resultado vazio; usa as notas "aponta para"); **Mapa das tabelas** (`js/apps/mapa.js`, botão no Dicionário: só as tabelas liberadas, setas das notas "aponta para"; no celular vira lista com "→ tabela.coluna"); autocompletar depois de `apelido.`; Organizar quebra JOIN e recua o ON.
- **Conteúdo (18/10/2026):**
  - **Quinta-feira** (`DIAS[2]`): chegada e e-mail do delegado liberando as quatro bases e apresentando o Mapa das tabelas.
  - **Treino `m4-join`** ("Cruzar tabelas"): por que JOIN, primeiro JOIN, JOIN sem ON (prever: 48 × 55), apelidos, a regra do ON (slot), escolher colunas, Explique, três tabelas (radar → carro → dono), JOIN do zero. Anotações `06_join.txt`.
  - **BO 1006, "O segundo radar"**: Hilux nos radares → dono (Valdemar) → empresa no nome dele → imóvel alugado → tudo numa consulta (5 tabelas). Mandado de busca: endereço do galpão + empresa (galpão vizinho é recusado com explicação). Ao encerrar: Célia ("bico fechado"), Jairo ("22h, pela Raposo, nem no Zap") e a **pergunta da Marina** (`js/historia/operacao.js`): o jogador escolhe contar ou não; fica em `S.marinaOperacao` ('contou'|'recusou') e na telemetria (`dilema`, quem: marina). Nenhuma escolha evita o galpão vazio.
  - **Treino `m4-left`** ("Quem fica de fora"): LEFT JOIN (pessoas sem carro), "quem não tem" (slot IS NULL), a soma que infla (NF 72143, nota comum de setembro com 4 itens: 24.919 → 99.676), somar do lado certo, "quem não tem conta" do zero. Anotações `07_left_join.txt`.
  - **BO 1007, "O tamanho do prejuízo"**: notas da carga pelo nome da transportadora (JOIN com empresas), itens, **valor total** (a soma inflada tem resposta própria da Célia), unidades por produto (JOIN + GROUP BY), imóveis da Raposo com LEFT JOIN (inclusive vazios) e só os vazios. Relatório: valor (380 mil; a inflada é recusada com explicação) + quantos vazios.
  - **Prova 4** e patente **Agente Especial** (`RANKS[4]`): ao promover, fim do dia e o gancho da noite (relógio vai a 23:10): Jairo "Galpão vazio… Alguém avisou"; Célia "Só cinco pessoas sabiam…".
  - **Guia**: verbetes `join`, `apelido`, `jointres`, `leftjoin`, `sempar`, `somainfla`. **Serviços do Beto**: conceitos `join` e `leftjoin` e 4 serviços (dono de carro único, passagens por cidade, quem não tem carro, cidade com mais donos de uma cor). `SERV_FORA.pessoas` exclui os personagens do enredo das respostas.
  - Testes: `Módulo 4 · quinta-feira completa` (navegador) e o teste que impede os treinos do Módulo 4 de citar galpão, Hilux, Valdemar, empresas, imóveis ou a carga.
- Agora o JOIN tem motivo: `leituras_radar → veiculos → pessoas → enderecos` (criar tabela de endereços/galpões para o esconderijo do bando).
- Mostrar ao jogador que as 3 consultas do BO 1003 viram **uma só**.
- `explainSQL` **não entende JOIN** ainda; precisa ser estendido. `translateError` já trata `ambiguous column`.
- Considerar um mini diagrama de tabelas (ERD) no Dicionário de Dados.
- **★ A soma que infla no JOIN** (1 para N): pergunta de entrevista mais comum de agregação com JOIN. Tarefa em que o total "impossível" denuncia o erro (ver `docs/historia.md`, seção 11).

### Prioridade 5 — Módulo 5 (INSERT, UPDATE, DELETE, transações)
- A promoção a Perito Forense libera a escrita: mudar `isReadOnly` para depender da patente.
- Implementar o **snapshot**: `db.export()` ao abrir o caso e `new SQL.Database(snapshot)` no botão "Restaurar ponto de backup".
- Cena-chave: **UPDATE sem WHERE** altera o ponto de todos os funcionários. A Corregedoria dispara e a Célia dá o maior esporro do jogo. Ensinar `BEGIN` / `ROLLBACK` como salvação.
- Retomar o dilema do Beto: agora o jogador **pode** alterar o ponto. Consequências reais.
- Atenção: comandos de escrita alteram `F`. Recalcular os fatos ou usar o snapshot nas validações.

### Prioridade 6 — Módulo 6 (texto, datas, CASE, subqueries, CTE, window functions)
Limpeza de dados sujos (`TRIM`, `UPPER`, `REPLACE` em placas com traço e nomes com espaços), reconstituição de rota com `LAG`/`LEAD` em antenas de celular, dossiê final com CTEs.
Lacunas de entrevista do módulo (★): `NOT IN` com NULL × `NOT EXISTS`, e `CASE WHEN` dentro do `SUM`/`COUNT` (linhas viram colunas).

### Prioridade 7 — Prova final e certificado
**Pedido do Dayvison (15/10/2026):** no fim do jogo, o jogador gera um **certificado** de que sabe SQL, com **o nome dele**, em duas versões: uma **para imprimir** e uma **imagem para redes sociais**. Só libera depois de **concluir o treinamento** e passar num **teste mais difícil**, que mostre que ele sabe o que está fazendo.

Requisitos:
- O jogador digita o nome que vai no certificado. O nome fica só no navegador, como o resto do progresso.
- **Prova final** mais difícil que as da ACADEPOL: todas as questões são de escrever consulta do zero, sem dicas nem molde, cobrindo todos os módulos concluídos. Corrigida pelo resultado (pilar 3), com sorteio de um banco maior de questões, nota mínima alta e refação com outro sorteio.
- Versão para imprimir: página A4 paisagem. Atenção à regra técnica 11: artifact não permite `window.print()`; lá, oferecer download em PDF ou PNG.
- Versão para redes: imagem PNG gerada em canvas (1200×627 para LinkedIn; 1080×1080 para Instagram), para baixar.

**Sugestões a decidir com o Dayvison** (ver conversa de 15/10/2026):
- O certificado **não pode parecer documento oficial**: nada de "Polícia Civil", "ACADEPOL" ou brasão no certificado exportado. Deve dizer que é de um jogo educativo (SISP). Motivo: uma imagem nas redes com "ACADEPOL" pode ser lida como credencial policial real.
- Chamar de **"Certificado de conclusão"** e listar **o que a pessoa sabe fazer** (competências), sem prometer equivalência a curso e sem carga horária inventada. O documento já removeu promessas exageradas (seção 11).
- **Certificados por nível**, em vez de um só no fim: Nível 1 (consultas e filtros, Módulos 1–2), Nível 2 (agregação e JOIN, 3–4), Nível 3 (escrita e avançado, 5–6). Dá valor desde já, porque hoje o jogo só vai até o Módulo 2.
- **Código de verificação** no certificado, conferível numa página do jogo. Limite honesto: sem servidor, qualquer verificação local pode ser forjada por quem souber programar; o código serve contra erro de digitação, não contra fraude.
- **Caderno de consultas**: exportar as consultas que o jogador escreveu para resolver os casos, como portfólio para mostrar em entrevista. Prova mais que um certificado.
- **Ponte para o mercado** na prova final: mostrar a mesma consulta em PostgreSQL e SQL Server (base: `docs/dialetos-sql.md`).

### Logo
`pol-os.png` (raiz, original 1254×1254 com fundo transparente, ~3 MB): escudo "POL·OS · Sistema de Operações e Investigações", lema "Analisar | Investigar | Esclarecer". O jogo usa versões leves em `img/` (17/10/2026):
- `img/logo.webp` (360 px de altura, ~35 KB): tela de login, acima de "SISP · ESTAÇÃO DTI-04". O `npm run empacotar` embute como `data:`.
- `img/compartilhar.jpg` (1200×630, ~80 KB): prévia do link no WhatsApp/LinkedIn (`og:image`, com endereço absoluto do GitHub Pages; **trocar se o domínio mudar**).
- O favicon continua o escudo em SVG: o texto da logo não se lê em 16–32 px. Ícones de loja/PWA (512 px), quando chegar a hora, usam só o escudo central, sem texto.
- Nome: a logo diz **POL·OS** (com ponto); a interface diz POL-OS/Pol-OS. Padronizar quando definir o nome de loja.

### Arte dos personagens
Imagens em `Images/Arco1/` (14/10/2026), estilo quadrinho noir, 1254×1254 PNG (~2,4 MB cada): Beto, Estagiária e Estagiário Analista de Dados. Ajustes combinados para o futuro:
- **Beto:** o distintivo diz "DETECTIVE BETO" (inglês; o cargo é *Investigador*). O fundo diz "7º DP" (no jogo ele é do DTI, em Sorocaba).
- **Jogador:** os crachás dizem "Estagiário(a) Analista de Dados", e a patente do jogo é "Recruta" e depois "Estagiário do Arquivo". Alinhar um dos dois.
- **Falta a Célia**, a personagem com mais falas (hoje é "CM" num quadrado). Prioridade da arte.
- **Para entrar no jogo:** converter para WebP em 256 px (~20–30 KB cada; hoje cada PNG pesa mais que o jogo inteiro), em `img/personagens/` com nomes sem espaço nem acento (`beto.webp`, `jogador-f.webp`, `jogador-m.webp`). Os originais grandes ficam fora do que é publicado.
- **Onde usar:** avatares do PolíciaZap, cabeçalho do treinamento (Célia), login, menu iniciar, tela de promoção, relatório e certificado.
- **Decisão pendente:** ter estagiário e estagiária sugere escolha de personagem. Opções: (1) escolha no login com texto flexionado em tudo; (2) escolha só da imagem, com falas neutras; (3) um personagem só. Hoje os textos estão no masculino ("Estagiário do Arquivo", "Investigador Júnior", "sozinho").

### Depois da campanha: casos da cidade (18/10/2026)
Projeto completo em **`docs/casos-da-cidade.md`**: cerca de 100 casos avançados numa cidade grande fictícia, para quem já sabe SQL. Fórmula do caso (Crime + Rastro + Técnica + Armadilha + Escala + Desfecho), mesa sorteada e semente por jogador, cinco facções (O Livro-Caixa, Os Atravessadores, O Balcão, Os Fantasmas, A Maré) com arcos lineares, finais (completo, parcial, fracasso e, só nos chefões, moral), regra para escolher nomes que não lembrem nada real, ficha do caso em branco e a lista de imagens (~85–95). **Só depois dos Módulos 5 e 6**, começando por um piloto de 10 casos.

**Ferramentas de produção:** `geradores/index.html` (pasta temporária, fora do jogo: o jogo não carrega nada dela) reúne 14 geradores com semente: pessoas, rotina, bairros, empresas, veículos, contas, nomes de casos, fichas, facções, finais, verificador de nomes e documentos, sujador de dados, prompts de imagem no estilo do Beto e a lista de produção. CPF e CNPJ saem sempre com o dígito errado. Testes em `tests/geradores.test.js`.

### Pendências guardadas para depois (16/10/2026)
- **Bíblia da história no repositório público:** `docs/historia.md` contém o final do jogo e o repositório do GitHub parece público (é a fonte do GitHub Pages). Decidir: deixar fora do repositório (`.gitignore`), mover para um repositório privado ou aceitar o risco de spoiler. **Até decidir, não commitar `docs/historia.md`.**
- **Nomes reais nos relatórios de playtest** (`docs/playtest/sessoes/`): decidir se troca por apelidos ("jogadora-02"). Nunca registrar empregador ou dados pessoais de playtesters.
- **Revisão profissional:** pedir à Mayumi (profissional de BI) uma opinião sobre o currículo (`docs/historia.md`, seção 11) e o realismo do caso de lavagem do Módulo 3, sem mostrar a bíblia inteira.
- **Playtest com iniciante absoluto** para validar a meta do Sprint 2.
- **Lojas (Flathub, Microsoft Store e outras)** — pedido do Dayvison (17/10/2026). Caminho sugerido: (1) transformar o jogo em **PWA** (manifest + service worker: instalável e offline); a Microsoft Store aceita PWA via PWABuilder; (2) empacotar com **Tauri** (app nativo leve) para o Flathub e outras lojas de desktop. Pré-requisitos: o `sql.js` precisa vir junto do jogo (hoje vem do cdnjs, e loja exige funcionar offline); política de privacidade em página pública (base: `js/conteudo/termo.js`); ícones e capturas; classificação indicativa.
- **Vários idiomas** — ✅ estrutura pronta (17/10/2026): ver `docs/idiomas.md` e a seção 12, regra 12. Interface migrada e traduzida para inglês (`pronto:false`, só com `?idioma=en`). **Falta migrar o conteúdo** (casos, treinamentos, provas, falas, mensagens de SQL) e criar um explicador por idioma.

### Outras melhorias pendentes
- **Domínio próprio (`polos.useconectai.com.br`), adiado (17/10/2026):** o progresso fica no navegador **por endereço**; trocar o domínio faz quem já joga recomeçar do zero (e o endereço antigo passa a redirecionar, sem chance de salvar antes). Antes de ativar: avisar no jogo, com antecedência, para salvar o progresso em arquivo (SISP › Configurações) e carregar no endereço novo; depois de ativar, ligar **Enforce HTTPS** no GitHub Pages. Trocar de domínio uma vez só.
- **Caminho para quem já sabe SQL** (ideia do playtest da Mayumi, profissional de BI): prova de nivelamento no início, que pula os treinamentos dos módulos que a pessoa já domina. O público "do mercado" quer a história e os casos, não o tutorial.
- **Cada módulo como um dia de expediente:** a tela de login abre com data nova, patente nova e um e-mail da chefia com as permissões. Isso substitui a ideia de "fase".
- **Corregedoria suspendendo promoção:** se o medidor estiver alto na prova, exigir um "chamado de redenção" limpo antes de promover. Precisa de conteúdo extra.
- **Banco de questões maior** na ACADEPOL (hoje 5 de múltipla escolha + 3 de escrever por módulo).
- **Áudio das escutas** com Web Audio API (ruído de linha telefônica) + SpeechSynthesis, como previsto no documento original. Hoje a escuta é um .txt.
- ~~**Quadro de Pistas**~~: feito como Caderno do Investigador (seção 4.6.1).
- **Dicas de mercado** (SQLite × PostgreSQL × SQL Server): bloco "FORA DAQUI (no trabalho)" no fim das anotações da Célia. Feito nos Módulos 1 e 2 (17/10/2026); no Módulo 3 nada muda. Novos módulos: seguir a tabela de `docs/dialetos-sql.md`, seção 4, e só quando houver diferença.
- **Filtro de dia inteiro:** decidido manter o `BETWEEN '… 00:00:00' AND '… 23:59:59'` nas tarefas (é o que o jogador aprendeu no Módulo 2 e está certo no jogo). A forma de mercado (`>= 'dia' AND < 'dia seguinte'`) fica como dica nas anotações dos intervalos; como a correção é pelo resultado, as duas formas são aceitas.
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
12. **Idiomas:** todo texto visível passa por `L('texto em português')`, com valores em `{marcadores}` (nunca concatenar frases) e plural por `Lp()`. Conteúdo novo já nasce assim. `npm run i18n` mostra a cobertura; `npm test` barra `L()` sem literal, traduções órfãs e marcadores diferentes. Guia: `docs/idiomas.md`.

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
- **Dilema:** escolha moral com consequência na história (ex.: o Beto pede para alterar o ponto). Acontece uma vez e pode voltar mais tarde no enredo. Código: `js/historia/beto.js`.
- **Pedido:** favor de um colega ligado a um momento da história, que pede uma consulta (ex.: o Jairo e os radares). Acontece uma vez. Código: `registrarPedido`, `js/historia/pedidos.js`.
- **Serviço:** treino livre e repetível com o Beto ("Tem serviço?"), sem enredo, para não esquecer o que aprendeu. Código: `registrarServico`, `js/historia/servicos.js`.
- Evite "side quest" no texto: diga qual dos três é.
- **Recordset:** o conjunto de linhas e colunas devolvido por uma consulta.
