/* Treinamento "Cruzar tabelas", antes do BO 1006 (Módulo 4, quinta-feira): JOIN, ON, apelidos, JOIN de três tabelas.
   Treina com veículos, pessoas e radares: empresas, imóveis e o galpão ficam para o BO (nada de Hilux, Km 92, Valdemar).
   Passos mold/free têm `solucao`; a peça certa do slot tem `certo:true`. */
var Q_DONOS='SELECT v.placa, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario';
registrarTreino({id:'m4-join',titulo:L('Cruzar tabelas'),
 passos:[
 {type:'msg',tema:L('Por que JOIN'),btn:L('Lembro, e foi sofrido'),
  text:L('<p>Quinta-feira. Lembra do BO 1003, na terça? Você achou a placa no radar, copiou, procurou o carro, copiou o CPF, procurou o dono. <b>Três consultas</b> e um monte de copiar e colar.</p><p>Hoje isso vira <b>uma consulta só</b>. O nome é <b>JOIN</b> ("juntar"): ele cola as linhas de duas tabelas, lado a lado, usando a coluna que liga uma à outra.</p>'),
  extra:'<div class="anat"><div><code>veiculos.cpf_proprietario</code><span>'+L('aponta para')+'</span></div><div><code>pessoas.cpf</code><span>'+L('o dono')+'</span></div></div>',
  text2:L('<p>Essa ligação está no Dicionário de Dados, na nota "aponta para". E agora tem um <b>Mapa das tabelas</b> lá, com uma seta para cada ligação.</p>')},

 {type:'run',tema:L('O primeiro JOIN'),sql:'SELECT * FROM veiculos JOIN pessoas ON pessoas.cpf = veiculos.cpf_proprietario LIMIT 5;',spot:'#runBtn',point:L('executa'),
  text:L('<p>Deixei um pronto no editor. Lê comigo: <i>junte veículos com pessoas, onde o CPF da pessoa é igual ao CPF do dono do carro</i>. O <code>ON</code> é a regra de quem combina com quem.</p><p>Executa.</p>'),
  ok:function(R){return R.n===5&&R.cols.indexOf('nome')>=0&&R.cols.indexOf('placa')>=0},
  after:L('<p>Viu? Cada linha tem o carro <b>e</b> o dono dele, lado a lado. As colunas de veículos primeiro, as de pessoas depois.</p>')},

 {type:'predict',tema:L('JOIN sem ON'),sql:'SELECT COUNT(*) FROM veiculos JOIN pessoas;',
  text:L('<p>Agora a pegadinha. Tirei o <code>ON</code>. O cadastro tem {n} veículos e {nPessoas} pessoas.</p>'),q:L('Quantas linhas esse JOIN sem ON gera?'),
  opts:[{t:L('Carros vezes pessoas: cada carro combinado com cada pessoa'),ok:true,fb:L('Isso. Sem a regra, o banco combina tudo com tudo. Executa e olha o tamanho.')},
        {t:L('Uma linha por carro'),fb:L('Seria, se ele soubesse quem é o dono de cada carro. Sem o ON, ele não sabe. Pensa de novo.')},
        {t:L('Dá erro, porque falta o ON'),fb:L('Aqui não dá erro, e é isso que é perigoso: o banco obedece e gera um monte de linha sem sentido. Tenta de novo.')}],
  ok:function(R){return R.n===1&&temNumero(R,F.nVeic*F.nPessoas)},
  after:L('<p>{n} × {nPessoas}: milhares de combinações, quase todas mentira: carro de um com dono de outro. <b>JOIN sem ON é o erro que mais derruba relatório.</b> O jogo te avisa quando acontecer.</p>')},

 {type:'msg',tema:L('Apelidos de tabela'),
  text:L('<p>Escrever <code>veiculos.cpf_proprietario</code> toda hora cansa. Dá pra dar um <b>apelido</b> para a tabela, logo depois do nome:</p><p><code>FROM veiculos v JOIN pessoas p</code></p><p>Daí em diante, <code>v.placa</code> é a placa de veículos e <code>p.nome</code> é o nome de pessoas. O ponto quer dizer "a coluna desta tabela".</p>'),
  text2:L('<p>Quando duas tabelas têm uma coluna com o mesmo nome, o apelido é obrigatório: o banco precisa saber de qual delas você está falando.</p>')},

 {type:'slot',tema:L('A regra do ON'),template:'SELECT v.placa, p.nome FROM veiculos v JOIN pessoas p ON ___;',
  text:L('<p>Escolhe a ligação certa entre carro e dono.</p>'),
  chips:[{t:'p.cpf = v.placa',bad:L('CPF com placa? Nunca vão ser iguais: o resultado volta vazio. As duas colunas do ON precisam guardar a <b>mesma informação</b>.')},
         {t:'p.cpf = v.cpf_proprietario',certo:true},
         {t:'p.nome = v.modelo',bad:L('Nome de gente com modelo de carro não liga nada. Procura a coluna de veículos que <b>aponta</b> para pessoas.')},
         {t:'v.placa = v.placa',bad:L('Isso compara o carro com ele mesmo: é sempre verdade, e vira o JOIN sem regra. A ligação é entre as <b>duas</b> tabelas.')}],
  ok:function(R){return bate(R,Q_DONOS)},
  after:L('<p>CPF com CPF. A regra é sempre essa: a coluna que <b>aponta</b> de um lado, a chave do outro.</p>')},

 {type:'mold',tema:L('Escolher as colunas'),template:"SELECT v.placa, v.modelo, p.___ FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'azul';",
  solucao:"SELECT v.placa, v.modelo, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'azul';",spot:'#sqlEd',
  text:L('<p>O delegado quer o <b>nome do dono</b> de cada carro azul. O JOIN e o WHERE estão prontos. Clica nos tracinhos e escreve a coluna do nome.</p><p>Repara: o WHERE usa o apelido também, <code>v.cor</code>.</p>'),
  ok:function(R){return bate(R,"SELECT v.placa, v.modelo, p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'azul'")},
  miss:function(R,k){return esc(k,[L('Falta o nome. Em pessoas, a coluna é <code>nome</code>.'),L('Clica nos tracinhos e escreve exatamente <code>nome</code>.')])},
  after:L('<p>Carro azul e dono, numa consulta. Na terça isso era dois passos.</p>')},

 {type:'explain',tema:L('O Explique num JOIN'),spot:'#explBtn',point:L('esse aqui'),
  text:L('<p>Clica no <b>Explique esta consulta</b> e lê como o banco entendeu o JOIN. Repara na parte do apelido e na frase de quem "sai do resultado".</p>'),
  after:L('<p>"Linha sem par sai do resultado." Guarda essa, que depois do almoço ela vira assunto.</p>')},

 {type:'mold',tema:L('Três tabelas'),template:"SELECT r.data_hora, v.placa, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON ___ WHERE r.local_radar = 'Av. São Paulo';",
  solucao:"SELECT r.data_hora, v.placa, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. São Paulo';",spot:'#sqlEd',
  text:L('<p>Agora o BO 1003 inteiro, numa consulta: <b>radar → carro → dono</b>. Cada JOIN tem o seu ON. O primeiro liga o radar ao carro, pela placa. Falta o segundo: ligar o carro ao dono.</p>'),
  ok:function(R){return bate(R,"SELECT r.data_hora, v.placa, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = 'Av. São Paulo'")},
  miss:function(R,k){if(!R.n)return L('Voltou vazio: o ON está ligando coisas diferentes? É CPF com CPF.');return esc(k,[L('O segundo ON liga pessoas a veículos, igual a antes: <code>p.cpf = v.cpf_proprietario</code>.'),L('Escreve nos tracinhos: <code>p.cpf = v.cpf_proprietario</code>')])},
  after:L('<p>Quem passou no radar, com nome e sobrenome. Três tabelas, uma consulta. É assim que se cruza base de verdade.</p>')},

 {type:'free',tema:L('JOIN do zero'),solucao:"SELECT p.nome, v.modelo FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'vermelho';",spot:'#sqlEd',
  text:L('<p>Do zero: o <b>nome do dono</b> e o <b>modelo</b> de cada carro <b>vermelho</b>.</p>'),
  hints:[L('Começa igual ao anterior: <code>FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario</code>, e filtra a cor no WHERE.'),L("<code>SELECT p.nome, v.modelo FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'vermelho';</code>")],
  hintBtns:[L('Pedir ajuda pra Célia'),L('Ainda travado? Implorar a resposta')],
  ok:function(R){var l=linhasDe("SELECT p.nome, v.modelo FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = 'vermelho'");return R.n===l.length&&hasAll(R,l.map(function(x){return x.nome}))&&hasAll(R,l.map(function(x){return x.modelo}))},
  miss:function(R,k){
    if(R.n>F.nVeic)return L('Resultado enorme: faltou o <code>ON</code>, e o banco combinou tudo com tudo.');
    if(!R.n)return L('Voltou vazio. Confere o ON (CPF com CPF) e a cor, em minúsculas: <code>\'vermelho\'</code>.');
    return esc(k,[L('Quase. Quero só os vermelhos, com o nome do dono e o modelo.'),L('Clica em Explique esta consulta e confere cada parte.')])},
  after:L('<p>Hm. Funcionou.</p>')},

 {type:'final',tema:L('Resumo do JOIN'),btn:L('Abrir o BO 1006'),
  text:L('<p>JOIN em três regras:</p><p>1. <code>FROM a JOIN b ON b.chave = a.coluna_que_aponta</code>: o ON diz quem combina com quem.<br>2. <b>Sem ON</b>, tudo combina com tudo: resultado enorme e falso.<br>3. Apelido (<code>veiculos v</code>) e <code>v.coluna</code> deixam claro de qual tabela é cada coisa.</p><p>Agora a pergunta que eu te fiz ontem: o radar viu aquela caminhonete uma vez só?</p>')}
 ],
 anotacoes:{arquivo:'06_join.txt',texto:[
  L('ANOTAÇÕES DA CÉLIA — CRUZAR TABELAS (JOIN)'),
  '',
  L('JOIN = colar as linhas de duas tabelas, lado a lado, pela coluna que liga uma à outra.'),
  '   SELECT v.placa, p.nome',
  '   FROM veiculos v',
  '   JOIN pessoas p ON p.cpf = v.cpf_proprietario;',
  '',
  L('O ON é a regra: a coluna que APONTA (veja "aponta para" no Dicionário) = a chave da outra tabela.'),
  L('   CPF com CPF, placa com placa. Coisas diferentes no ON = resultado vazio.'),
  '',
  L('SEM ON = cada linha combinada com TODAS as da outra tabela. Resultado enorme e falso.'),
  '',
  L('APELIDO: veiculos v, pessoas p. Depois, v.placa, p.nome. Obrigatório quando as duas têm a mesma coluna.'),
  '',
  L('TRÊS TABELAS: um JOIN e um ON para cada ligação.'),
  '   FROM leituras_radar r',
  '   JOIN veiculos v ON v.placa = r.placa',
  '   JOIN pessoas p ON p.cpf = v.cpf_proprietario',
  '',
  L('TRAVOU? Mapa das tabelas (no Dicionário) mostra quem liga com quem. E o Explique.'),
  '',
  L('FORA DAQUI (no trabalho)'),
  L('  O JOIN é igual no SQLite, no PostgreSQL e no SQL Server. "JOIN" sozinho é o mesmo que "INNER JOIN".')
 ].join('\n')},
 aoConcluir:function(){
  S.caseSel=indiceCaso('1006');save();openOcorr();renderOcorr();
  say('celia',L('Vai. E cruza tudo: radar, carro, dono. O que aparecer, você me mostra antes de qualquer um.'));
 }
});
