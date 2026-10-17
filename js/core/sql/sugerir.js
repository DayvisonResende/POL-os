/* Autocompletar simples do DB-Investigator (playtest de 17/10): enquanto a pessoa digita, sugere nomes de
   tabelas, colunas e palavras do SQL que começam com o que ela já escreveu. Só nomes: nunca completa a consulta
   (seria entregar a resposta). Evita o erro mais comum de iniciante: nome digitado errado. */
var PALAVRAS_SUGERIDAS=['GROUP BY','ORDER BY'].concat(KEYWORDS.filter(function(k){return ['GROUP','ORDER','BY'].indexOf(k)<0}),['IS NULL','IS NOT NULL','COALESCE']).filter(function(k,i,a){return a.indexOf(k)===i});
// antes: texto do editor até o cursor. schema: {tables:[], info:{tabela:[{name}]}}. Devolve {prefixo, opcoes} ou null.
function sugerirSQL(antes,schema){
  if(((antes.match(/'/g)||[]).length)%2)return null;           // dentro de um texto entre aspas
  var m=antes.match(/[A-Za-z_][A-Za-z0-9_]*$/);if(!m||m[0].length<2)return null;
  var p=m[0],pu=p.toUpperCase(),ts=tokSQL(antes.slice(0,antes.length-p.length)),ant=String(ts[ts.length-1]||'').toUpperCase();
  if(ant==='.'||/^\d/.test(p))return null;
  var citadas=schema.tables.filter(function(t){return new RegExp('\\b'+t+'\\b','i').test(antes)});
  var colsDe=function(l){var c=[];l.forEach(function(t){(schema.info[t]||[]).forEach(function(x){if(c.indexOf(x.name)<0)c.push(x.name)})});return c};
  var tabelas=schema.tables,colsCitadas=colsDe(citadas),outrasCols=colsDe(schema.tables).filter(function(c){return colsCitadas.indexOf(c)<0});
  var maiusculas=p===pu;
  var palavras=PALAVRAS_SUGERIDAS.map(function(k){return maiusculas?k:k.toLowerCase()});
  var ordem=(ant==='FROM'||ant==='JOIN')?[tabelas,palavras,colsCitadas,outrasCols]:[colsCitadas,palavras,tabelas,outrasCols];
  var vistas={},opcoes=[];
  ordem.forEach(function(l){l.forEach(function(o){var u=o.toUpperCase();if(u.indexOf(pu)===0&&u!==pu&&!vistas[u]){vistas[u]=1;opcoes.push(o)}})});
  return opcoes.length?{prefixo:p,opcoes:opcoes.slice(0,5)}:null;
}
