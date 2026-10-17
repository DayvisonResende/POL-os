/* Botão "Organizar" do DB-Investigator: arruma a consulta em linhas, uma parte por linha, e põe as palavras do SQL
   em maiúsculas. Ensina indentação mostrando (playtest de 17/10), sem virar mais uma regra para decorar.
   Devolve null quando não dá para organizar sem perder nada (comentários). */
var QUEBRA_ANTES=['FROM','WHERE','HAVING','LIMIT','UNION','JOIN','LEFT','INNER','ON'];
function formatarSQL(sql){
  if(/--|\/\*/.test(sql))return null;
  var ts=tokSQL(sql);if(!ts.length)return null;
  var cmds=[],atual=[],d=0;
  ts.forEach(function(t){if(t==='(')d++;else if(t===')')d--;if(t===';'&&d===0){if(atual.length)cmds.push(atual);atual=[]}else atual.push(t)});
  if(atual.length)cmds.push(atual);
  var maius=function(t){return /^[A-Za-z_]+$/.test(t)&&KEYWORDS.indexOf(t.toUpperCase())>=0?t.toUpperCase():t};
  var juntar=function(l){return joinToks(l.map(maius)).replace(/\b(IN|EXISTS|AND|OR|NOT|ON)\(/g,'$1 (')};
  return cmds.map(function(c){
    var linhas=[],cur=[],d=0,entreAnd=false,clausula='SELECT';
    var fecha=function(recuo){if(cur.length)linhas.push(cur);cur=[];cur.recuo=recuo};
    c.forEach(function(t,i){var u=t.toUpperCase();
      if(t===')')d--;
      if(d===0&&cur.length){
        var prox=String(c[i+1]||'').toUpperCase();
        if(QUEBRA_ANTES.indexOf(u)>=0&&!(u==='JOIN'&&/^(LEFT|INNER)$/.test(String(c[i-1]).toUpperCase()))){fecha(u==='ON'?'  ':'');clausula=u}
        else if((u==='GROUP'||u==='ORDER')&&prox==='BY'){fecha('');clausula=u}
        else if((u==='AND'||u==='OR')&&(clausula==='WHERE'||clausula==='HAVING'||clausula==='ON')&&!entreAnd)fecha('  ');
      }
      if(u==='BETWEEN')entreAnd=true;else if(u==='AND'&&entreAnd)entreAnd=false;
      if(t==='(')d++;
      cur.push(t);
    });
    fecha('');
    return linhas.map(function(l){return (l.recuo||'')+juntar(l)}).join('\n')+';';
  }).join('\n\n');
}
