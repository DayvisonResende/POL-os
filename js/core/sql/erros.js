/* Tradução de erros do SQLite e dicas para resultado vazio. */
/* Comandos de outros bancos (PostgreSQL, SQL Server, MySQL) que o SQLite não conhece. Quem vem do mercado
   escreve assim por hábito (playtest de 17/10: data_hora::date); o erro do SQLite não diz isso. Ver docs/dialetos-sql.md. */
var DIALETOS=[
 [/::\s*[a-z]/i,'O <code>::</code> é o jeito do <b>PostgreSQL</b> de converter tipo (como em <code>coluna::date</code>). Aqui, use <code>CAST(coluna AS tipo)</code>. Para pegar um dia inteiro, compare data e hora completas: <code>data_hora BETWEEN \'AAAA-MM-DD 00:00:00\' AND \'AAAA-MM-DD 23:59:59\'</code>.'],
 [/\bSELECT\s+(DISTINCT\s+)?TOP\b/i,'O <code>TOP</code> é do <b>SQL Server</b>. Aqui o limite vai no <b>fim</b> da consulta: <code>SELECT * FROM tabela LIMIT 5;</code>'],
 [/\bILIKE\b/i,'O <code>ILIKE</code> é do <b>PostgreSQL</b>. Aqui o próprio <code>LIKE</code> já ignora maiúsculas e minúsculas (nas letras sem acento): <code>WHERE nome LIKE \'%silva%\'</code>.'],
 [/\b(NOW|GETDATE|SYSDATETIME|CURDATE)\s*\(/i,'Essa função de data e hora de agora é de outro banco (<code>NOW()</code> no PostgreSQL e no MySQL, <code>GETDATE()</code> no SQL Server). Aqui é <code>datetime(\'now\')</code>. Nos casos do jogo, porém, as datas são de outubro de 2026: compare com a data escrita, como <code>\'2026-10-12 20:00:00\'</code>.'],
 [/\bISNULL\s*\(/i,'O <code>ISNULL(coluna, valor)</code> é do <b>SQL Server</b>. Aqui, e em qualquer banco, use <code>COALESCE(coluna, valor)</code>.'],
 [/\bLEN\s*\(/i,'O <code>LEN()</code> é do <b>SQL Server</b>. Aqui o tamanho de um texto é <code>LENGTH(coluna)</code>.'],
 [/\b(DATEDIFF|DATEADD|DATEPART)\s*\(/i,'Essa função de datas é do <b>SQL Server</b>. Aqui as datas são texto no formato <code>AAAA-MM-DD HH:MM:SS</code>: para filtrar um período, use <code>BETWEEN</code> com data e hora completas.'],
 [/\bCONCAT\s*\(/i,'Este banco não tem <code>CONCAT()</code>. Para juntar textos, use <code>||</code>: <code>nome || \' - \' || cidade</code>.'],
 [/\bEXTRACT\s*\(/i,'O <code>EXTRACT()</code> é do <b>PostgreSQL</b>. Aqui, para pegar o ano de uma data, use <code>strftime(\'%Y\', coluna)</code>.']
];
function dialetoSQL(sql){var semTexto=String(sql).replace(/'(?:[^']|'')*'/g,"''");for(var i=0;i<DIALETOS.length;i++)if(DIALETOS[i][0].test(semTexto))return DIALETOS[i][1];return null}
/* Onde está o erro, para sublinhar no editor (ideia do Database Detective: o erro aponta o lugar).
   Devolve {ini,fim} (posições no texto da consulta) ou null. O SQLite não diz a posição: procuramos a palavra
   que ele cita, fora de textos entre aspas e comentários. Se ela aparece mais de uma vez (dois WHERE), testar(trecho)
   devolve a mensagem do banco para a consulta cortada logo depois de cada ocorrência: a culpada é a primeira em que
   o banco já reclama dela (antes dela, ele só diria que a consulta está incompleta). */
function tokensSQL(sql){
  var re=/(--[^\n]*)|('(?:[^']|'')*'?)|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?)|(\d+(?:\.\d+)?)|(\S)/g,m,out=[];
  while((m=re.exec(sql)))out.push({t:m[0],ini:m.index,fim:m.index+m[0].length,com:!!m[1],txt:!!m[2]});
  return out;
}
function localErroSQL(msg,sql,testar,schema){
  var m,tk=tokensSQL(sql).filter(function(t){return !t.com}),achar=function(alvo,cond){
    alvo=String(alvo).toLowerCase();
    for(var i=0;i<tk.length;i++){var t=tk[i];if(t.txt)continue;
      if(t.t.toLowerCase()===alvo&&(!cond||cond(i)))return {ini:t.ini,fim:t.fim};
      // "v.placa2" citado como "placa2", ou o contrário
      if(t.t.indexOf('.')>0&&t.t.toLowerCase().split('.').pop()===alvo&&(!cond||cond(i)))return {ini:t.ini,fim:t.fim}}
    return null};
  msg=String(msg);
  var parenAberto=function(){var pilha=[];tk.forEach(function(t){if(t.txt)return;if(t.t==='(')pilha.push(t);else if(t.t===')')pilha.pop()});return pilha.length?pilha[pilha.length-1]:null};
  // o banco tropeça no ; do fim, mas o problema é o parêntese que ficou aberto
  if(/near ";": syntax error/.test(msg)){var pa=parenAberto();if(pa)return {ini:pa.ini,fim:pa.fim}}
  // palavra-chave digitada errada (FORM, WERE…): é dela que a mensagem fala (translateError usa o mesmo kwTypo),
  // mesmo quando o banco só tropeça na palavra seguinte ("modelo FORM veiculos": FORM vira apelido de coluna)
  if(/syntax error/.test(msg)&&schema&&typeof kwTypo==='function'){var ty=kwTypo(sql,schema),a=ty&&achar(ty[0]);if(a)return a}
  if((m=msg.match(/near "([^"]+)": syntax error/))&&testar){
    var alvo=m[1].toLowerCase(),cands=tk.filter(function(t){return !t.txt&&t.t.toLowerCase()===alvo});
    if(cands.length>1)for(var c=0;c<cands.length;c++){var r=null;try{r=testar(sql.slice(0,cands[c].fim))}catch(e){r=String(e.message||e)}
      if(r&&r.indexOf('near "'+m[1]+'"')>=0)return {ini:cands[c].ini,fim:cands[c].fim}}
  }
  if(m&&/syntax error/.test(msg))return achar(m[1])||(function(){
    // símbolo colado em outro ("SELECT*"): procura o texto cru, fora de aspas
    var i=-1,alvo=m[1];tk.some(function(t){if(!t.txt&&t.t.indexOf(alvo)>=0){i=t.ini+t.t.indexOf(alvo);return true}});return i<0?null:{ini:i,fim:i+alvo.length}})();
  if((m=msg.match(/no such (?:column|table): (\S+)/))||(m=msg.match(/ambiguous column name: (\S+)/)))return achar(m[1])||achar(m[1].split('.').pop());
  if((m=msg.match(/no such function: (\S+)/)))return achar(m[1],function(i){return tk[i+1]&&tk[i+1].t==='('});
  if(/incomplete input|unrecognized token/.test(msg)){
    // aspas que não fecharam; senão, o último parêntese aberto sem par; senão, a última palavra
    var aberta=tk.filter(function(t){return t.txt&&(t.t.length<2||t.t.slice(-1)!=="'")})[0];if(aberta)return {ini:aberta.ini,fim:aberta.fim};
    var p=parenAberto();if(p)return {ini:p.ini,fim:p.fim};
    var u=tk.filter(function(t){return t.t!==';'}).pop();return u?{ini:u.ini,fim:u.fim}:null;
  }
  return null;
}
function translateError(msg,sql,schema){
  var m,tables=schema.tables,cols=schema.cols,dl=dialetoSQL(sql);
  if(dl)return dl;
  if((m=msg.match(/no such table: (\S+)/))){var s=closest(m[1].split('.').pop(),tables,3);return 'A tabela <b>'+escH(m[1])+'</b> não existe.'+(s?' Você quis dizer <code>'+s+'</code>?':'')+' Os nomes certos estão no Dicionário de Dados, à direita.'}
  if((m=msg.match(/no such column: (\S+)/))&&m[1].indexOf('.')>0){var pre=m[1].split('.')[0],col=m[1].split('.').pop(),tq=tabelasDaConsulta(sql),tab=tq[pre.toLowerCase()];
    if(!tab)return 'O apelido <b>'+escH(pre)+'</b> não foi definido nesta consulta. Dê o apelido logo depois do nome da tabela: <code>FROM tabela '+escH(pre)+'</code> ou <code>JOIN tabela '+escH(pre)+' ON …</code>.';
    var cs=(schema.info&&schema.info[tab]||[]).map(function(c){return c.name}),sug=closest(col,cs);
    return 'A tabela <b>'+escH(tab)+'</b>'+(pre.toLowerCase()!==tab?' (apelido <b>'+escH(pre)+'</b>)':'')+' não tem a coluna <b>'+escH(col)+'</b>.'+(sug?' Você quis dizer <code>'+escH(pre)+'.'+sug+'</code>?':' Confira no Dicionário de Dados de qual tabela ela é.')}
  if((m=msg.match(/no such column: (\S+)/))){var nm=m[1],base=nm.split('.').pop(),s2=closest(base,cols);
    if(/^(asc|desc)$/i.test(base)){var po=diagnosticarSQL(sql,schema);if(po.length)return juntarProblemas(po)}
    if(s2)return 'Não existe coluna chamada <b>'+escH(nm)+'</b>. Você quis dizer <code>'+s2+'</code>?';
    return 'Não existe coluna chamada <b>'+escH(nm)+'</b>. Se <b>'+escH(base)+'</b> é um valor de texto, e não o nome de uma coluna, coloque entre aspas simples: <code>\''+escH(base)+'\'</code>.'}
  if((m=msg.match(/near "([^"]+)": syntax error/))){var tok=m[1],up=tok.toUpperCase();
    if(up==='FROM'&&/,\s*from\b/i.test(sql))return 'Sobrou uma vírgula antes do <code>FROM</code>. A última coluna da lista não leva vírgula.';
    if(up==='SELECT')return 'Parece que há duas consultas grudadas. Termine cada uma com <code>;</code> ou apague a que você não quer rodar.';
    var ty=kwTypo(sql,schema);
    var pr=diagnosticarSQL(sql,schema);if(pr.length&&!ty)return juntarProblemas(pr);
    if(ty)return 'O banco não conhece a palavra <b>'+escH(ty[0])+'</b>. Será que você quis dizer <code>'+ty[1]+'</code>?';
    if(up==='WHERE'&&!/\bfrom\b/i.test(sql))return 'Falta o <code>FROM</code> dizendo de qual tabela vêm os dados, antes do WHERE.';
    return 'O banco se perdeu perto de <b>'+escH(tok)+'</b>. Confira a ordem das partes: <code>SELECT</code> colunas <code>FROM</code> tabela <code>WHERE</code> filtro <code>ORDER BY</code> coluna <code>LIMIT</code> n.'}
  if(/incomplete input/.test(msg))return 'A consulta terminou no meio. Faltou fechar aspas, fechar parênteses ou completar uma condição?';
  if(/unrecognized token/.test(msg)&&!/'/.test(msg))return 'O banco não reconhece o símbolo <b>'+escH((msg.match(/unrecognized token: "?([^"]*)"?/)||[])[1]||'')+'</b>. Confira se ele não veio de outro programa ou de outro tipo de banco.';
  if(/unrecognized token/.test(msg))return 'Tem aspas abertas e não fechadas. Todo texto precisa começar e terminar com aspas simples: <code>\'prata\'</code>.';
  if((m=msg.match(/no such function: (\S+)/)))return 'Este banco não tem a função <b>'+escH(m[1])+'</b>. Confira o nome no manual do BO ("Comandos deste módulo").';
  if((m=msg.match(/ambiguous column name: (\S+)/))){var amb=m[1],tq2=tabelasDaConsulta(sql),donos=[],apel={};
    Object.keys(tq2).forEach(function(k){var tb=tq2[k];if(k!==tb)apel[tb]=k;if(donos.indexOf(tb)<0&&(schema.info&&schema.info[tb]||[]).some(function(c){return c.name===amb}))donos.push(tb)});
    return 'A coluna <b>'+escH(amb)+'</b> existe em '+(donos.length>1?'<b>'+donos.map(escH).join('</b> e <b>')+'</b>':'mais de uma tabela da consulta')+'. Diga de qual: '+(donos.length?donos.map(function(tb){return '<code>'+escH(apel[tb]||tb)+'.'+escH(amb)+'</code>'}).join(' ou '):'<code>tabela.coluna</code>')+'.'}
  if(/ambiguous column/.test(msg))return 'Essa coluna existe em mais de uma tabela da consulta. Diga de qual: <code>tabela.coluna</code>.';
  if(/misuse of aggregate/.test(msg)||/non-aggregate query/.test(msg)){var pa=diagnosticarSQL(sql,schema);if(pa.length)return juntarProblemas(pa);
    return /non-aggregate/.test(msg)?'O <code>HAVING</code> filtra grupos e precisa de um <code>GROUP BY</code> antes dele. Para filtrar linhas, use <code>WHERE</code>.':'Funções como COUNT e SUM não vão no WHERE: o WHERE olha uma linha de cada vez. Para filtrar pelo resultado da conta, use HAVING depois do GROUP BY.'}
  return 'O banco recusou a consulta. Confira a ordem das partes: <code>SELECT</code> … <code>FROM</code> … <code>WHERE</code> … <code>ORDER BY</code> … <code>LIMIT</code>.';
}

function zeroRowHint(sql,schema){
  var pr=diagnosticarSQL(sql,schema);if(pr.length)return juntarProblemas(pr);
  var lg=ligacaoEstranha(sql);
  if(lg)return 'Nenhuma linha juntou. Confira o <code>ON</code>: ele liga <code>'+escH(lg[0])+'</code> com <code>'+escH(lg[1])+'</code>, que não guardam a mesma informação. As duas colunas do ON precisam ser a mesma coisa (CPF com CPF, placa com placa). No Dicionário de Dados, a nota "aponta para" diz quem liga com quem.';
  var lits=(sql.match(/'[^']*'/g)||[]).map(function(s){return s.slice(1,-1)});
  if(/data_hora/i.test(sql)&&lits.some(function(l){return /^\d{1,2}:\d{2}(:\d{2})?$/.test(l)}))return 'A coluna <code>data_hora</code> guarda data e hora juntas. Escreva o valor completo: <code>\'2026-10-12 22:45:00\'</code>.';
  if(lits.some(function(l){return /^[A-Z]{3}-\d/.test(l)}))return 'As placas estão gravadas sem traço: <code>\'ABC1D23\'</code>.';
  var lr=sql.match(/local_radar\s*=\s*('(?:[^']|'')*')/i);
  // só culpa o texto se ele não existir mesmo no banco (antes a dica aparecia com o texto certo e mandava trocar por LIKE à toa)
  if(lr&&!(typeof valorDe==='function'&&valorDe('SELECT COUNT(*) FROM leituras_radar WHERE local_radar = '+lr[1])))return 'Com <code>=</code> o texto precisa ser idêntico, letra por letra. Para o local do radar, tente <code>LIKE \'%Castelo%\'</code>.';
  var cap=lits.filter(function(l){return /[A-ZÀ-Ú]/.test(l)&&l===l.charAt(0).toUpperCase()+l.slice(1).toLowerCase()&&!/\d/.test(l)&&l.length>2})[0];
  if(cap&&/\bcor\b/i.test(sql))return 'As cores estão gravadas em minúsculas. <code>\''+escH(cap)+'\'</code> é diferente de <code>\''+escH(cap.toLowerCase())+'\'</code>.';
  var eq=sql.match(/(\w+)\s*=\s*('[^']*')/);
  if(eq&&!/\blike\b/i.test(sql))return 'Nenhum registro tem <code>'+escH(eq[1])+'</code> exatamente igual a <code>'+escH(eq[2])+'</code>. Com <code>=</code> o valor precisa ser <b>inteiro e idêntico</b>, letra por letra. Se você só sabe um pedaço dele (o começo, por exemplo), use <code>LIKE</code> com <code>%</code>; se sabe o valor inteiro, confira a grafia.';
  var lk=sql.match(/like\s*('[^']*')/i);
  if(lk)return 'Nenhum registro bate com <code>'+escH(lk[1])+'</code>. A estrutura da consulta está certa, então confira o padrão <b>letra por letra</b> com a pista do relato: uma letra trocada de lugar já basta para não achar nada.';
  return null;
}
