/* Botão "Explique esta consulta": traduz a consulta para português, parte por parte. */
var COLDESC={placa:'a placa',modelo:'o modelo',cor:'a cor',ano:'o ano',cpf_proprietario:'o CPF do dono',nome:'o nome',cpf:'o CPF',cidade:'a cidade',data_nascimento:'a data de nascimento',local_radar:'o local do radar',data_hora:'a data e a hora',velocidade_kmh:'a velocidade em km/h',foto_radar_url:'o arquivo da foto',funcionario:'o funcionário',cargo:'o cargo',data:'a data',horario_entrada:'o horário de entrada',horario_saida:'o horário de saída',id:'o número do registro',banco:'o banco',agencia:'a agência',numero:'o número da conta',cpf_titular:'o CPF do titular',conta_origem:'a conta de origem',conta_destino:'a conta de destino',valor:'o valor',descricao:'a descrição',aberta_em:'a data de abertura',cnpj:'o CNPJ',razao_social:'o nome da empresa',cpf_responsavel:'o CPF do responsável',tipo:'o tipo de imóvel',endereco:'o endereço',bairro:'o bairro',referencia:'a referência (rodovia e km)',cnpj_locatario:'o CNPJ de quem alugou',alugado_em:'a data do aluguel',numero_nf:'o número da nota',cnpj_emitente:'o CNPJ de quem vendeu',cnpj_transportadora:'o CNPJ da transportadora',data_emissao:'a data da nota',valor_total:'o valor total da nota',nota_id:'o número da nota (id)',produto:'o produto',quantidade:'a quantidade',valor_unitario:'o preço de uma unidade'};
var TABDESC={veiculos:'o cadastro de veículos do Detran',pessoas:'o cadastro de pessoas',leituras_radar:'as passagens registradas pelos radares',catraca_acessos:'o ponto dos funcionários na catraca',contas_bancarias:'o cadastro de contas bancárias',transferencias:'as transferências de dinheiro entre contas',empresas:'o cadastro de empresas',imoveis:'o cadastro de imóveis',notas_fiscais:'as notas fiscais',itens_nota:'os itens de cada nota fiscal'};
function listPt(a){return a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1]}
function colPt(t){var k=String(t).toLowerCase().split('.').pop().replace(/^"|"$/g,'');return COLDESC[k]?COLDESC[k]+' (<code>'+escH(t)+'</code>)':'<code>'+escH(t)+'</code>'}
function valPt(ts){if(ts.length===1){var t=ts[0];if(t.charAt(0)==="'")return '<code>'+escH(t)+'</code>';if(/^\d/.test(t))return '<b>'+t+'</b>';var dq=t.match(/^"(.*)"$/);if(dq&&!COLDESC[dq[1].toLowerCase()])return 'o texto <code>'+escH(t)+'</code> (atenção: texto vai entre aspas <b>simples</b>, <code>\''+escH(dq[1])+'\'</code>)';return COLDESC[String(t).toLowerCase().split('.').pop()]?colPt(t):'o valor da coluna '+colPt(t)}return '<code>'+escH(joinToks(ts))+'</code>'}
function likePt(p){var s=String(p).replace(/^'|'$/g,''),a=s.charAt(0)==='%',b=s.slice(-1)==='%'&&s.length>1,core=s.replace(/^%/,'').replace(/%$/,'');
  if(/[%_]/.test(core))return 'segue o padrão <code>'+escH(p)+'</code>';
  if(a&&b)return 'contém <code>'+escH(core)+'</code> em qualquer parte';if(b)return 'começa com <code>'+escH(core)+'</code>';if(a)return 'termina com <code>'+escH(core)+'</code>';
  return 'é exatamente <code>'+escH(core)+'</code> (sem o % o LIKE funciona como =)'}
