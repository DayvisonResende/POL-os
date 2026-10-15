/* Botão "Explique esta consulta": traduz a consulta para português, parte por parte. */
var COLDESC={placa:'a placa',modelo:'o modelo',cor:'a cor',ano:'o ano',cpf_proprietario:'o CPF do dono',nome:'o nome',cpf:'o CPF',cidade:'a cidade',data_nascimento:'a data de nascimento',local_radar:'o local do radar',data_hora:'a data e a hora',velocidade_kmh:'a velocidade em km/h',foto_radar_url:'o arquivo da foto',funcionario:'o funcionário',cargo:'o cargo',data:'a data',horario_entrada:'o horário de entrada',horario_saida:'o horário de saída',id:'o número do registro'};
var TABDESC={veiculos:'o cadastro de veículos do Detran',pessoas:'o cadastro de pessoas',leituras_radar:'as passagens registradas pelos radares',catraca_acessos:'o ponto dos funcionários na catraca'};
function listPt(a){return a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1]}
function colPt(t){var k=String(t).toLowerCase().split('.').pop().replace(/^"|"$/g,'');return COLDESC[k]?COLDESC[k]+' (<code>'+escH(t)+'</code>)':'<code>'+escH(t)+'</code>'}
function valPt(ts){if(ts.length===1){var t=ts[0];if(t.charAt(0)==="'")return '<code>'+escH(t)+'</code>';if(/^\d/.test(t))return '<b>'+t+'</b>';var dq=t.match(/^"(.*)"$/);if(dq&&!COLDESC[dq[1].toLowerCase()])return 'o texto <code>'+escH(t)+'</code> (atenção: texto vai entre aspas <b>simples</b>, <code>\''+escH(dq[1])+'\'</code>)';return 'o valor da coluna '+colPt(t)}return '<code>'+escH(joinToks(ts))+'</code>'}
function likePt(p){var s=String(p).replace(/^'|'$/g,''),a=s.charAt(0)==='%',b=s.slice(-1)==='%'&&s.length>1,core=s.replace(/^%/,'').replace(/%$/,'');
  if(/[%_]/.test(core))return 'segue o padrão <code>'+escH(p)+'</code>';
  if(a&&b)return 'contém <code>'+escH(core)+'</code> em qualquer parte';if(b)return 'começa com <code>'+escH(core)+'</code>';if(a)return 'termina com <code>'+escH(core)+'</code>';
  return 'é exatamente <code>'+escH(core)+'</code> (sem o % o LIKE funciona como =)'}
