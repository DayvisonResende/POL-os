/* Serviços do Beto ("Tem serviço?"): treino livre dos conceitos já aprendidos, pelo PolíciaZap.
   Lógica: js/core/servicos.js · motor: js/historia/servicos.js.
   Cada serviço: {id, conceitos, tabelas, variar() → lista de parâmetros, texto(p), sql(p) → a resposta é o 1º valor,
   mostrar(p) → a consulta que o Beto mostra se o jogador desistir (o que ele já sabe escrever), dica, tolerancia}.
   Regras:
   - Os valores vêm do banco: nada de número fixo no texto.
   - Nada que entregue pista da história: fora prata, Virtus, Hilux, os radares da Castelo e da Raposo,
     placas FTR/KZX, Piedade, Itu e os nomes do enredo.
   - Mistura (mais de um conceito) só aparece quando cada conceito já foi dominado sozinho. */
registrarConceito('distinct',  {nome:L('DISTINCT (sem repetir)'),             treino:'m1'});
registrarConceito('where',     {nome:L('WHERE com texto'),                    treino:'m2-filtros'});
registrarConceito('like',      {nome:L('LIKE e %'),                           treino:'m2-filtros'});
registrarConceito('and',       {nome:L('AND (duas condições)'),               treino:'m2-filtros'});
registrarConceito('comparacao',{nome:L('Comparação e BETWEEN'),               treino:'m2-intervalos'});
registrarConceito('datahora',  {nome:L('Intervalo de data e hora'),           treino:'m2-intervalos'});
registrarConceito('in',        {nome:L('IN (um entre vários)'),               treino:'m2-intervalos'});
registrarConceito('orderby',   {nome:L('ORDER BY e LIMIT'),                   treino:'m2-intervalos'});
registrarConceito('agregacao', {nome:L('COUNT, SUM, AVG, MIN e MAX'),         treino:'m3-agregacao'});
registrarConceito('groupby',   {nome:L('GROUP BY'),                           treino:'m3-agregacao'});
registrarConceito('having',    {nome:L('HAVING'),                             treino:'m3-agregacao'});
registrarConceito('null',      {nome:L('NULL (o vazio)'),                     treino:'m3-nulos'});
registrarConceito('join',      {nome:L('JOIN (cruzar tabelas)'),              treino:'m4-join'});
registrarConceito('leftjoin',  {nome:L('LEFT JOIN e "quem não tem"'),        treino:'m4-left'});

var SERV_FORA={pessoas:/Denise|Valdemar|Lucas Ferraz|Marina|Gustavo Henrique Lemos|Patrícia Nogueira Sales|Renata Campos Vidal|Osvaldo Brito Menezes|Carlos Eduardo Paiva|Fernanda Rocha Bastos|Igor Matsumoto/,cor:['prata'],modelo:['Virtus','Hilux'],radar:['Rod. Castelo Branco - Km 18','Rod. Raposo Tavares - Km 92'],cidade:['Piedade','Itu']};
function servRadares(){return linhasDe('SELECT DISTINCT local_radar AS l FROM leituras_radar ORDER BY l').map(function(r){return r.l}).filter(function(l){return SERV_FORA.radar.indexOf(l)<0})}
function servValores(tab,col,fora){return linhasDe('SELECT DISTINCT '+col+' AS v FROM '+tab+' ORDER BY v').map(function(r){return r.v}).filter(function(v){return v!=null&&(fora||[]).indexOf(v)<0})}
// Só serve se o primeiro lugar for único (empate deixaria duas respostas certas).
function servTopoUnico(sql){var l=linhasDe(sql);if(!l.length)return null;var k=Object.keys(l[0]),n=k[k.length-1];return l.length===1||l[0][n]!==l[1][n]?l[0]:null}
var SERV_SOBRENOMES=['Queiroz','Toledo','Moraes','Zanetti','Gomes','Fonseca','Oliveira','Moreira','Duarte','Junqueira'];