// "de" + artigo: de o valor → do valor, de a cor → da cor.
function de(pt){return /^o /.test(pt)?'do '+pt.slice(2):/^a /.test(pt)?'da '+pt.slice(2):/^os /.test(pt)?'dos '+pt.slice(3):/^as /.test(pt)?'das '+pt.slice(3):'de '+pt}
var AGREGACOES=['COUNT','SUM','AVG','MIN','MAX'];
// COUNT(*), COUNT(col), COUNT(DISTINCT col), SUM(col), AVG, MIN, MAX → português. null se não for uma agregação simples.
function aggPt(ts){
  var f=U(ts[0]);if(AGREGACOES.indexOf(f)<0||ts[1]!=='('||ts[ts.length-1]!==')')return null;
  var dentro=ts.slice(2,-1),dist=U(dentro[0])==='DISTINCT',arg=dist?dentro.slice(1):dentro;
  var a=arg.length===1&&arg[0]==='*'?null:arg.length===1?colPt(arg[0]):'<code>'+escH(joinToks(arg))+'</code>';
  if(f==='COUNT')return !a?'a <b>quantidade de linhas</b>':dist?'quantos valores <b>diferentes</b> '+de(a)+' existem':'quantas linhas têm '+a+' preenchido';
  if(!a)return null;
  return {SUM:'a <b>soma</b> ',AVG:'a <b>média</b> ',MIN:'o <b>menor valor</b> ',MAX:'o <b>maior valor</b> '}[f]+de(a);
}
// COALESCE(coluna, 'valor') → "o valor da coluna, ou 'valor' quando ela estiver vazia (NULL)"
function coalescePt(ts){
  if(U(ts[0])!=='COALESCE'||ts[1]!=='('||ts[ts.length-1]!==')')return null;
  var args=[],cur=[],d=0;ts.slice(2,-1).forEach(function(t){if(t==='(')d++;if(t===')')d--;if(t===','&&d===0){args.push(cur);cur=[]}else cur.push(t)});if(cur.length)args.push(cur);
  if(args.length<2)return null;
  return L('{coluna}, ou {troca} quando estiver vazio (NULL)',{coluna:args[0].length===1?colPt(args[0][0]):'<code>'+escH(joinToks(args[0]))+'</code>',troca:valPt(args[args.length-1])});
}
var OPPT={'=':'é igual a','==':'é igual a','!=':'é diferente de','<>':'é diferente de','>':'é maior que','<':'é menor que','>=':'é maior ou igual a','<=':'é menor ou igual a'};
function condPt(ts){
  if(!ts.length||ts[0]==='(')return null;
  var c,i;
  if(AGREGACOES.indexOf(U(ts[0]))>=0&&ts[1]==='('){   // ex.: COUNT(*) > 3
    var d=0,j=-1;for(var k0=1;k0<ts.length;k0++){if(ts[k0]==='(')d++;else if(ts[k0]===')'&&--d===0){j=k0;break}}
    if(j<0||!(c=aggPt(ts.slice(0,j+1))))return null;i=j+1;
  }else{c=colPt(ts[0]);i=1}
  var not=false;if(U(ts[i])==='NOT'){not=true;i++}
  var op=U(ts[i]),neg=not?' não ':' ';
  if(op==='LIKE')return c+neg+likePt(ts[i+1]||"''");
  if(op==='BETWEEN'){var a=-1;for(var k=i+1;k<ts.length;k++)if(U(ts[k])==='AND'){a=k;break}if(a<0)return null;return c+neg+'está entre '+valPt(ts.slice(i+1,a))+' e '+valPt(ts.slice(a+1))+' (incluindo os dois extremos)'}
  if(op==='IN'){var vals=[],cur=[],close=ts.lastIndexOf(')');ts.slice(i+2,close<0?ts.length:close).forEach(function(t){if(t===','){vals.push(cur);cur=[]}else cur.push(t)});if(cur.length)vals.push(cur);return c+neg+'é um destes valores: '+listPt(vals.map(valPt))}
  if(op==='IS')return c+(U(ts[i+1])==='NOT'?' tem valor (não é NULL)':' não tem valor (é NULL, vazio)');
  if(OPPT[op]&&ts.length>i+1)return c+' '+(OPPT[op]+' '+valPt(ts.slice(i+1))).replace(/\ba o /,'ao ').replace(/\ba a /,'à ').replace(/\ba os /,'aos ').replace(/\ba as /,'às ');
  return null;
}
/* FROM com JOIN (Módulo 4): separa "FROM a x JOIN b y ON … LEFT JOIN c ON …" (e "FROM a, b") em partes:
   {tipo:'FROM'|'JOIN'|'LEFT'|'CROSS'|',', tabela, apelido, on:[tokens], ts:[tokens da parte]}. */
