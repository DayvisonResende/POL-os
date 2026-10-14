/* Tradução de erros do SQLite e dicas para resultado vazio. */
function translateError(msg,sql,schema){
  var m,tables=schema.tables,cols=schema.cols;
  if((m=msg.match(/no such table: (\S+)/))){var s=closest(m[1].split('.').pop(),tables,3);return 'A tabela <b>'+escH(m[1])+'</b> não existe.'+(s?' Você quis dizer <code>'+s+'</code>?':'')+' Os nomes certos estão no Dicionário de Dados, à direita.'}
  if((m=msg.match(/no such column: (\S+)/))){var nm=m[1],base=nm.split('.').pop(),s2=closest(base,cols);
    if(s2)return 'Não existe coluna chamada <b>'+escH(nm)+'</b>. Você quis dizer <code>'+s2+'</code>?';
    return 'Não existe coluna chamada <b>'+escH(nm)+'</b>. Se <b>'+escH(base)+'</b> é um valor de texto, e não o nome de uma coluna, coloque entre aspas simples: <code>\''+escH(base)+'\'</code>.'}
  if((m=msg.match(/near "([^"]+)": syntax error/))){var tok=m[1],up=tok.toUpperCase();
    if(up==='FROM'&&/,\s*from\b/i.test(sql))return 'Sobrou uma vírgula antes do <code>FROM</code>. A última coluna da lista não leva vírgula.';
    if(up==='SELECT')return 'Parece que há duas consultas grudadas. Termine cada uma com <code>;</code> ou apague a que você não quer rodar.';
    var ty=kwTypo(sql,schema);if(ty)return 'O banco não conhece a palavra <b>'+escH(ty[0])+'</b>. Será que você quis dizer <code>'+ty[1]+'</code>?';
    if(up==='WHERE'&&!/\bfrom\b/i.test(sql))return 'Falta o <code>FROM</code> dizendo de qual tabela vêm os dados, antes do WHERE.';
    return 'O banco se perdeu perto de <b>'+escH(tok)+'</b>. Confira a ordem das partes: <code>SELECT</code> colunas <code>FROM</code> tabela <code>WHERE</code> filtro <code>ORDER BY</code> coluna <code>LIMIT</code> n.'}
  if(/incomplete input/.test(msg))return 'A consulta terminou no meio. Faltou fechar aspas, fechar parênteses ou completar uma condição?';
  if(/unrecognized token/.test(msg))return 'Tem aspas abertas e não fechadas. Todo texto precisa começar e terminar com aspas simples: <code>\'prata\'</code>.';
  if(/ambiguous column/.test(msg))return 'Essa coluna existe em mais de uma tabela da consulta. Diga de qual: <code>tabela.coluna</code>.';
  if(/misuse of aggregate/.test(msg))return 'Funções como COUNT e SUM não podem ir no WHERE. Isso é assunto do Módulo 3 (HAVING).';
  return 'O banco recusou a consulta. Confira a ordem das partes: <code>SELECT</code> … <code>FROM</code> … <code>WHERE</code> … <code>ORDER BY</code> … <code>LIMIT</code>.';
}

function zeroRowHint(sql){
  var lits=(sql.match(/'[^']*'/g)||[]).map(function(s){return s.slice(1,-1)});
  if(/data_hora/i.test(sql)&&lits.some(function(l){return /^\d{1,2}:\d{2}(:\d{2})?$/.test(l)}))return 'A coluna <code>data_hora</code> guarda data e hora juntas. Escreva o valor completo: <code>\'2026-10-12 22:45:00\'</code>.';
  if(lits.some(function(l){return /^[A-Z]{3}-\d/.test(l)}))return 'As placas estão gravadas sem traço: <code>\'ABC1D23\'</code>.';
  if(/local_radar\s*=/i.test(sql))return 'Com <code>=</code> o texto precisa ser idêntico, letra por letra. Para o local do radar, tente <code>LIKE \'%Castelo%\'</code>.';
  if(lits.some(function(l){return /[A-ZÀ-Ú]/.test(l)&&l===l.charAt(0).toUpperCase()+l.slice(1).toLowerCase()&&!/\d/.test(l)&&l.length>2})&&/\bcor\b/i.test(sql))return 'As cores estão gravadas em minúsculas. <code>\'Prata\'</code> é diferente de <code>\'prata\'</code>.';
  if(/like\s*'[^%']*'/i.test(sql))return 'LIKE sem <code>%</code> funciona como <code>=</code>. Para "começa com", use <code>\'FTR%\'</code>.';
  return null;
}
