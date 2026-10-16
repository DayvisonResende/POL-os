/* Treinamento "Filtros", antes do BO 1002 (Módulo 2): WHERE, aspas, ordem das partes, coluna que identifica, LIKE, AND.
   Cada passo cobre um travamento real do playtest do Sprint 1 (ver docs/playtest/sessoes/2026-10-15-dayvison.md).
   Regra: nenhum exemplo usa os dados que resolvem o BO 1002 (prata, FTR) nem as respostas da prova do Módulo 2.
   Passos mold/free têm `solucao` (resposta esperada, usada nos testes). */
registrarTreino({id:'m2-filtros',titulo:'Filtros',
 passos:[
 {tema:'WHERE: coluna, operador, valor',type:'msg',btn:'Tô ouvindo',
  text:"<p>Promoção não deixa ninguém mais esperto, recruta. Até agora você abria a gaveta inteira; investigação de verdade é <b>filtrar</b>.</p><p>Pra isso existe o <b>WHERE</b> (\"onde\"). Ele vem <b>depois</b> do FROM e só deixa passar as linhas que batem com a condição:</p>",
  extra:"<div class=\"anat\"><div><code>SELECT *</code><span>mostre tudo</span></div><div><code>FROM pessoas</code><span>da tabela pessoas</span></div><div><code>WHERE</code><span>só onde</span></div><div><code>cidade</code><span>a coluna</span></div><div><code>=</code><span>é igual a</span></div><div><code>'Votorantim'</code><span>o valor</span></div></div>",
  text2:"<p>A condição tem sempre três pedaços: <b>coluna</b>, <b>operador</b> e <b>valor</b>. E a ordem das partes não muda nunca: SELECT, FROM, WHERE. Decora, que eu cobro.</p>"},

 {tema:'Prever um WHERE',type:'predict',sql:"SELECT * FROM pessoas WHERE cidade = 'Votorantim';",
  text:"<p>Coloquei essa no editor. Antes de executar, pensa.</p>",q:'O que essa consulta vai mostrar?',
  opts:[{t:'Só as pessoas que moram em Votorantim, com todas as colunas',ok:true,fb:'Isso. O WHERE deixa passar só as linhas de Votorantim. Executa pra conferir.'},
        {t:'Todas as pessoas, com uma coluna nova chamada Votorantim',fb:'Não. O WHERE não cria coluna nenhuma: ele corta linhas. Pensa de novo.'},
        {t:'A palavra Votorantim, uma vez só',fb:'Isso seria se o SELECT pedisse só a cidade, e com DISTINCT. Aqui é SELECT *, todas as colunas. Tenta de novo.'}],
  ok:function(R){return bate(R,"SELECT * FROM pessoas WHERE cidade = 'Votorantim'")},
  after:"<p>Só gente de Votorantim. O resto do cadastro continua lá; o WHERE só tira do resultado o que não interessa.</p>"},

 {tema:'Aspas simples e minúsculas',type:'slot',template:"SELECT * FROM veiculos WHERE cor = ___;",
  text:"<p>Agora você completa. Quero os carros <b>azuis</b>: escolhe a peça certa pro valor.</p><p>Olha bem as aspas, que é aqui que recruta tropeça.</p>",
  chips:[{t:"azul",bad:"Sem aspas o banco acha que <code>azul</code> é o nome de uma <b>coluna</b>, e não existe coluna azul. Texto vai entre aspas simples."},
         {t:"'Azul'",bad:"Com maiúscula não acha nada: as cores estão gravadas em minúsculas, e pro <code>=</code> <code>'Azul'</code> é diferente de <code>'azul'</code>."},
         {t:"'azul'",certo:true},
         {t:"\"azul\"",bad:"Aspas duplas são pra nome de coluna. Aqui até passa, mas no banco de verdade da polícia dá erro. Texto vai entre aspas <b>simples</b>."}],
  ok:function(R){return bate(R,"SELECT * FROM veiculos WHERE cor = 'azul'")},
  after:"<p>Aspas simples, minúsculas, valor inteiro. Grava isso: é a diferença entre achar o carro e assinar mandado errado.</p>"},

 {tema:'A ordem: SELECT, FROM, WHERE',type:'blocks',pool:['WHERE',"'Sorocaba'",'SELECT','=','pessoas','cidade','FROM','*',';'],
  answer:['SELECT','*','FROM','pessoas','WHERE','cidade','=',"'Sorocaba'",';'],
  text:"<p>Agora monta você, peça por peça: <b>todas as colunas das pessoas que moram em Sorocaba</b>.</p><p>Errou a ordem, clica na peça lá em cima que ela volta.</p>",
  wrong:["A ordem não bateu. Primeiro o que mostrar (<b>SELECT *</b>), depois de onde (<b>FROM pessoas</b>), e só então o filtro (<b>WHERE</b> coluna = valor). Clica nas peças lá em cima pra devolver.",
         "Recruta, WHERE nunca vem antes do FROM. A ordem é <b>SELECT * FROM pessoas WHERE cidade = 'Sorocaba' ;</b>. Devolve as peças e monta assim."],
  ok:function(R){return bate(R,"SELECT * FROM pessoas WHERE cidade = 'Sorocaba'")}},

 {tema:'O botão Explique',type:'explain',spot:'#explBtn',point:'esse aqui',
  text:"<p>Montou. Agora o hábito que separa investigador de chutador: quando não entender uma consulta, clica em <b>Explique esta consulta</b>. Ele lê a consulta do jeito que o banco lê.</p><p>Clica aí e confere se o banco entendeu o que você quis dizer.</p>",
  after:"<p>No BO, quando travar, é a primeira coisa que você faz. Antes de me chamar e antes de pedir dica.</p>"},

 {tema:'Mostrar a coluna que identifica',type:'predict',sql:"SELECT cidade FROM pessoas WHERE cidade = 'Votorantim';",
  text:"<p>O Jairo quer saber <b>quem</b> mora em Votorantim. Olha o que eu escrevi.</p>",q:'Essa consulta resolve o problema do Jairo?',
  opts:[{t:'Não: ela mostra só a palavra Votorantim repetida, sem dizer quem é',ok:true,fb:'Exato. O filtro tá certo, mas o SELECT só pediu a cidade. Executa e vê com teus olhos.'},
        {t:'Sim: ela mostra o nome de quem mora lá',fb:'Mostra? Olha o que vem depois do SELECT: só cidade. Nome nenhum. Lê de novo.'},
        {t:'Sim, mas só da primeira pessoa',fb:'Não tem LIMIT nenhum aí. O problema é outro: quais colunas aparecem. Tenta de novo.'}],
  ok:function(R){return R.cols.length===1&&R.cols[0]==='cidade'&&bate(R,"SELECT * FROM pessoas WHERE cidade = 'Votorantim'")},
  after:"<p>Viu o papelão? A mesma palavra repetida e nenhum nome. O WHERE escolhe <b>as linhas</b>; o SELECT escolhe <b>as colunas</b>. Filtrou certo e mostrou a coluna errada, o relatório não serve pra nada.</p><p>Mostra sempre a coluna que <b>identifica</b>: nome, placa, CPF. Ou usa o <code>*</code> e vê tudo.</p>"},

 {tema:'LIKE e o %',type:'msg',
  text:"<p>Agora o problema de todo dia: testemunha nunca lembra o valor inteiro. \"A placa começava com…\", \"o nome era Ro-alguma-coisa\".</p><p>O <code>=</code> exige o valor <b>inteiro e idêntico</b>. Pra pedaço existe o <b>LIKE</b> (\"parecido com\"), junto com o <code>%</code>, que quer dizer \"qualquer coisa\":</p>",
  extra:"<div class=\"anat\"><div><code>'Ro%'</code><span>começa com Ro</span></div><div><code>'%Leme'</code><span>termina com Leme</span></div><div><code>'%Leme%'</code><span>tem Leme em qualquer parte</span></div></div>",
  text2:"<p>E o LIKE entra <b>no lugar</b> do <code>=</code>, entre a coluna e o padrão: <code>WHERE nome LIKE 'Ro%'</code>. Nunca os dois juntos.</p>"},

 {tema:'LIKE: começa com',type:'slot',template:"SELECT nome, cidade FROM pessoas WHERE nome LIKE ___;",
  text:"<p>O Jairo jura que o suspeito se chama <b>Ro-alguma-coisa</b>. Quero todo mundo cujo nome <b>começa com Ro</b>. Escolhe o padrão.</p>",
  chips:[{t:"'Ro'",bad:"Sem o <code>%</code> o LIKE vira um <code>=</code>: só acha quem se chama exatamente \"Ro\". Ninguém se chama Ro, criatura."},
         {t:"'%Ro'",bad:"Com o <code>%</code> na frente é \"<b>termina</b> com Ro\". Eu pedi <b>começa</b>."},
         {t:"'Ro%'",certo:true},
         {t:"Ro%",bad:"Faltaram as aspas. Padrão do LIKE é texto, e texto vai entre aspas simples."}],
  ok:function(R){return bate(R,"SELECT * FROM pessoas WHERE nome LIKE 'Ro%'")},
  after:"<p>Todos os Ro-alguma-coisa do cadastro. O <code>%</code> fica do lado em que você <b>não sabe</b> o resto.</p>"},

 {tema:'LIKE na placa; conferir letra por letra',type:'mold',template:"SELECT placa, modelo, cor FROM veiculos WHERE placa ___;",solucao:"SELECT placa, modelo, cor FROM veiculos WHERE placa LIKE 'BJ%';",spot:'#sqlEd',
  text:"<p>Agora sem peça pronta. A testemunha de um furto viu uma placa começando com <b>BJ</b>.</p><p>Clica nos tracinhos <code>___</code> e escreve o filtro: o <b>LIKE</b> e o padrão.</p>",
  ok:function(R){return bate(R,"SELECT * FROM veiculos WHERE placa LIKE 'BJ%'")},
  miss:function(R,k){if(!R.n)return esc(k,["Voltou vazio. Confere três coisas: tem <code>LIKE</code> (e não <code>=</code>)? Tem o <code>%</code> no fim? E as letras estão na ordem da testemunha, <b>B</b> e depois <b>J</b>?","Vazio de novo. Compara letra por letra o que você digitou com isto: <code>LIKE 'BJ%'</code>."]);
    return 'Veio carro demais. O filtro tem que pegar só placa que <b>começa com BJ</b>.'},
  after:"<p>Achou. Agora presta atenção, que esse é o erro que mais derruba recruta: se você digitar <b>JB</b> em vez de <b>BJ</b>, a consulta roda certinha e volta <b>vazia</b>. O banco não avisa que você trocou letra.</p><p>Pista se confere <b>letra por letra</b>.</p>"},

 {tema:'AND: juntar duas pistas',type:'mold',template:"SELECT placa, modelo, cor FROM veiculos WHERE cor = 'cinza' ___ placa LIKE 'LM%';",solucao:"SELECT placa, modelo, cor FROM veiculos WHERE cor = 'cinza' AND placa LIKE 'LM%';",spot:'#sqlEd',
  text:"<p>Última peça: juntar pistas. O <b>AND</b> (\"e\") exige que as duas condições valham <b>na mesma linha</b>.</p><p>Quero o carro <b>cinza</b> com placa começando com <b>LM</b>. Troca o <code>___</code> pela palavra que junta as duas.</p>",
  ok:function(R){return bate(R,"SELECT * FROM veiculos WHERE cor = 'cinza' AND placa LIKE 'LM%'")},
  miss:function(R,k){if(bate(R,"SELECT * FROM veiculos WHERE cor = 'cinza' OR placa LIKE 'LM%'"))return 'Com <b>OR</b> basta uma das condições valer, e veio carro que não é cinza ou placa que não começa com LM. Eu quero as duas ao mesmo tempo.';
    return esc(k,['Não é isso. Entre as duas condições vai uma palavra só, a que quer dizer "e".','A palavra é <b>AND</b>. Clica nos tracinhos e escreve AND.'])},
  after:"<p>Duas pistas, um carro. Investigação é isso: cada condição corta mais um pouco, até sobrar o suspeito.</p>"},

 {tema:'Escrever um filtro do zero',type:'free',solucao:"SELECT nome, cidade FROM pessoas WHERE cidade = 'Piedade';",spot:'#sqlEd',
  text:"<p>Acabou a moleza. Apaguei o editor.</p><p>Escreve do zero: <b>o nome e a cidade das pessoas que moram em Piedade</b>. Eu tô olhando.</p>",
  hints:["O esqueleto é <code>SELECT</code> colunas <code>FROM</code> tabela <code>WHERE</code> coluna <code>=</code> 'valor'<code>;</code>. As colunas são nome e cidade.",
         "Vou te dar de mão beijada, mas só dessa vez: <code>SELECT nome, cidade FROM pessoas WHERE cidade = 'Piedade';</code>"],
  hintBtns:['Pedir ajuda pra Célia','Ainda travado? Implorar a resposta'],
  ok:function(R){return bate(R,"SELECT * FROM pessoas WHERE cidade = 'Piedade'")&&!falta(R,'nome')},
  miss:function(R,k){
    if(bate(R,"SELECT * FROM pessoas WHERE cidade = 'Piedade'"))return 'O filtro tá certo, mas cadê o nome? Eu pedi nome e cidade.';
    if(!R.n)return 'Voltou vazio. Confere a grafia: Piedade com P maiúsculo, entre aspas simples.';
    return esc(k,['Rodou, mas não é isso. Confere o filtro depois do WHERE.','Ainda não. Se travou, clica em Explique esta consulta e lê o que você escreveu em português.'])},
  after:"<p>Hm. Funcionou.</p><p>Do zero, com filtro. Semana passada você nem sabia o que era SELECT.</p>"},

 {tema:'Resumo dos filtros',type:'final',btn:'Abrir o BO 1002',
  text:"<p>Resumo, que eu não repito:</p><p>1. A ordem é <b>SELECT → FROM → WHERE</b>.<br>2. Condição completa: coluna, operador, valor.<br>3. Texto entre aspas <b>simples</b>.<br>4. Mostra a coluna que <b>identifica</b>.<br>5. Pedaço de valor: <b>LIKE</b> com <b>%</b>, no lugar do =.<br>6. Duas pistas: <b>AND</b>.<br>7. Pista se confere letra por letra.<br>8. Travou? <b>Explique esta consulta</b>.</p><p>Agora o furto do shopping é contigo.</p>"}
 ],
 anotacoes:{arquivo:'02_filtros.txt',texto:[
  "ANOTAÇÕES DA CÉLIA — FILTROS",
  "",
  "A ORDEM DAS PARTES NUNCA MUDA",
  "  SELECT colunas  FROM tabela  WHERE filtro ;",
  "",
  "WHERE = condição completa: COLUNA  OPERADOR  VALOR",
  "  SELECT * FROM pessoas WHERE cidade = 'Votorantim';",
  "",
  "TEXTO",
  "  - entre aspas SIMPLES: 'azul'",
  "      sem aspas, o banco acha que é nome de coluna",
  "      \"azul\" com aspas duplas: errado (nos bancos de verdade dá erro)",
  "  - as cores estão gravadas em minúsculas: 'azul', nunca 'Azul'",
  "  - com = o valor tem que ser INTEIRO e idêntico, letra por letra",
  "",
  "MOSTRA A COLUNA QUE IDENTIFICA",
  "  WHERE escolhe as LINHAS. SELECT escolhe as COLUNAS.",
  "  SELECT cidade ... WHERE cidade = 'X' mostra só a palavra X repetida. Não diz QUEM.",
  "  Mostra nome, placa, CPF... ou usa SELECT *.",
  "",
  "PEDAÇO DO VALOR: LIKE + %       (% quer dizer \"qualquer coisa\")",
  "  'Ro%'     começa com Ro",
  "  '%Leme'   termina com Leme",
  "  '%Leme%'  tem Leme em qualquer parte",
  "  O LIKE entra NO LUGAR do =:   WHERE nome LIKE 'Ro%'",
  "  Sem % o LIKE funciona igual ao =.",
  "",
  "DUAS PISTAS: AND (as duas valem na mesma linha)",
  "  WHERE cor = 'cinza' AND placa LIKE 'LM%'",
  "  OR = basta uma das duas (traz mais coisa).",
  "",
  "PISTA SE CONFERE LETRA POR LETRA",
  "  Trocou BJ por JB? A consulta roda, volta vazia e o banco não avisa.",
  "",
  "TRAVOU?",
  "  1. Explique esta consulta.",
  "  2. Relê o relato do BO: cada coisa que a testemunha viu vira um filtro.",
  "  3. Só então pede dica."
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1002');save();openOcorr();renderOcorr();
  say('celia','Agora é contigo. Lê o relato do BO 1002 com calma: cada coisa que a testemunha viu vira um filtro. O depoimento do segurança tá em Arquivos › Evidências.');
 }
});