var JOIN_PALAVRAS=['JOIN','INNER','LEFT','RIGHT','FULL','CROSS','OUTER','ON','USING'];
function partesFrom(ft){
  var partes=[],cur=null,d=0;
  for(var i=0;i<ft.length;i++){var t=ft[i],u=U(t);
    if(t==='(')d++;else if(t===')')d--;
    var novo=d===0&&(i===0||t===','||((u==='INNER'||u==='LEFT'||u==='RIGHT'||u==='FULL'||u==='CROSS')&&!(cur&&cur.abrindo))||(u==='JOIN'&&!(cur&&cur.abrindo)));
    if(novo){cur={tipo:i===0?'FROM':t===','?',':u==='JOIN'?'JOIN':u,ts:[],on:null,abrindo:u!=='JOIN'&&i!==0&&t!==','};partes.push(cur)}
    if(u==='JOIN'&&cur)cur.abrindo=false;
    cur.ts.push(t);
    if(d===0&&(u==='ON'||u==='USING'))cur.on=[];else if(cur.on)cur.on.push(t);
  }
  partes.forEach(function(p){var nomes=p.ts.slice(1).filter(function(t){var u=U(t);return JOIN_PALAVRAS.indexOf(u)<0&&u!=='AS'});
    var ate=p.on?p.ts.length-p.on.length-1:p.ts.length,cab=p.ts.slice(1,ate).filter(function(t){var u=U(t);return JOIN_PALAVRAS.indexOf(u)<0&&u!=='AS'});
    p.tabela=cab[0]||'';p.apelido=cab[1]||null;delete p.abrindo});
  return partes;
}
function tabelaPt(t,apelido){var tk=String(t).toLowerCase(),d=TABDESC[tk],extra=[];if(d)extra.push(d);if(apelido)extra.push('apelido <b>'+escH(apelido)+'</b>');
  return 'a tabela <b>'+escH(t)+'</b>'+(extra.length?' ('+extra.join('; ')+')':'')+(d?'':'. Atenção: essa tabela não existe no banco')}