var OPPT={'=':'é igual a','==':'é igual a','!=':'é diferente de','<>':'é diferente de','>':'é maior que','<':'é menor que','>=':'é maior ou igual a','<=':'é menor ou igual a'};
function condPt(ts){
  if(!ts.length||ts[0]==='(')return null;
  var c=ts[0],i=1,not=false;if(U(ts[i])==='NOT'){not=true;i++}
  var op=U(ts[i]),neg=not?' não ':' ';
  if(op==='LIKE')return colPt(c)+neg+likePt(ts[i+1]||"''");
  if(op==='BETWEEN'){var a=-1;for(var k=i+1;k<ts.length;k++)if(U(ts[k])==='AND'){a=k;break}if(a<0)return null;return colPt(c)+neg+'está entre '+valPt(ts.slice(i+1,a))+' e '+valPt(ts.slice(a+1))+' (incluindo os dois extremos)'}
  if(op==='IN'){var vals=[],cur=[],close=ts.lastIndexOf(')');ts.slice(i+2,close<0?ts.length:close).forEach(function(t){if(t===','){vals.push(cur);cur=[]}else cur.push(t)});if(cur.length)vals.push(cur);return colPt(c)+neg+'é um destes valores: '+listPt(vals.map(valPt))}
  if(op==='IS')return colPt(c)+(U(ts[i+1])==='NOT'?' está preenchida':' está vazia (NULL)');
  if(OPPT[op]&&ts.length>i+1)return colPt(c)+' '+OPPT[op]+' '+valPt(ts.slice(i+1));
  return null;
}
function explainSQL(sql){
  var ts=tokSQL(sql);if(!ts.length)return {err:'O editor está vazio. Escreva uma consulta primeiro e depois peça a explicação.'};
  var semi=ts.indexOf(';'),extra=semi>=0&&semi<ts.length-1;if(semi>=0)ts=ts.slice(0,semi);
  if(U(ts[0])!=='SELECT')return {err:'Por enquanto eu só sei explicar consultas que começam com <code>SELECT</code>.'};
  var idx={},d=0;ts.forEach(function(t,i){if(t==='(')d++;else if(t===')')d--;else if(d===0){var u=U(t);
    if(u==='FROM'&&idx.FROM==null)idx.FROM=i;else if(u==='WHERE'&&idx.WHERE==null)idx.WHERE=i;else if(u==='ORDER'&&U(ts[i+1])==='BY'&&idx.ORDER==null)idx.ORDER=i;
    else if(u==='LIMIT'&&idx.LIMIT==null)idx.LIMIT=i;else if(u==='GROUP'&&idx.GROUP==null)idx.GROUP=i;else if(u==='HAVING'&&idx.HAVING==null)idx.HAVING=i}});
  var starts=Object.keys(idx).map(function(k){return [k,idx[k]]}).sort(function(a,b){return a[1]-b[1]});
  var end=function(k){var s0=idx[k];for(var j=0;j<starts.length;j++)if(starts[j][1]>s0)return starts[j][1];return ts.length};
  var selEnd=starts.length?starts[0][1]:ts.length,rows=[];
  var sel=ts.slice(1,selEnd),distinct=false;if(U(sel[0])==='DISTINCT'){distinct=true;sel=sel.slice(1)}
  var items=[],cur=[],dd=0;sel.forEach(function(t){if(t==='(')dd++;if(t===')')dd--;if(t===','&&dd===0){items.push(cur);cur=[]}else cur.push(t)});if(cur.length)items.push(cur);
  var itPt=items.map(function(it){if(!it.length)return '<i>(uma coluna em branco: sobrou uma vírgula?)</i>';var a=-1;it.forEach(function(t,k){if(U(t)==='AS')a=k});var expr=a>=0?it.slice(0,a):it,alias=a>=0?it[a+1]:null;
    if(a<0&&it.length===2&&/^[A-Za-z_]/.test(it[1])&&it[0]!=='*'){expr=[it[0]];alias=it[1]}
    var e=(expr.length===1&&expr[0]==='*')?'<b>todas as colunas</b>':expr.length===1?colPt(expr[0]):(U(expr[0])==='COUNT'?'a <b>contagem</b> de linhas':'o cálculo <code>'+escH(joinToks(expr))+'</code>');
    return e+(alias?', com o apelido <b>'+escH(String(alias).replace(/^["']|["']$/g,''))+'</b> no resultado':'')});
  rows.push({code:joinToks(ts.slice(0,selEnd)),pt:items.length?'Mostre '+(distinct?'<b>sem repetir</b> ':'')+listPt(itPt):'Mostre… o quê? Faltam as colunas depois do SELECT.'});
  if(idx.FROM==null)rows.push({code:'(sem FROM)',pt:'Falta dizer de qual tabela vêm os dados: <code>FROM nome_da_tabela</code>.'});
  else{var ft=ts.slice(idx.FROM,end('FROM')),tb=String(ft[1]||''),tk=tb.toLowerCase();
    rows.push({code:joinToks(ft),pt:!tb?'da tabela… qual? Falta o nome dela depois do FROM.':TABDESC[tk]?'da tabela <b>'+escH(tb)+'</b>, que é '+TABDESC[tk]:'da tabela <b>'+escH(tb)+'</b>. Atenção: essa tabela não existe no banco.'})}
  if(idx.WHERE!=null){splitConds(ts.slice(idx.WHERE+1,end('WHERE'))).forEach(function(c,k){var p=condPt(c.ts)||'a condição <code>'+escH(joinToks(c.ts))+'</code> for verdadeira';
    rows.push({code:(k===0?'WHERE ':c.conn+' ')+joinToks(c.ts),pt:k===0?'mas só as linhas em que '+p:(c.conn==='AND'?'<b>e também</b> ':'<b>ou então</b> ')+p})})}
  if(idx.GROUP!=null)rows.push({code:joinToks(ts.slice(idx.GROUP,end('GROUP'))),pt:'agrupando as linhas iguais (isso é assunto do Módulo 3)'});
  if(idx.HAVING!=null)rows.push({code:joinToks(ts.slice(idx.HAVING,end('HAVING'))),pt:'filtrando os grupos (assunto do Módulo 3)'});
  if(idx.ORDER!=null){var ob=ts.slice(idx.ORDER+2,end('ORDER')),parts=[],c2=[];ob.forEach(function(t){if(t===','){parts.push(c2);c2=[]}else c2.push(t)});if(c2.length)parts.push(c2);
    rows.push({code:joinToks(ts.slice(idx.ORDER,end('ORDER'))),pt:'em ordem de '+listPt(parts.map(function(pp){var dir=U(pp[pp.length-1]),col=(dir==='DESC'||dir==='ASC')?pp.slice(0,-1):pp;return colPt(joinToks(col))+(dir==='DESC'?', do maior para o menor':', do menor para o maior')}))})}
  if(idx.LIMIT!=null){var lt=ts.slice(idx.LIMIT,end('LIMIT'));rows.push({code:joinToks(lt),pt:lt[1]?'e mostre no máximo <b>'+escH(lt[1])+'</b> linha'+(lt[1]==='1'?'':'s'):'LIMIT precisa de um número depois. Exemplo: <code>LIMIT 5</code>'})}
  rows.push({code:';',pt:semi>=0?'Fim da consulta.':'Faltou o ponto e vírgula no fim. O banco aceita sem ele, mas é bom costume colocar.'});
  return {rows:rows,extra:extra};
}