/* ---------- Módulo 1 ---------- */
registrarServico({id:'distinct-contar',conceitos:['distinct'],
  variar:function(){return [
    {t:'veiculos',c:'modelo',o:L('modelos de carro')},{t:'veiculos',c:'cor',o:L('cores de carro')},
    {t:'pessoas',c:'cidade',o:L('cidades no cadastro de pessoas')},{t:'catraca_acessos',c:'funcionario',o:L('funcionários na catraca')}]},
  texto:function(p){return L('Recruta, aposta comigo: quantas <b>{o}</b> diferentes tem no sistema? Eu chutei um número no café e quero ganhar essa.',{o:p.o})},
  sql:function(p){return 'SELECT COUNT(DISTINCT '+p.c+') FROM '+p.t},
  mostrar:function(p){return 'SELECT DISTINCT '+p.c+' FROM '+p.t+';'},
  dica:L('Lista sem repetir, com DISTINCT, e conta as linhas que voltarem.')});

/* ---------- Módulo 2: filtros ---------- */
registrarServico({id:'where-cor',conceitos:['where'],
  variar:function(){return servValores('veiculos','cor',SERV_FORA.cor).map(function(c){return {cor:c}})},
  texto:function(p){return L('Minha sogra jura que tem carro <b>{cor}</b> rondando a rua dela. Quantos carros dessa cor tem no cadastro? Só pra eu ter assunto no almoço de domingo.',{cor:p.cor})},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE cor = '+sq(p.cor)},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE cor = '+sq(p.cor)+';'},
  dica:L('Filtra a cor no WHERE, com aspas simples e em minúsculas, e conta as linhas.')});
registrarServico({id:'where-cidade',conceitos:['where'],
  variar:function(){return servValores('pessoas','cidade',SERV_FORA.cidade).map(function(c){return {cidade:c}})},
  texto:function(p){return L('O delegado quer saber quantas pessoas do cadastro moram em <b>{cidade}</b>. Ele pediu pra mim, mas tu é mais rápido nisso.',{cidade:p.cidade})},
  sql:function(p){return 'SELECT COUNT(*) FROM pessoas WHERE cidade = '+sq(p.cidade)},
  mostrar:function(p){return 'SELECT * FROM pessoas WHERE cidade = '+sq(p.cidade)+';'},
  dica:L('A cidade fica na tabela pessoas. WHERE cidade = \'…\', com o nome escrito igualzinho.')});
registrarServico({id:'like-sobrenome',conceitos:['like'],
  variar:function(){return SERV_SOBRENOMES.map(function(s){return {s:s}})},
  texto:function(p){return L('Tô montando a lista do amigo secreto da família <b>{s}</b>. Quantas pessoas do cadastro têm {s} em qualquer parte do nome?',{s:p.s})},
  sql:function(p){return 'SELECT COUNT(*) FROM pessoas WHERE nome LIKE '+sq('%'+p.s+'%')},
  mostrar:function(p){return 'SELECT * FROM pessoas WHERE nome LIKE '+sq('%'+p.s+'%')+';'},
  dica:L('Em qualquer parte do nome: % dos dois lados. WHERE nome LIKE \'%…%\'.')});
registrarServico({id:'like-placa-fim',conceitos:['like'],
  variar:function(){return linhasDe("SELECT substr(placa,-1) AS d, COUNT(*) AS n FROM veiculos GROUP BY d HAVING n >= 2").map(function(r){return {d:r.d}})},
  texto:function(p){return L('Saiu no jornal que placa terminada em <b>{d}</b> tem rodízio amanhã. Quantos carros do cadastro têm a placa terminando em {d}?',{d:p.d})},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE placa LIKE '+sq('%'+p.d)},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE placa LIKE '+sq('%'+p.d)+';'},
  dica:L('Termina com: o % vem antes. WHERE placa LIKE \'%…\'.')});
registrarServico({id:'and-modelo-cor',conceitos:['and'],
  variar:function(){return linhasDe('SELECT modelo, cor FROM veiculos GROUP BY modelo, cor').filter(function(r){return SERV_FORA.modelo.indexOf(r.modelo)<0&&SERV_FORA.cor.indexOf(r.cor)<0})},
  texto:function(p){return L('Um amigo meu quer comprar um <b>{modelo} {cor}</b> usado. Quantos desses tem no cadastro? Se tiver muito, ele desiste.',{modelo:p.modelo,cor:p.cor})},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE modelo = '+sq(p.modelo)+' AND cor = '+sq(p.cor)},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE modelo = '+sq(p.modelo)+' AND cor = '+sq(p.cor)+';'},
  dica:L('As duas coisas valem na mesma linha: modelo E cor. WHERE modelo = \'…\' AND cor = \'…\'.')});