function fromPt(p,k){
  if(!p.tabela)return 'Faltou o nome da tabela aqui.';
  if(p.tipo==='FROM')return 'da tabela <b>'+escH(p.tabela)+'</b>'+(TABDESC[String(p.tabela).toLowerCase()]?', que '+(/^(as|os) /.test(TABDESC[String(p.tabela).toLowerCase()])?'são ':'é ')+TABDESC[String(p.tabela).toLowerCase()]:'. Atenção: essa tabela não existe no banco')+(p.apelido?' (apelido <b>'+escH(p.apelido)+'</b>: daqui em diante, <code>'+escH(p.apelido)+'.coluna</code> quer dizer uma coluna dela)':'');
  var liga=p.on&&p.on.length?splitConds(p.on).map(function(c){return condPt(c.ts)||'<code>'+escH(joinToks(c.ts))+'</code>'}).join(' e '):null;
  if(p.tipo===','||p.tipo==='CROSS'||!liga){
    var base='e também '+tabelaPt(p.tabela,p.apelido)+'. ';
    return base+(p.tipo===','?'Sem dizer aqui como as duas se ligam, cada linha é combinada com <b>todas</b> as da outra; a ligação precisa vir no WHERE (ex.: <code>WHERE a.cpf = b.cpf</code>). Com JOIN … ON fica mais claro.':'<b>Sem ON</b>, cada linha é combinada com <b>todas</b> as linhas da outra tabela (são milhares de combinações sem sentido). Diga com <code>ON</code> qual coluna liga as duas.');
  }
  var esq=p.tipo==='LEFT';
  return (esq?'mantendo <b>todas</b> as linhas que já tinha e ':'')+'juntando cada linha com a linha '+de(tabelaPt(p.tabela,p.apelido))+' em que '+liga+
    (esq?'. Se não achar nenhuma, a linha <b>continua</b> no resultado, com as colunas '+de('<b>'+escH(p.tabela)+'</b>')+' vazias (NULL)':'. Linha sem par nas duas tabelas <b>sai</b> do resultado');
}
// apelido.coluna (v.placa) vira um nome só, para ser explicado como coluna
function juntarPontos(ts){var o=[];for(var i=0;i<ts.length;i++){if(ts[i+1]==='.'&&/^[A-Za-z_]/.test(ts[i])&&/^([A-Za-z_]|\*)/.test(ts[i+2]||'')){o.push(ts[i]+'.'+ts[i+2]);i+=2}else o.push(ts[i])}return o}
function explainSQL(sql){
  var ts=juntarPontos(tokSQL(sql));if(!ts.length)return {err:'O editor está vazio. Escreva uma consulta primeiro e depois peça a explicação.'};
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
  var temAg=false;
  var itPt=items.map(function(it){if(!it.length)return '<i>(uma coluna em branco: sobrou uma vírgula?)</i>';var a=-1;it.forEach(function(t,k){if(U(t)==='AS')a=k});var expr=a>=0?it.slice(0,a):it,alias=a>=0?it[a+1]:null;
    if(a<0&&it.length===2&&/^[A-Za-z_]/.test(it[1])&&it[0]!=='*'){expr=[it[0]];alias=it[1]}
    var ag=aggPt(expr),co=coalescePt(expr);
    var e=(expr.length===1&&expr[0]==='*')?'<b>todas as colunas</b>':(expr.length===1&&/\.\*$/.test(expr[0]))?'<b>todas as colunas</b> de <b>'+escH(expr[0].slice(0,-2))+'</b>':expr.length===1?colPt(expr[0]):ag?(temAg=true,ag+(idx.GROUP!=null?' <i>em cada grupo</i>':'')):co?co:'o cálculo <code>'+escH(joinToks(expr))+'</code>';
    return e+(alias?', com o apelido <b>'+escH(String(alias).replace(/^["']|["']$/g,''))+'</b> no resultado':'')});
  rows.push({code:joinToks(ts.slice(0,selEnd)),pt:items.length?'Mostre '+(distinct?'<b>sem repetir</b> ':'')+listPt(itPt):'Mostre… o quê? Faltam as colunas depois do SELECT.'});
  if(temAg&&idx.GROUP==null)rows.push({code:'(sem GROUP BY)',pt:'Como não tem GROUP BY, cada conta é feita <b>uma vez só</b>, sobre todas as linhas que passarem pelo filtro: o resultado tem uma linha.'});
  if(idx.FROM==null)rows.push({code:'(sem FROM)',pt:'Falta dizer de qual tabela vêm os dados: <code>FROM nome_da_tabela</code>.'});
  else{var ft=ts.slice(idx.FROM,end('FROM'));
    if(!ft[1])rows.push({code:joinToks(ft),pt:'da tabela… qual? Falta o nome dela depois do FROM.'});
    else partesFrom(ft).forEach(function(pt,k){rows.push({code:joinToks(pt.ts),pt:fromPt(pt,k)})})}
  if(idx.WHERE!=null){splitConds(ts.slice(idx.WHERE+1,end('WHERE'))).forEach(function(c,k){var p=condPt(c.ts)||'a condição <code>'+escH(joinToks(c.ts))+'</code> for verdadeira';
    rows.push({code:(k===0?'WHERE ':c.conn+' ')+joinToks(c.ts),pt:k===0?'mas só as linhas em que '+p:(c.conn==='AND'?'<b>e também</b> ':'<b>ou então</b> ')+p})})}
  if(idx.GROUP!=null){var gb=ts.slice(idx.GROUP+2,end('GROUP')),gc=[],g1=[];gb.forEach(function(t){if(t===','){gc.push(g1);g1=[]}else g1.push(t)});if(g1.length)gc.push(g1);
    rows.push({code:joinToks(ts.slice(idx.GROUP,end('GROUP'))),pt:gc.length?'separando as linhas em <b>grupos</b>: um grupo para cada valor diferente '+de(listPt(gc.map(function(g){return colPt(joinToks(g))})))+'. As contas do SELECT (COUNT, SUM…) são feitas dentro de cada grupo, e cada grupo vira <b>uma linha</b> no resultado':'GROUP BY precisa da coluna que forma os grupos. Exemplo: <code>GROUP BY cidade</code>'})}
  if(idx.HAVING!=null){splitConds(ts.slice(idx.HAVING+1,end('HAVING'))).forEach(function(c,k){var p=condPt(c.ts)||'a condição <code>'+escH(joinToks(c.ts))+'</code> for verdadeira';
    rows.push({code:(k===0?'HAVING ':c.conn+' ')+joinToks(c.ts),pt:k===0?'e mostre só os <b>grupos</b> em que '+p:(c.conn==='AND'?'<b>e também</b> ':'<b>ou então</b> ')+p})})}
  if(idx.ORDER!=null){var ob=ts.slice(idx.ORDER+2,end('ORDER')),parts=[],c2=[];ob.forEach(function(t){if(t===','){parts.push(c2);c2=[]}else c2.push(t)});if(c2.length)parts.push(c2);
    rows.push({code:joinToks(ts.slice(idx.ORDER,end('ORDER'))),pt:'em ordem '+de(listPt(parts.map(function(pp){var dir=U(pp[pp.length-1]),col=(dir==='DESC'||dir==='ASC')?pp.slice(0,-1):pp;return (aggPt(col)||colPt(joinToks(col)))+(dir==='DESC'?', do maior para o menor':', do menor para o maior')})))})}
  if(idx.LIMIT!=null){var lt=ts.slice(idx.LIMIT,end('LIMIT'));rows.push({code:joinToks(lt),pt:lt[1]?'e mostre no máximo <b>'+escH(lt[1])+'</b> linha'+(lt[1]==='1'?'':'s'):'LIMIT precisa de um número depois. Exemplo: <code>LIMIT 5</code>'})}
  rows.push({code:';',pt:semi>=0?'Fim da consulta.':'Faltou o ponto e vírgula no fim. O banco aceita sem ele, mas é bom costume colocar.'});
  return {rows:rows,extra:extra};
}
