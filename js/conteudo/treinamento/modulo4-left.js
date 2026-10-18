/* Treinamento "Quem fica de fora", antes do BO 1007 (Módulo 4, quinta à tarde): LEFT JOIN, "quem não tem"
   (LEFT JOIN … IS NULL) e a soma que infla no JOIN (1 nota → N itens).
   Exemplo de nota: NF 72143, uma nota comum de setembro com 4 itens (nada da carga de 12/10).
   Passos mold/free têm `solucao`; a peça certa do slot tem `certo:true`. */
var NOTA_EX="n.numero = 'NF 72143'";
var Q_SEM_CARRO='SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL';
registrarTreino({id:'m4-left',titulo:L('Quem fica de fora'),
 passos:[
 {type:'msg',tema:L('Quem o JOIN esconde'),btn:L('Como assim, some?'),
  text:L('<p>De manhã você viu: no JOIN, <b>linha sem par sai do resultado</b>. Carro sem dono não aparece; pessoa sem carro também não.</p><p>Às vezes é justamente quem <b>não tem par</b> que interessa: conta que nunca recebeu nada, imóvel sem inquilino, suspeito sem álibi.</p>'),
  text2:L('<p>Pra isso existe o <b>LEFT JOIN</b>: ele mantém <b>todas</b> as linhas da tabela da esquerda (a do FROM), tenham par ou não. Quem não tem par aparece com as colunas da outra tabela <b>vazias</b>: NULL.</p>')},

 {type:'predict',tema:L('LEFT JOIN'),sql:'SELECT p.nome, v.placa FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf;',
  text:L('<p>Pessoas com os carros delas, mas com LEFT JOIN. Tem gente no cadastro que não tem carro nenhum.</p>'),q:L('O que acontece com quem não tem carro?'),
  opts:[{t:L('Aparece, com a placa vazia (NULL)'),ok:true,fb:L('Isso. O LEFT segura todo mundo da tabela da esquerda. Executa e procura as placas vazias.')},
        {t:L('Some, igual no JOIN comum'),fb:L('No JOIN comum, sumiria. O LEFT existe justamente pra não sumir. Tenta de novo.')},
        {t:L('Dá erro, porque falta a placa'),fb:L('Não dá erro: o vazio é o NULL, que você conheceu ontem. Tenta de novo.')}],
  ok:function(R){return R.n===linhasDe('SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf').length&&R.rows.some(function(r){return r[1]===null})},
  after:L('<p>Todo mundo apareceu, e quem não tem carro veio com <code>NULL</code> na placa. Quem tem dois carros aparece duas vezes, repara.</p>')},

 {type:'slot',tema:L('"Quem não tem"'),template:'SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa ___;',
  text:L('<p>Agora o truque mais útil do dia: listar <b>só quem não tem carro</b>. Depois do LEFT JOIN, quem não teve par tem a placa vazia. Escolhe a peça.</p>'),
  chips:[{t:'= NULL',bad:L('Ontem eu te avisei: <code>= NULL</code> nunca é verdade. Volta vazio sem dar erro.')},
         {t:'IS NOT NULL',bad:L('IS NOT NULL é quem <b>tem</b> placa, ou seja, quem tem carro. Quero o contrário.')},
         {t:'IS NULL',certo:true},
         {t:"= ''",bad:L('Texto em branco não é vazio. Pro vazio do LEFT JOIN, o operador é outro.')}],
  ok:function(R){return bate(R,Q_SEM_CARRO)},
  after:L('<p><b>LEFT JOIN + IS NULL</b> = "quem não tem". Decora esse par, que cai em toda entrevista de emprego.</p>')},

 {type:'msg',tema:L('A soma que infla'),
  text:L('<p>Agora a armadilha que mais derruba relatório, e quem cai nela nem percebe.</p><p>Uma <b>nota fiscal</b> tem vários <b>itens</b>. Quando você faz o JOIN da nota com os itens, a linha da nota <b>se repete</b> uma vez para cada item. Olha a NF 72143, que tem 4 itens:</p>'),
  extra:'<table class="minitab"><tr><th>numero</th><th class="hc">valor_total</th><th>produto</th></tr><tr><td>NF 72143</td><td class="hc">24919</td><td>…</td></tr><tr><td>NF 72143</td><td class="hc">24919</td><td>…</td></tr><tr><td>NF 72143</td><td class="hc">24919</td><td>…</td></tr><tr><td>NF 72143</td><td class="hc">24919</td><td>…</td></tr></table>',
  text2:L('<p>O valor da nota aparece <b>4 vezes</b>. E se você somar essa coluna?</p>')},

 {type:'predict',tema:L('Somar depois do JOIN'),sql:"SELECT SUM(n.valor_total) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id WHERE n.numero = 'NF 72143';",
  text:L('<p>A NF 72143 vale R$ 24.919. Essa consulta soma o valor da nota depois do JOIN com os itens.</p>'),q:L('Quanto vai dar?'),
  opts:[{t:L('R$ 24.919, o valor da nota'),fb:L('Seria, sem o JOIN. Mas lembra: depois do JOIN, a nota aparece uma vez por item. Pensa de novo.')},
        {t:L('4 vezes o valor da nota'),ok:true,fb:L('Isso, e esse número não existe. Executa pra ver o tamanho do estrago.')},
        {t:L('Dá erro, porque a nota se repete'),fb:L('Não dá erro nenhum, e é isso que é perigoso. Tenta de novo.')}],
  ok:function(R){return R.n===1&&temNumero(R,4*valorDe("SELECT valor_total FROM notas_fiscais n WHERE "+NOTA_EX),0.01)},
  after:L('<p>R$ 99.676 de uma nota de R$ 24.919. Num relatório de verdade, ninguém conta as linhas, e o número inflado vai parar na mesa do chefe. <b>Antes de somar depois de um JOIN, pergunte: esta coluna se repete?</b></p>')},

 {type:'mold',tema:L('Somar do lado certo'),template:"SELECT SUM(i.quantidade * ___) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id WHERE n.numero = 'NF 72143';",
  solucao:"SELECT SUM(i.quantidade * i.valor_unitario) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id WHERE n.numero = 'NF 72143';",spot:'#sqlEd',
  text:L('<p>O jeito certo: somar do lado que <b>não se repete</b>. Cada item aparece uma vez só, então some <b>quantidade × preço de cada item</b>. Clica nos tracinhos e escreve a coluna do preço de uma unidade.</p>'),
  ok:function(R){return R.n===1&&temNumero(R,valorDe("SELECT valor_total FROM notas_fiscais n WHERE "+NOTA_EX),0.01)},
  miss:function(R,k){return esc(k,[L('O preço de uma unidade fica em itens: <code>i.valor_unitario</code>.'),L('Escreve nos tracinhos: <code>i.valor_unitario</code>')])},
  after:L('<p>R$ 24.919, igual à nota. Quando a soma de um JOIN bater com um número que você conhece, aí sim confia.</p>')},

 {type:'free',tema:L('"Quem não tem", do zero'),solucao:'SELECT p.nome FROM pessoas p LEFT JOIN contas_bancarias c ON c.cpf_titular = p.cpf WHERE c.id IS NULL;',spot:'#sqlEd',
  text:L('<p>Do zero: o <b>nome</b> das pessoas que <b>não têm nenhuma conta bancária</b>.</p>'),
  hints:[L('Mesmo esquema de antes: pessoas na esquerda, <code>LEFT JOIN contas_bancarias c ON c.cpf_titular = p.cpf</code>, e no WHERE quem ficou sem par: <code>c.id IS NULL</code>.'),L('<code>SELECT p.nome FROM pessoas p LEFT JOIN contas_bancarias c ON c.cpf_titular = p.cpf WHERE c.id IS NULL;</code>')],
  hintBtns:[L('Pedir ajuda pra Célia'),L('Ainda travado? Implorar a resposta')],
  ok:function(R){var l=linhasDe('SELECT p.nome FROM pessoas p LEFT JOIN contas_bancarias c ON c.cpf_titular = p.cpf WHERE c.id IS NULL');return R.n===l.length&&hasAll(R,l.map(function(x){return x.nome}))},
  miss:function(R,k){
    if(!R.n)return L('Voltou vazio. Usou JOIN comum? Ele tira justamente quem não tem conta. Tem que ser LEFT JOIN, e no WHERE <code>IS NULL</code> (nunca <code>= NULL</code>).');
    if(R.n>=linhasDe('SELECT cpf FROM pessoas').length)return L('Veio gente demais: falta filtrar só quem ficou sem par, com <code>WHERE c.id IS NULL</code>.');
    return esc(k,[L('Quase. Quero só quem não tem conta nenhuma.'),L('Clica em Explique esta consulta e confere o LEFT JOIN e o IS NULL.')])},
  after:L('<p>Não fez mais que a obrigação. Mas fez certo.</p>')},

 {type:'final',tema:L('Resumo do LEFT JOIN'),btn:L('Abrir o BO 1007'),
  text:L('<p>Três regras pra tarde:</p><p>1. <b>LEFT JOIN</b> mantém todo mundo da esquerda; quem não tem par vem com NULL.<br>2. <b>LEFT JOIN + IS NULL</b> = "quem não tem".<br>3. Depois de um JOIN, coluna do lado "um" <b>se repete</b>: somar ela infla o total. Some do lado "muitos", ou some antes de juntar.</p><p>O delegado precisa do tamanho do prejuízo, e não pode ter número inventado.</p>')}
 ],
 anotacoes:{arquivo:'07_left_join.txt',texto:[
  L('ANOTAÇÕES DA CÉLIA — QUEM FICA DE FORA (LEFT JOIN)'),
  '',
  L('JOIN comum: linha sem par SAI do resultado.'),
  L('LEFT JOIN: todas as linhas da tabela do FROM ficam; sem par = colunas da outra tabela vazias (NULL).'),
  '   SELECT p.nome, v.placa',
  '   FROM pessoas p',
  '   LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf;',
  '',
  L('"QUEM NÃO TEM" = LEFT JOIN + IS NULL na coluna da outra tabela.'),
  '   … WHERE v.placa IS NULL;',
  '',
  L('A SOMA QUE INFLA'),
  L('  1 nota tem N itens. No JOIN, a nota se repete N vezes.'),
  L('  SUM(n.valor_total) depois do JOIN = N vezes o valor. Número falso.'),
  L('  Certo: somar do lado "muitos" (SUM(i.quantidade * i.valor_unitario)) ou somar sem o JOIN.'),
  L('  Antes de confiar: compare com um número que você já conhece.'),
  '',
  L('FORA DAQUI (no trabalho)'),
  L('  LEFT JOIN é igual no SQLite, no PostgreSQL e no SQL Server. Também se escreve LEFT OUTER JOIN.')
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1007');save();openOcorr();renderOcorr();
  say('celia',L('O delegado quer o tamanho do prejuízo hoje. E eu quero o número de verdade, não o que o JOIN inventar.'));
 }
});