/* ---------- Módulo 2: intervalos ---------- */
registrarServico({id:'comparacao-ano',conceitos:['comparacao'],
  variar:function(){return [2012,2015,2018,2020,2022].map(function(a){return {a:a}})},
  texto:function(p){return L('Seguro de carro velho é caro. Quantos carros do cadastro são de <b>{a} ou mais novos</b>?',{a:p.a})},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE ano >= '+p.a},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE ano >= '+p.a+';'},
  dica:L('"Ou mais novo" é maior ou igual: >=. Número vai sem aspas.')});
registrarServico({id:'comparacao-velocidade',conceitos:['comparacao'],
  variar:function(){return [100,110,120].map(function(v){return {v:v}})},
  texto:function(p){return L('Tô fazendo uma estatística pro pessoal do trânsito: quantas passagens de radar foram <b>acima de {v} km/h</b>?',{v:p.v})},
  sql:function(p){return 'SELECT COUNT(*) FROM leituras_radar WHERE velocidade_kmh > '+p.v},
  mostrar:function(p){return 'SELECT * FROM leituras_radar WHERE velocidade_kmh > '+p.v+';'},
  dica:L('Acima de: > (sem o igual). A coluna é velocidade_kmh.')});
registrarServico({id:'datahora-radar',conceitos:['datahora'],
  variar:function(){var l=[];servRadares().forEach(function(r){[['19:00','20:00'],['20:00','21:00'],['21:00','22:00']].forEach(function(h){l.push({r:r,h1:h[0],h2:h[1]})})});return l},
  texto:function(p){return L('Minha vizinha diz que passou no radar da <b>{r}</b> no dia 12/10 entre <b>{h1} e {h2}</b>. Quantas passagens esse radar registrou nesse horário?',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM leituras_radar WHERE local_radar = '+sq(p.r)+" AND data_hora BETWEEN '2026-10-12 "+p.h1+":00' AND '2026-10-12 "+p.h2+":00'"},
  mostrar:function(p){return 'SELECT * FROM leituras_radar WHERE local_radar = '+sq(p.r)+" AND data_hora BETWEEN '2026-10-12 "+p.h1+":00' AND '2026-10-12 "+p.h2+":00';"},
  dica:L('Data e hora completas, com segundos: BETWEEN \'2026-10-12 HH:MM:SS\' AND \'…\'. E o local no mesmo WHERE, com AND.')});
registrarServico({id:'in-modelos',conceitos:['in'],
  variar:function(){var m=servValores('veiculos','modelo',SERV_FORA.modelo),l=[];for(var i=0;i+1<m.length;i+=2)l.push({m1:m[i],m2:m[i+1]});return l},
  texto:function(p){return L('Tô entre um <b>{m1}</b> e um <b>{m2}</b>. Quantos carros do cadastro são de um desses dois modelos?',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE modelo IN ('+sq(p.m1)+', '+sq(p.m2)+')'},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE modelo IN ('+sq(p.m1)+', '+sq(p.m2)+');'},
  dica:L('Um entre vários: IN, com a lista entre parênteses. WHERE modelo IN (\'…\', \'…\').')});
registrarServico({id:'orderby-velocidade',conceitos:['orderby'],
  variar:function(){var t=servTopoUnico('SELECT placa, velocidade_kmh FROM leituras_radar WHERE local_radar NOT IN ('+SERV_FORA.radar.map(sq).join(', ')+') ORDER BY velocidade_kmh DESC LIMIT 2');return t?[{}]:[]},
  texto:function(){return L('Aposta do café, de novo: tirando as rodovias, qual foi a <b>placa</b> do carro mais rápido nos radares da cidade? Av. Dom Aguirre ou Av. São Paulo.')},
  sql:function(){return 'SELECT placa FROM leituras_radar WHERE local_radar NOT IN ('+SERV_FORA.radar.map(sq).join(', ')+') ORDER BY velocidade_kmh DESC LIMIT 1'},
  mostrar:function(){return "SELECT * FROM leituras_radar WHERE local_radar IN ('Av. Dom Aguirre', 'Av. São Paulo') ORDER BY velocidade_kmh DESC LIMIT 1;"},
  dica:L('Ordena da maior velocidade pra menor (ORDER BY … DESC) e pega a primeira linha (LIMIT 1).')});

/* ---------- Módulo 3 ---------- */
registrarServico({id:'agregacao-geral',conceitos:['agregacao'],
  variar:function(){return [
    {f:'AVG',c:'velocidade_kmh',t:'leituras_radar',o:L('a velocidade média de todas as passagens de radar'),tol:0.5},
    {f:'MAX',c:'ano',t:'veiculos',o:L('o ano do carro mais novo do cadastro'),tol:0},
    {f:'MIN',c:'ano',t:'veiculos',o:L('o ano do carro mais velho do cadastro'),tol:0},
    {f:'COUNT',c:'*',t:'pessoas',o:L('quantas pessoas tem no cadastro'),tol:0},
    {f:'AVG',c:'ano',t:'veiculos',o:L('o ano médio dos carros do cadastro'),tol:0.5}]},
  texto:function(p){return L('Pergunta rápida pro relatório do mês: me diz <b>{o}</b>. Um número só.',{o:p.o})},
  sql:function(p){return 'SELECT '+p.f+'('+p.c+') FROM '+p.t},
  tolerancia:function(p){return p.tol},
  dica:L('Uma função resume a coluna inteira: COUNT, SUM, AVG, MIN ou MAX. Qual delas responde a pergunta?')});
registrarServico({id:'groupby-topo',conceitos:['groupby'],
  variar:function(){return [
    {sql:'SELECT cor, COUNT(*) AS n FROM veiculos GROUP BY cor ORDER BY n DESC LIMIT 2',o:L('a cor de carro mais comum do cadastro')},
    {sql:'SELECT cidade, COUNT(*) AS n FROM pessoas GROUP BY cidade ORDER BY n ASC LIMIT 2',o:L('a cidade com menos gente no cadastro de pessoas')},
    {sql:'SELECT ano, COUNT(*) AS n FROM veiculos GROUP BY ano ORDER BY n DESC LIMIT 2',o:L('o ano de fabricação mais comum entre os carros')}
  ].filter(function(p){return servTopoUnico(p.sql)})},
  texto:function(p){return L('Discussão aqui na baia: qual é <b>{o}</b>? Me manda só a resposta, que eu resolvo a briga.',{o:p.o})},
  sql:function(p){return p.sql},
  mostrar:function(p){return p.sql.replace(' LIMIT 2',';')},
  dica:L('Uma contagem por grupo: SELECT coluna, COUNT(*) … GROUP BY coluna. Depois é só ver quem ganhou (ou ordenar).')});
registrarServico({id:'having-cores',conceitos:['having'],
  variar:function(){return [3,5,8].map(function(n){return {n:n}})},
  texto:function(p){return L('Quantas cores de carro aparecem <b>mais de {n} vezes</b> no cadastro? É pra uma pesquisa de seguro.',{n:p.n})},
  sql:function(p){return 'SELECT COUNT(*) FROM (SELECT cor FROM veiculos GROUP BY cor HAVING COUNT(*) > '+p.n+')'},
  mostrar:function(p){return 'SELECT cor, COUNT(*) FROM veiculos GROUP BY cor HAVING COUNT(*) > '+p.n+';'},
  dica:L('Agrupa por cor e filtra os grupos com HAVING COUNT(*) > … . Depois conta as linhas.')});
registrarServico({id:'null-descricao',conceitos:['null'],tabelas:['transferencias'],
  variar:function(){return [{sem:true},{sem:false}]},
  texto:function(p){return p.sem?L('O banco reclamou de transferência sem explicação. Quantas transferências estão <b>sem descrição</b>?'):L('E quantas transferências <b>têm</b> a descrição preenchida?')},
  sql:function(p){return 'SELECT COUNT(*) FROM transferencias WHERE descricao IS '+(p.sem?'':'NOT ')+'NULL'},
  dica:L('Vazio se procura com IS NULL (ou IS NOT NULL). Nunca com = NULL.')});

/* ---------- Misturas: só depois de dominar cada parte ---------- */
registrarServico({id:'mix-radar-mais-rapido',conceitos:['where','orderby'],
  variar:function(){return servRadares().filter(function(r){return servTopoUnico('SELECT placa, velocidade_kmh FROM leituras_radar WHERE local_radar = '+sq(r)+' ORDER BY velocidade_kmh DESC LIMIT 2')}).map(function(r){return {r:r}})},
  texto:function(p){return L('O pessoal do trânsito quer a <b>placa</b> do carro mais rápido no radar da <b>{r}</b>. Consegue?',p)},
  sql:function(p){return 'SELECT placa FROM leituras_radar WHERE local_radar = '+sq(p.r)+' ORDER BY velocidade_kmh DESC LIMIT 1'},
  mostrar:function(p){return 'SELECT * FROM leituras_radar WHERE local_radar = '+sq(p.r)+' ORDER BY velocidade_kmh DESC LIMIT 1;'},
  dica:L('Filtra o radar no WHERE e ordena pela velocidade, da maior pra menor. A primeira linha é a resposta.')});
registrarServico({id:'mix-cor-ano',conceitos:['and','comparacao'],
  variar:function(){var l=[];servValores('veiculos','cor',SERV_FORA.cor).forEach(function(c){[2015,2019].forEach(function(a){l.push({cor:c,a:a})})});return l},
  texto:function(p){return L('Quantos carros de cor <b>{cor}</b> são de <b>{a} pra frente</b>? Meu cunhado vende acessório e quer saber o tamanho do mercado.',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM veiculos WHERE cor = '+sq(p.cor)+' AND ano >= '+p.a},
  mostrar:function(p){return 'SELECT * FROM veiculos WHERE cor = '+sq(p.cor)+' AND ano >= '+p.a+';'},
  dica:L('Duas condições na mesma linha: a cor (texto, com aspas) AND o ano (número, com >=).')});
registrarServico({id:'mix-media-radar',conceitos:['where','agregacao'],
  variar:function(){return servRadares().map(function(r){return {r:r}})},
  texto:function(p){return L('Qual a <b>velocidade média</b> das passagens no radar da <b>{r}</b>? Pode mandar com vírgula mesmo.',p)},
  sql:function(p){return 'SELECT AVG(velocidade_kmh) FROM leituras_radar WHERE local_radar = '+sq(p.r)},
  tolerancia:function(){return 0.5},
  dica:L('O WHERE escolhe as passagens desse radar; o AVG faz a média delas.')});
registrarServico({id:'mix-modelo-da-cor',conceitos:['where','groupby'],
  variar:function(){return servValores('veiculos','cor',SERV_FORA.cor).map(function(c){return {cor:c,sql:'SELECT modelo, COUNT(*) AS n FROM veiculos WHERE cor = '+sq(c)+' GROUP BY modelo ORDER BY n DESC LIMIT 2'}})
    .filter(function(p){var t=servTopoUnico(p.sql);return t&&SERV_FORA.modelo.indexOf(t.modelo)<0})},
  texto:function(p){return L('Entre os carros de cor <b>{cor}</b>, qual é o <b>modelo</b> mais comum? Vou pintar o meu e não quero ficar igual a todo mundo.',p)},
  sql:function(p){return p.sql},
  mostrar:function(p){return p.sql.replace(' LIMIT 2',';')},
  dica:L('O WHERE fica só com os carros dessa cor; o GROUP BY conta por modelo. Ordena pra ver o maior.')});
registrarServico({id:'mix-sem-descricao-valor',conceitos:['null','comparacao'],tabelas:['transferencias'],
  variar:function(){return [1000,5000,9000].map(function(v){return {v:v}})},
  texto:function(p){return L('Transferência grande e sem explicação chama atenção. Quantas transferências <b>acima de R$ {v}</b> estão <b>sem descrição</b>?',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM transferencias WHERE valor > '+p.v+' AND descricao IS NULL'},
  mostrar:function(p){return 'SELECT * FROM transferencias WHERE valor > '+p.v+' AND descricao IS NULL;'},
  dica:L('Duas condições: valor > … AND descricao IS NULL.')});
registrarServico({id:'mix-radar-horario-campeao',conceitos:['datahora','groupby'],
  variar:function(){return [['19:00','21:00'],['21:00','23:59']].map(function(h){return {h1:h[0],h2:h[1],sql:"SELECT local_radar, COUNT(*) AS n FROM leituras_radar WHERE data_hora BETWEEN '2026-10-12 "+h[0]+":00' AND '2026-10-12 "+h[1]+":00' GROUP BY local_radar ORDER BY n DESC LIMIT 2"}})
    .filter(function(p){var t=servTopoUnico(p.sql);return t&&SERV_FORA.radar.indexOf(t.local_radar)<0})},
  texto:function(p){return L('No dia 12/10, entre <b>{h1} e {h2}</b>, qual radar registrou <b>mais passagens</b>? Me manda o local.',p)},
  sql:function(p){return p.sql},
  mostrar:function(p){return p.sql.replace(' LIMIT 2',';')},
  dica:L('Filtra o horário no WHERE (BETWEEN com data e hora completas) e conta por radar com GROUP BY.')});

/* ---------- Módulo 4 ---------- */
registrarServico({id:'join-dono',conceitos:['join'],
  variar:function(){return linhasDe('SELECT v.modelo, v.cor, MAX(p.nome) AS dono FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario GROUP BY v.modelo, v.cor HAVING COUNT(*) = 1')
    .filter(function(r){return SERV_FORA.modelo.indexOf(r.modelo)<0&&SERV_FORA.cor.indexOf(r.cor)<0&&!SERV_FORA.pessoas.test(r.dono)}).map(function(r){return {modelo:r.modelo,cor:r.cor}})},
  texto:function(p){return L('Bateram no meu carro e fugiram num <b>{modelo} de cor {cor}</b>. Só tem um desses no cadastro. Qual o <b>nome do dono</b>?',p)},
  sql:function(p){return 'SELECT p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.modelo = '+sq(p.modelo)+' AND v.cor = '+sq(p.cor)},
  mostrar:function(p){return 'SELECT p.nome FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.modelo = '+sq(p.modelo)+' AND v.cor = '+sq(p.cor)+';'},
  dica:L('Junte veiculos com pessoas (ON p.cpf = v.cpf_proprietario) e filtre o modelo e a cor.')});
registrarServico({id:'join-radar-cidade',conceitos:['join'],
  variar:function(){var l=[];servRadares().forEach(function(r){servValores('pessoas','cidade',SERV_FORA.cidade).forEach(function(c){l.push({r:r,c:c})})});return l},
  texto:function(p){return L('Estatística pra prefeitura: quantas passagens no radar da <b>{r}</b> foram de carros de gente de <b>{c}</b>?',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = '+sq(p.r)+' AND p.cidade = '+sq(p.c)},
  mostrar:function(p){return 'SELECT r.data_hora, p.nome FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar = '+sq(p.r)+' AND p.cidade = '+sq(p.c)+';'},
  dica:L('Três tabelas: radar → veículo (pela placa) → dono (pelo CPF). Filtre o radar e a cidade e conte.')});
registrarServico({id:'leftjoin-sem-carro',conceitos:['leftjoin'],
  variar:function(){return servValores('pessoas','cidade',SERV_FORA.cidade).map(function(c){return {c:c}})},
  texto:function(p){return L('O pessoal do transporte público quer saber: quantas pessoas de <b>{c}</b> não têm <b>nenhum carro</b> no cadastro?',p)},
  sql:function(p){return 'SELECT COUNT(*) FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL AND p.cidade = '+sq(p.c)},
  mostrar:function(p){return 'SELECT p.nome FROM pessoas p LEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf WHERE v.placa IS NULL AND p.cidade = '+sq(p.c)+';'},
  dica:L('LEFT JOIN de pessoas com veiculos e, no WHERE, quem ficou sem placa: v.placa IS NULL. Mais a cidade.')});
registrarServico({id:'mix-join-groupby',conceitos:['join','groupby'],
  variar:function(){return servValores('veiculos','cor',SERV_FORA.cor).map(function(c){return {cor:c,sql:'SELECT p.cidade, COUNT(*) AS n FROM veiculos v JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE v.cor = '+sq(c)+' GROUP BY p.cidade ORDER BY n DESC LIMIT 2'}})
    .filter(function(p){var t=servTopoUnico(p.sql);return t&&SERV_FORA.cidade.indexOf(t.cidade)<0})},
  texto:function(p){return L('Em qual <b>cidade</b> moram mais donos de carro <b>{cor}</b>? Um vendedor de pintura quer abrir loja lá.',p)},
  sql:function(p){return p.sql},
  mostrar:function(p){return p.sql.replace(' LIMIT 2',';')},
  dica:L('Junte veiculos com pessoas, filtre a cor e agrupe pela cidade do dono.')});
