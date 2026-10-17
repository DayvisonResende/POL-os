/* Diagnóstico de erros de estrutura que o SQLite não explica bem (ou nem acusa).
   Usado na tradução de erros, na dica de resultado vazio e no aviso de consulta que "funcionou por sorte".
   Nunca entrega a resposta: aponta o problema e mostra o formato com nomes genéricos. */
var CLAUSULAS=['SELECT','FROM','WHERE','GROUP BY','HAVING','ORDER BY','LIMIT'];
var ORDEM_PT='<code>SELECT</code> colunas <code>FROM</code> tabela <code>WHERE</code> filtro <code>ORDER BY</code> coluna <code>LIMIT</code> n';

// Cláusulas no nível de cima da consulta (fora de parênteses), na ordem em que aparecem: [{k:'WHERE', i:3}, …]
function clausulasSQL(ts){var out=[],d=0;ts.forEach(function(t,i){if(t==='(')d++;else if(t===')')d--;else if(d===0){var u=U(t),n=U(ts[i+1]);
  if((u==='GROUP'||u==='ORDER')&&n==='BY')out.push({k:u+' BY',i:i});else if(['SELECT','FROM','WHERE','HAVING','LIMIT'].indexOf(u)>=0)out.push({k:u,i:i})}});return out}

var OPERADORES=['=','==','!=','<>','<','>','<=','>='];
function semComparacao(c){
  if(c.ts.indexOf('(')>=0)return false;
  return !c.ts.some(function(t){return OPERADORES.indexOf(t)>=0||['LIKE','IN','BETWEEN','IS','GLOB'].indexOf(U(t))>=0});
}

