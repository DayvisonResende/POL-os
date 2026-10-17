/* Treinamento "NULL", antes do BO 1005 (Módulo 3, quarta-feira): COUNT(*) × COUNT(coluna), IS NULL, COALESCE.
   Usa a coluna descricao das transferências. A pista do BO 1005 (conta_origem vazia) é o jogador quem encontra.
   Passos mold/free têm `solucao`; a peça certa do slot tem `certo:true`. */
registrarTreino({id:'m3-nulos',titulo:L('O vazio'),
 passos:[
 {type:'msg',tema:L('NULL: o vazio'),btn:L('Tô ouvindo'),
  text:L('<p>Antes do próximo BO, uma conversa séria sobre o nada.</p><p>Quando uma informação <b>não existe</b>, a célula fica <b>NULL</b>: vazia. Não é zero, não é texto em branco: é "<i>ninguém sabe</i>". Uma transferência sem descrição tem a <code>descricao</code> NULL.</p><p>E o NULL tem três manias que derrubam muito analista. Presta atenção.</p>')},

 {type:'predict',tema:L('COUNT(*) × COUNT(coluna)'),sql:'SELECT COUNT(*), COUNT(descricao) FROM transferencias;',
  text:L('<p>Primeira mania. Olha essa consulta.</p>'),q:L('Os dois números vão sair iguais?'),
  opts:[{t:L('Não: COUNT(descricao) pula as linhas em que a descrição está vazia'),ok:true,fb:L('Isso. COUNT(*) conta linhas; COUNT(coluna) conta só os valores preenchidos. Executa.')},
        {t:L('Sim, os dois contam todas as linhas'),fb:L('Contariam, se não existisse o vazio. Pensa nas transferências sem descrição.')},
        {t:L('COUNT(descricao) dá erro, porque descrição é texto'),fb:L('COUNT conta texto sem problema. O detalhe é outro: o vazio. Tenta de novo.')}],
  ok:function(R){return R.n===1&&temNumero(R,F.nTransf)&&temNumero(R,F.nComDescricao)},
  after:L('<p>Viu a diferença? <b>COUNT(coluna) não conta vazio.</b> Relatório com COUNT errado já derrubou muito gerente.</p>')},

 {type:'slot',tema:L('IS NULL, nunca = NULL'),template:'SELECT * FROM transferencias WHERE descricao ___;',
  text:L('<p>Segunda mania. Quero as transferências <b>sem descrição</b>. Escolhe a peça.</p>'),
  chips:[{t:'= NULL',bad:L('<code>= NULL</code> nunca é verdade, nem quando a célula está vazia: nada é "igual a ninguém sabe". O resultado volta vazio e você nem percebe o erro. Pra vazio, o SQL tem um operador próprio.')},
         {t:"= ''",bad:L("Texto vazio <code>''</code> é outra coisa: é um texto sem letras. NULL é a ausência de valor.")},
         {t:'IS NULL',certo:true},
         {t:'IS EMPTY',bad:L('Não existe IS EMPTY em SQL.')}],
  ok:function(R){return bate(R,'SELECT * FROM transferencias WHERE descricao IS NULL')},
  after:L('<p><b>IS NULL</b> pra achar o vazio; <b>IS NOT NULL</b> pro preenchido. O <code>=</code> com NULL é a pegadinha mais antiga do SQL.</p>')},

 {type:'predict',tema:L('COALESCE: ver antes de usar'),sql:"SELECT valor, descricao, COALESCE(descricao, 'sem descrição') FROM transferencias WHERE descricao IS NULL LIMIT 3;",
  text:L("<p>Terceira mania: relatório com buraco fica feio. Pra isso existe o <b>COALESCE</b>.</p><p><code>COALESCE(descricao, 'sem descrição')</code> olha a coluna: se tem valor, mostra o valor; se está <b>vazia</b>, mostra o texto que você escolheu. A coluna original continua igual, só o resultado muda.</p><p>Essa consulta pega três transferências sem descrição e mostra as duas versões lado a lado.</p>"),
  q:L('O que vai aparecer na última coluna?'),
  opts:[{t:L("'sem descrição' nas três linhas"),ok:true,fb:L('Isso. Onde era vazio, entra o texto. Executa e confere.')},
        {t:L('Vazio, igual à coluna descricao'),fb:L('A coluna descricao continua vazia, sim. Mas a última coluna é o COALESCE: ele troca o vazio. Tenta de novo.')},
        {t:L('Um erro, porque não dá pra mexer em célula vazia'),fb:L('Dá, e é pra isso que o COALESCE existe. Tenta de novo.')}],
  ok:function(R){return R.n===3&&R.rows.every(function(r){return r[1]===null&&r[2]==='sem descrição'})},
  after:L('<p>Viu? A segunda coluna continua vazia, e a terceira veio preenchida. O COALESCE não muda o banco: muda só o que aparece no resultado.</p>')},

 {type:'mold',tema:L('COALESCE: trocar o vazio'),template:'SELECT valor, COALESCE(descricao, ___) FROM transferencias;',
  solucao:"SELECT valor, COALESCE(descricao, 'sem descrição') FROM transferencias;",spot:'#sqlEd',
  text:L("<p>Agora você, em todas as transferências: <code>COALESCE(coluna, 'texto')</code>.</p><p>Clica nos tracinhos e escreve <code>'sem descrição'</code>, com as aspas.</p>"),
  ok:function(R){return R.n===F.nTransf&&R.cols.length===2&&R.rows.every(function(r){return r[1]!==null})},
  miss:function(R,k){if(R.rows.some(function(r){return r[1]===null}))return L('Ainda tem célula vazia. O segundo valor do COALESCE é o que entra no lugar do vazio.');
    return esc(k,[L("Confere as aspas: <code>'sem descrição'</code>."),L("Clica nos tracinhos e escreve exatamente <code>'sem descrição'</code>, com aspas simples.")])},
  after:L('<p>Nenhum buraco. No mercado, todo relatório de verdade tem um COALESCE em algum lugar.</p>')},

 {type:'free',tema:L('Contar o preenchido'),solucao:'SELECT COUNT(descricao) FROM transferencias;',spot:'#sqlEd',
  text:L('<p>Do zero: <b>quantas transferências têm a descrição preenchida</b>? Quero um número só.</p>'),
  hints:[L('Dois caminhos: <code>COUNT(descricao)</code>, ou <code>COUNT(*)</code> com <code>WHERE descricao IS NOT NULL</code>.'),L('<code>SELECT COUNT(descricao) FROM transferencias;</code>')],
  hintBtns:[L('Pedir ajuda pra Célia'),L('Ainda travado? Implorar a resposta')],
  ok:function(R){return R.n===1&&R.cols.length===1&&temNumero(R,F.nComDescricao)},
  miss:function(R,k){
    if(temNumero(R,F.nTransf))return L('Esse é o total de transferências, contando as sem descrição. Eu quero só as preenchidas.');
    if(temNumero(R,0))return L('Deu zero? Aposto que tem um <code>= NULL</code> aí. Pra vazio, é IS NULL; pra preenchido, IS NOT NULL.');
    return esc(k,[L('Não é esse número. Lembra da primeira mania do NULL.'),L('Clica em Explique esta consulta e confere o que você está contando.')])},
  after:L('<p>Hm. Funcionou.</p>')},

 {type:'final',tema:L('Resumo do NULL'),btn:L('Abrir o BO 1005'),
  text:L('<p>NULL é "ninguém sabe". Três regras:</p><p>1. <b>COUNT(coluna)</b> não conta vazio; <b>COUNT(*)</b> conta tudo.<br>2. Vazio se procura com <b>IS NULL</b>, nunca com <code>=</code>.<br>3. <b>COALESCE</b> troca o vazio por um valor.</p><p>Agora presta atenção no BO 1005: às vezes o vazio é justamente a pista.</p>')}
 ],
 anotacoes:{arquivo:'05_nulos.txt',texto:[
  L('ANOTAÇÕES DA CÉLIA — O VAZIO (NULL)'),
  '',
  L('NULL = "ninguém sabe". Não é zero, não é texto em branco.'),
  '',
  L('1. COUNT(*) conta TODAS as linhas; COUNT(coluna) pula as vazias.'),
  '   SELECT COUNT(*), COUNT(descricao) FROM transferencias;',
  '',
  L('2. Vazio se procura com IS NULL. NUNCA com = NULL (volta vazio sem avisar).'),
  '   SELECT * FROM transferencias WHERE descricao IS NULL;',
  '   SELECT * FROM transferencias WHERE descricao IS NOT NULL;',
  '',
  L('3. COALESCE troca o vazio por um valor.'),
  "   SELECT valor, COALESCE(descricao, 'sem descrição') FROM transferencias;",
  '',
  L('E UMA SUSPEITA: quando a célula vazia aparece onde não deveria, pergunte por quê.')
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1005');save();openOcorr();renderOcorr();
  say('celia',L('Vai lá. E olha com carinho pras células vazias.'));
 }
});
