/* Treinamento "Agregação", antes do BO 1004 (Módulo 3, quarta-feira): COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING.
   Treina com veículos, pessoas e radares: o dinheiro fica para o BO (nada de transferencias, Denise, faixa de R$ 9 mil).
   Passos mold/free têm `solucao`; a peça certa do slot tem `certo:true` (respostas esperadas, usadas nos testes). */
registrarTreino({id:'m3-agregacao',titulo:L('Agregação'),
 passos:[
 {type:'msg',tema:L('Contar e somar'),btn:L('Manda'),
  text:L('<p>Quarta-feira, e você já com acesso às contas do banco. Não se acostuma, que é provisório.</p><p>Até ontem você caçava <b>uma linha</b>: um carro, uma pessoa. Dinheiro não funciona assim. Ninguém lava R$ 380 mil num depósito só: são <b>dezenas</b> de linhas, e o crime só aparece quando você olha pra elas <b>juntas</b>. Pra isso existem as funções que resumem uma coluna inteira num número:</p>'),
  extra:'<div class="anat"><div><code>COUNT(*)</code><span>'+L('quantas linhas')+'</span></div><div><code>SUM(coluna)</code><span>'+L('a soma')+'</span></div><div><code>AVG(coluna)</code><span>'+L('a média')+'</span></div><div><code>MIN(coluna)</code><span>'+L('o menor valor')+'</span></div><div><code>MAX(coluna)</code><span>'+L('o maior valor')+'</span></div></div>',
  text2:L('<p>Hoje eu treino com os carros e os radares. O dinheiro fica pro BO, que é contigo.</p>')},

 {type:'predict',tema:L('COUNT(*)'),sql:'SELECT COUNT(*) FROM veiculos;',
  text:L('<p>Olha essa. Antes de executar, me diz.</p>'),q:L('O que essa consulta vai mostrar?'),
  opts:[{t:L('Um número só: quantos veículos existem no cadastro'),ok:true,fb:L('Isso. COUNT(*) conta as linhas e devolve um número. Executa.')},
        {t:L('Todos os veículos, um por linha'),fb:L('Isso seria SELECT *. O COUNT resume tudo num número só. Pensa de novo.')},
        {t:L('Quantas colunas a tabela tem'),fb:L('COUNT(*) conta linhas, não colunas. Tenta de novo.')}],
  ok:function(R){return R.n===1&&temNumero(R,F.nVeic)},
  after:L('<p>{n} veículos, num número só. Na terça você ia contar as linhas no olho.</p>')},

 {type:'slot',tema:L('MAX, MIN, SUM e AVG'),template:'SELECT ___(velocidade_kmh) FROM leituras_radar;',
  text:L('<p>O delegado quer a <b>maior velocidade</b> que um radar já registrou. Escolhe a função.</p>'),
  chips:[{t:'MIN',bad:L('MIN é o menor valor: a passagem mais <b>lenta</b>.')},
         {t:'SUM',bad:L('SUM soma todas as velocidades: dá um número enorme que não quer dizer nada.')},
         {t:'MAX',certo:true},
         {t:'COUNT',bad:L('COUNT conta quantas passagens existem; não diz velocidade nenhuma.')}],
  ok:function(R){return R.n===1&&temNumero(R,valorDe('SELECT MAX(velocidade_kmh) FROM leituras_radar'))},
  after:L('<p>A mais rápida de todas. Repara que a coluna vem com o nome <code>MAX(velocidade_kmh)</code>. Dá pra trocar com AS, igual você aprendeu na terça.</p>')},

 {type:'mold',tema:L('AVG com WHERE'),template:"SELECT AVG(___) FROM leituras_radar WHERE local_radar = 'Av. São Paulo';",
  solucao:"SELECT AVG(velocidade_kmh) FROM leituras_radar WHERE local_radar = 'Av. São Paulo';",spot:'#sqlEd',
  text:L('<p>Agora a <b>média</b> de velocidade só na Av. São Paulo. A função já está lá; falta dizer de qual coluna. Clica nos tracinhos e escreve.</p><p>Repara: o WHERE escolhe as linhas <b>antes</b> de a conta ser feita.</p>'),
  ok:function(R){return R.n===1&&temNumero(R,valorDe("SELECT AVG(velocidade_kmh) FROM leituras_radar WHERE local_radar = 'Av. São Paulo'"),0.01)},
  miss:function(R,k){return esc(k,[L('Não é essa média. A coluna que tem a velocidade é <code>velocidade_kmh</code>.'),L('Clica nos tracinhos e escreve exatamente <code>velocidade_kmh</code>.')])},
  after:L('<p>Média de uma avenida, num número. Juntar WHERE com função de conta é o que você mais vai fazer no trabalho.</p>')},

 {type:'msg',tema:L('GROUP BY: uma conta por grupo'),
  text:L('<p>Agora o pulo do gato do dia. O COUNT conta <b>tudo junto</b>. E se eu quiser contar <b>por cor</b>? Quantos pretos, quantos pratas…</p><p>Pra isso existe o <b>GROUP BY</b> ("agrupar por"). Ele separa as linhas em grupos, um para cada valor diferente, e faz a conta <b>dentro de cada grupo</b>. Cada grupo vira uma linha:</p>'),
  extra:'<table class="minitab"><tr><th>placa</th><th class="hc">cor</th></tr><tr><td>QAB1C23</td><td class="hc">preto</td></tr><tr><td>RTD4E56</td><td class="hc">prata</td></tr><tr><td>MCV7F89</td><td class="hc">preto</td></tr><tr><td>KLB2D10</td><td class="hc">branco</td></tr><tr><td>PRX5A44</td><td class="hc">preto</td></tr></table><p style="margin:4px 0"><code>GROUP BY cor</code> ↓</p><table class="minitab"><tr><th class="hc">cor</th><th>COUNT(*)</th></tr><tr><td class="hc">preto</td><td>3</td></tr><tr><td class="hc">prata</td><td>1</td></tr><tr><td class="hc">branco</td><td>1</td></tr></table>',
  text2:L('<p>Regra de ouro: no SELECT, ou a coluna está no GROUP BY, ou está dentro de uma conta. Coluna solta, o resultado mente.</p>')},

 {type:'predict',tema:L('Quantas linhas um GROUP BY devolve'),sql:'SELECT cor, COUNT(*) FROM veiculos GROUP BY cor;',
  text:L('<p>Essa é a de verdade, com o cadastro inteiro.</p>'),q:L('Quantas linhas vão aparecer?'),
  opts:[{t:L('Uma para cada cor diferente'),ok:true,fb:L('Isso: cada cor vira um grupo, e cada grupo vira uma linha com a contagem ao lado.')},
        {t:L('Uma para cada veículo'),fb:L('Sem o GROUP BY seria. Com ele, cada cor vira um grupo, e cada grupo vira uma linha só. Pensa de novo.')},
        {t:L('Uma só, com o total'),fb:L('Isso seria só COUNT(*). O GROUP BY separa por cor. Tenta de novo.')}],
  ok:function(R){return bateGrupos(R,linhasDe('SELECT cor, COUNT(*) AS n FROM veiculos GROUP BY cor'),'cor','n')},
  after:L('<p>{cores} cores, {cores} linhas. Lembra do DISTINCT de terça? Agora, além de cada cor, você sabe quantos carros tem de cada.</p>')},

 {type:'blocks',tema:L('Montar um GROUP BY'),
  pool:['GROUP BY','COUNT(*)','FROM','cidade',',','SELECT','pessoas','cidade',';'],
  answer:['SELECT','cidade',',','COUNT(*)','FROM','pessoas','GROUP BY','cidade',';'],
  text:L('<p>Monta você: <b>quantas pessoas moram em cada cidade</b>. A ordem é SELECT, FROM e, no fim, o GROUP BY.</p>'),
  wrong:[L('A ordem não bateu. Primeiro o que mostrar (<b>SELECT cidade, COUNT(*)</b>), depois de onde (<b>FROM pessoas</b>) e por último como agrupar (<b>GROUP BY cidade</b>). Clica nas peças lá em cima pra devolver.'),
         L('Recruta: <b>SELECT cidade , COUNT(*) FROM pessoas GROUP BY cidade ;</b>. Devolve as peças e monta assim.')],
  ok:function(R){return bateGrupos(R,linhasDe('SELECT cidade, COUNT(*) AS n FROM pessoas GROUP BY cidade'),'cidade','n')}},

 {type:'explain',tema:L('O Explique num GROUP BY'),spot:'#explBtn',point:L('esse aqui'),
  text:L('<p>Clica no <b>Explique esta consulta</b> e lê como o banco entendeu esse agrupamento. Quando o GROUP BY confundir, é o primeiro lugar pra olhar.</p>'),
  after:L('<p>"Um grupo para cada cidade… cada grupo vira uma linha." Guarda essa frase.</p>')},

 {type:'msg',tema:L('HAVING: filtrar grupos'),
  text:L('<p>Última ferramenta, e é ela que pega lavador de dinheiro.</p><p>O <b>WHERE</b> filtra <b>linhas</b>, antes de agrupar. Pra filtrar <b>grupos</b>, depois da conta pronta, existe o <b>HAVING</b> ("tendo"):</p><p><code>… GROUP BY cidade HAVING COUNT(*) &gt; 5</code></p><p>só as cidades com mais de 5 pessoas.</p>'),
  text2:L('<p>Pensa assim: o WHERE escolhe quem entra na sala; o HAVING escolhe quais grupos ficam depois da contagem. Por isso COUNT dentro do WHERE dá erro: o WHERE olha uma linha de cada vez.</p>')},

 {type:'slot',tema:L('HAVING ou WHERE?'),template:'SELECT cidade, COUNT(*) FROM pessoas GROUP BY cidade ___ COUNT(*) >= 9;',
  text:L('<p>Quero só as cidades com <b>9 pessoas ou mais</b>. Escolhe a peça que filtra os grupos.</p>'),
  chips:[{t:'WHERE',bad:L('O WHERE não enxerga grupo: ele olha uma linha de cada vez e vem <b>antes</b> do GROUP BY. Depois do GROUP BY, quem filtra é o HAVING.')},
         {t:'HAVING',certo:true},
         {t:'AND',bad:L('AND junta duas condições, mas aqui não tem condição antes pra juntar. Quem filtra grupo é o HAVING.')}],
  ok:function(R){return bateGrupos(R,linhasDe('SELECT cidade, COUNT(*) AS n FROM pessoas GROUP BY cidade HAVING COUNT(*) >= 9'),'cidade','n')},
  after:L('<p>Só ficou quem passou no filtro do grupo. Agora troca "pessoas por cidade" por "depósitos por conta" e pensa no BO.</p>')},

 {type:'mold',tema:L('Escrever o HAVING'),template:'SELECT cor, COUNT(*) FROM veiculos GROUP BY cor HAVING ___;',
  solucao:'SELECT cor, COUNT(*) FROM veiculos GROUP BY cor HAVING COUNT(*) > 8;',spot:'#sqlEd',
  text:L('<p>Agora você escreve o filtro: só as cores com <b>mais de 8</b> veículos. Clica nos tracinhos.</p>'),
  ok:function(R){return bateGrupos(R,linhasDe('SELECT cor, COUNT(*) AS n FROM veiculos GROUP BY cor HAVING COUNT(*) > 8'),'cor','n')},
  miss:function(R,k){if(bateGrupos(R,linhasDe('SELECT cor, COUNT(*) AS n FROM veiculos GROUP BY cor HAVING COUNT(*) >= 8'),'cor','n'))return L('Quase: "mais de 8" é <code>&gt; 8</code>. O <code>&gt;=</code> também deixa entrar quem tem exatamente 8.');
    return esc(k,[L('Não é isso. O filtro do grupo é uma conta comparada com um número: <code>COUNT(*) &gt; 8</code>.'),L('Clica nos tracinhos e escreve exatamente: <code>COUNT(*) &gt; 8</code>')])},
  after:L('<p>Isso. Repara que no HAVING vai a mesma conta que está no SELECT.</p>')},

 {type:'free',tema:L('Agrupar do zero'),solucao:'SELECT modelo, COUNT(*) FROM veiculos GROUP BY modelo HAVING COUNT(*) >= 3;',spot:'#sqlEd',
  text:L('<p>Do zero, e eu tô olhando: <b>para cada modelo de veículo, quantos existem no cadastro</b>, mostrando só os modelos com <b>3 ou mais</b>.</p>'),
  hints:[L('Três partes: <code>SELECT modelo, COUNT(*) FROM veiculos</code>, depois o <code>GROUP BY</code> e por último o <code>HAVING</code>.'),
         L('Tá, toma: <code>SELECT modelo, COUNT(*) FROM veiculos GROUP BY modelo HAVING COUNT(*) &gt;= 3;</code>')],
  hintBtns:[L('Pedir ajuda pra Célia'),L('Ainda travado? Implorar a resposta')],
  ok:function(R){return bateGrupos(R,linhasDe('SELECT modelo, COUNT(*) AS n FROM veiculos GROUP BY modelo HAVING COUNT(*) >= 3'),'modelo','n')},
  miss:function(R,k){
    if(bateGrupos(R,linhasDe('SELECT modelo, COUNT(*) AS n FROM veiculos GROUP BY modelo'),'modelo','n'))return L('Agrupou certinho. Falta o filtro dos grupos: <code>HAVING COUNT(*) &gt;= 3</code>.');
    if(R.n===1)return L('Saiu uma linha só: faltou o <code>GROUP BY modelo</code>.');
    return esc(k,[L('Rodou, mas não é isso. Confere o GROUP BY e o HAVING.'),L('Clica em Explique esta consulta e lê o que você escreveu.')])},
  after:L('<p>Hm. Funcionou.</p><p>Contar, agrupar e filtrar grupo. É isso que vai achar o dinheiro.</p>')},

 {type:'final',tema:L('Resumo da agregação'),btn:L('Abrir o BO 1004'),
  text:L('<p>Resumo, que eu não repito:</p><p>1. <b>COUNT, SUM, AVG, MIN, MAX</b> resumem muitas linhas num número.<br>2. <b>GROUP BY</b> faz a conta por grupo; cada grupo vira uma linha.<br>3. No SELECT, ou a coluna está no GROUP BY, ou está dentro de uma conta.<br>4. <b>WHERE</b> filtra linhas antes; <b>HAVING</b> filtra grupos depois.</p><p>Sabe quem faz isso o dia inteiro? Analista de prevenção à lavagem de dinheiro, em banco. Ganha bem e não precisa aguentar o Beto. Agora o dinheiro é contigo.</p>')}
 ],
 anotacoes:{arquivo:'04_agregacao.txt',texto:[
  L('ANOTAÇÕES DA CÉLIA — AGREGAÇÃO'),
  '',
  L('FUNÇÕES QUE RESUMEM UMA COLUNA INTEIRA'),
  '  COUNT(*)        '+L('quantas linhas'),
  '  COUNT(coluna)   '+L('quantas linhas têm a coluna preenchida'),
  '  SUM(coluna)     '+L('a soma'),
  '  AVG(coluna)     '+L('a média'),
  '  MIN / MAX       '+L('o menor / o maior valor'),
  "  SELECT COUNT(*) FROM veiculos WHERE cor = 'preto';",
  '',
  L('GROUP BY = UMA CONTA POR GRUPO (cada grupo vira uma linha)'),
  '  SELECT cor, COUNT(*) FROM veiculos GROUP BY cor;',
  L('  Regra de ouro: no SELECT, ou a coluna está no GROUP BY, ou está dentro de uma conta.'),
  '',
  L('WHERE × HAVING'),
  L('  WHERE  filtra LINHAS, antes de agrupar'),
  L('  HAVING filtra GRUPOS, depois da conta pronta'),
  '  SELECT cidade, COUNT(*) FROM pessoas GROUP BY cidade HAVING COUNT(*) > 5;',
  L('  COUNT dentro do WHERE dá erro: o WHERE olha uma linha de cada vez.'),
  '',
  L('A ORDEM COMPLETA'),
  '  SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT …',
  '',
  L('BOAS MANIAS DE QUEM TRABALHA COM ISSO'),
  L('  1. Dê nome à conta com AS (apelido). A coluna sai "total", e não "COUNT(*)":'),
  '     SELECT cor, COUNT(*) AS total FROM veiculos GROUP BY cor;',
  L('  2. Consulta grande? Uma parte por linha. O botão Organizar faz isso pra você:'),
  '     SELECT cor, COUNT(*) AS total',
  '     FROM veiculos',
  "     WHERE ano >= 2018",
  '     GROUP BY cor',
  '     HAVING COUNT(*) > 2;',
  L('  3. Mais de uma consulta no editor? Selecione só a que quer e Execute: roda só o trecho.'),
  '',
  L('TRAVOU? Explique esta consulta. Ele diz "um grupo para cada…".')
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1004');save();openOcorr();renderOcorr();
  say('celia',L('O BO 1004 tá no SISP Ocorrências. Lê o relato com calma: o padrão que você procura tá descrito ali, com todas as letras.'));
 }
});