// Lista de problemas encontrados (HTML). Vazia se nada óbvio estiver errado.
function diagnosticarSQL(sql,schema){
  var probs=[],ts=tokSQL(stripSqlKeepDq(sql)),semi=ts.indexOf(';');if(semi>=0)ts=ts.slice(0,semi);
  var cl=clausulasSQL(ts);
  for(var a=0;a<cl.length;a++)for(var b=a+1;b<cl.length;b++)if(CLAUSULAS.indexOf(cl[b].k)<CLAUSULAS.indexOf(cl[a].k)){
    probs.push('O <b>'+cl[a].k+'</b> veio antes do <b>'+cl[b].k+'</b>. A ordem das partes é sempre a mesma: '+ORDEM_PT+'.');a=b=cl.length}
  var depois=function(c){var f=cl.filter(function(x){return x.i>c.i})[0];return ts.slice(c.i+1,f?f.i:ts.length)};
  var w=cl.filter(function(c){return c.k==='WHERE'})[0],fr=cl.filter(function(c){return c.k==='FROM'})[0],cond=null;
  if(w)cond=depois(w);
  else if(fr){var resto=depois(fr).slice(1);   // o que vem depois do nome da tabela
    if(resto.some(function(t){return OPERADORES.indexOf(t)>=0||['LIKE','IN','BETWEEN'].indexOf(U(t))>=0})){
      probs.push('Falta o <code>WHERE</code>. Todo filtro começa com ele, logo depois do nome da tabela: <code>FROM tabela WHERE coluna = \'valor\'</code>.');cond=resto}}
  var temAgreg=function(t){return t.some(function(x,i){return AGREGACOES.indexOf(U(x))>=0&&t[i+1]==='('})};
  if(w&&temAgreg(cond))probs.push('<code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code> e <code>MAX</code> não vão no <code>WHERE</code>. O WHERE olha <b>uma linha de cada vez</b>, e essas contas são de um <b>grupo</b> de linhas. Para filtrar pelo resultado da conta, use <code>HAVING</code> depois do <code>GROUP BY</code>: <code>GROUP BY coluna HAVING COUNT(*) &gt; 3</code>.');
  var ob=cl.filter(function(c){return c.k==='ORDER BY'})[0];
  if(ob&&['ASC','DESC'].indexOf(U(ts[ob.i+2]))>=0)probs.push('Faltou a <b>coluna</b> depois do <code>ORDER BY</code>: ele precisa saber <i>pelo quê</i> ordenar. O formato é <code>ORDER BY coluna DESC</code>, por exemplo <code>ORDER BY ano DESC</code>.');
  var hv=cl.filter(function(c){return c.k==='HAVING'})[0];
  if(hv&&!cl.some(function(c){return c.k==='GROUP BY'}))probs.push('O <code>HAVING</code> filtra <b>grupos</b>, então precisa de um <code>GROUP BY</code> antes dele: <code>… GROUP BY coluna HAVING COUNT(*) &gt; 1</code>. Para filtrar linhas comuns, use <code>WHERE</code>.');
  if(cond){var conds=splitConds(cond);
    var ruim=conds.filter(semComparacao)[0];
    if(ruim)probs.push('Depois do <code>WHERE</code> vem uma comparação completa: <b>coluna</b>, <b>operador</b> e <b>valor</b>, como em <code>WHERE coluna = \'valor\'</code>. Em <code>'+escH(joinToks(ruim.ts))+'</code> falta dizer com qual coluna comparar.');
    var lk=conds.filter(function(c){var u=c.ts.map(U),i=u.indexOf('LIKE');return i===0||(i>0&&c.ts.indexOf('=')>=0)})[0];
    if(lk)probs.push('O <code>LIKE</code> fica <b>entre</b> a coluna e o padrão, e entra <b>no lugar</b> do <code>=</code>: <code>coluna LIKE \'padrão\'</code>. Em <code>'+escH(joinToks(lk.ts))+'</code> ele está fora do lugar.');
    var btw=conds.filter(function(c){var u=c.ts.map(U),i=u.indexOf('BETWEEN');if(i<0)return false;var r=u.slice(i+1),a=r.indexOf('AND');return a<1||a===r.length-1})[0];
    if(btw)probs.push('O <code>BETWEEN</code> precisa das <b>duas pontas</b> do intervalo, ligadas por <code>AND</code>: <code>coluna BETWEEN início AND fim</code>. Em <code>'+escH(joinToks(btw.ts))+'</code> está faltando ponta. Com data e hora, cada ponta vai completa e entre aspas: <code>\'2026-10-12 18:00:00\'</code>.');
    conds.forEach(function(c){var i=c.ts.map(U).indexOf('LIKE'),p=i<0?null:c.ts.slice(i+1).filter(function(t){return t.charAt(0)==="'"})[0];
      if(i>=0&&p&&p.charAt(0)==="'"&&!/[%_]/.test(p))probs.push('<code>LIKE '+escH(p)+'</code> sem <code>%</code> procura o texto <b>exato</b>: só acha o que for inteirinho igual a <code>'+escH(p)+'</code>. O <code>%</code> quer dizer "qualquer coisa": no fim, <code>\''+escH(p.slice(1,-1))+'%\'</code> é "começa com"; no começo, "termina com".')})}
  var dq=aspasDuplas(sql,schema);
  if(dq)probs.push('Texto vai entre aspas <b>simples</b>: <code>\''+escH(dq)+'\'</code>. Aspas duplas (<code>"'+escH(dq)+'"</code>) são para nome de coluna.');
  return probs;
}
function juntarProblemas(probs){
  if(probs.length===1)return probs[0];
  return 'Encontrei '+probs.length+' problemas nesta consulta:<ol class="probs">'+probs.map(function(p){return '<li>'+p+'</li>'}).join('')+'</ol>';
}
// Primeiro texto entre aspas duplas que não é nome de coluna/tabela (o SQLite aceita como texto; outros bancos não).
// Sem schema, usa as colunas e tabelas descritas no explicador.
function aspasDuplas(sql,schema){
  var m,re=/"([^"]*)"/g,s=stripSql(sql),nomes=(schema?schema.tables.concat(schema.cols):Object.keys(COLDESC).concat(Object.keys(TABDESC))).map(function(x){return x.toLowerCase()});
  while((m=re.exec(s)))if(nomes.indexOf(m[1].toLowerCase())<0)return m[1];return null;
}
// Como stripSql, mas sem apagar o conteúdo das aspas simples (mantém os tokens de valor para as mensagens).
function stripSqlKeepDq(sql){return sql.replace(/--[^\n]*/g,' ').replace(/\/\*[\s\S]*?\*\//g,' ')}

// Colunas "soltas": no SELECT, fora de agregação e fora do GROUP BY. O SQLite aceita e devolve um valor qualquer do grupo.
function colunasSoltas(sql){
  var ts=tokSQL(stripSqlKeepDq(sql)),semi=ts.indexOf(';');if(semi>=0)ts=ts.slice(0,semi);
  var cl=clausulasSQL(ts),sel=cl.filter(function(c){return c.k==='SELECT'})[0];if(!sel)return [];
  var fim=function(c){var f=cl.filter(function(x){return x.i>c.i})[0];return f?f.i:ts.length};
  var itens=[],cur=[],d=0;ts.slice(sel.i+1,fim(sel)).forEach(function(t){if(t==='(')d++;if(t===')')d--;if(t===','&&d===0){itens.push(cur);cur=[]}else cur.push(t)});if(cur.length)itens.push(cur);
  if(U((itens[0]||[])[0])==='DISTINCT')itens[0]=itens[0].slice(1);
  var ehAgreg=function(it){return AGREGACOES.indexOf(U(it[0]))>=0&&it[1]==='('};
  var gb=cl.filter(function(c){return c.k==='GROUP BY'})[0],grupo=gb?ts.slice(gb.i+2,fim(gb)).filter(function(t){return t!==','}).map(function(t){return t.toLowerCase().split('.').pop()}):null;
  if(!grupo&&!itens.some(ehAgreg))return [];   // consulta sem agrupamento: nada a avisar
  return itens.filter(function(it){
    if(ehAgreg(it))return false;
    var a=it.map(U).indexOf('AS'),expr=a>=0?it.slice(0,a):(it.length===2&&/^[A-Za-z_]/.test(it[1])?[it[0]]:it);
    if(expr.length===1&&expr[0]==='*')return true;
    if(expr.length!==1||!/^[A-Za-z_]/.test(expr[0]))return false;   // números, textos e cálculos ficam de fora
    return !grupo||grupo.indexOf(expr[0].toLowerCase().split('.').pop())<0;
  }).map(function(it){return joinToks(it)});
}
// Aviso para consulta que rodou, mas está fora do padrão (funciona no SQLite, falha em outros bancos).
function avisoSQL(sql,schema){
  var dq=aspasDuplas(sql,schema);
  var soltas=colunasSoltas(sql);
  if(soltas[0]==='*')return 'Funcionou, mas por sorte: com <code>GROUP BY</code>, cada grupo vira <b>uma linha só</b>, e o <code>*</code> pede todas as colunas. Para as colunas que não estão no GROUP BY, o SQLite mostra o valor de uma linha <b>qualquer</b> do grupo. No PostgreSQL e no SQL Server isso dá erro. Troque o <code>*</code> pelas colunas do GROUP BY e pelas contas (COUNT, SUM…).';
  if(soltas.length)return 'Funcionou, mas por sorte: <code>'+escH(soltas[0])+'</code> não está no <code>GROUP BY</code> nem dentro de uma conta (COUNT, SUM…). Então o banco não sabe <b>qual</b> valor mostrar de cada grupo, e o SQLite escolhe <b>um qualquer</b>. No PostgreSQL e no SQL Server isso dá erro. Ou coloque a coluna no GROUP BY, ou tire ela do SELECT.';
  if(dq)return 'Funcionou, mas por sorte: o SQLite aceitou <code>"'+escH(dq)+'"</code> como texto porque não existe coluna com esse nome. O certo é aspas simples, <code>\''+escH(dq)+'\'</code>. No PostgreSQL e no SQL Server, aspas duplas dão erro.';
  return null;
}
