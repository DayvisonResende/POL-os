/* Utilitários puros (sem DOM). Carregados no navegador e nos testes do Node. */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function sq(s){return "'"+String(s).replace(/'/g,"''")+"'"}
function escH(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toR(res){
  if(!res)return {cols:[],rows:[],n:0};
  return {cols:res.columns.map(function(c){return String(c).toLowerCase()}),rows:res.values,n:res.values.length};
}
function cellSet(R){var s=new Set();R.rows.forEach(function(r){r.forEach(function(v){s.add(String(v).toLowerCase())})});return s}
function has(R){var s=cellSet(R);for(var i=1;i<arguments.length;i++){if(!s.has(String(arguments[i]).toLowerCase()))return false}return true}
function hasAll(R,list){var s=cellSet(R);return list.every(function(v){return s.has(String(v).toLowerCase())})}
// O resultado tem exatamente estas linhas? Compara, coluna a coluna, só as colunas que o jogador mostrou.
function mesmasLinhas(R,linhas){
  if(!R.cols.length||R.n!==linhas.length||!linhas.length)return false;
  return R.cols.every(function(c,i){if(!(c in linhas[0]))return false;
    var a=R.rows.map(function(r){return String(r[i])}).sort(),b=linhas.map(function(l){return String(l[c])}).sort();return a.join('\u0001')===b.join('\u0001')});
}
function falta(R,col){return R.cols.indexOf(col)<0}
// Algum número do resultado vale x (com tolerância para centavos e médias)?
function temNumero(R,x,tol){if(x==null)return false;tol=tol==null?0.005:tol;return R.rows.some(function(r){return r.some(function(v){return typeof v==='number'&&Math.abs(v-x)<=tol})})}
// O resultado de um GROUP BY bate com o esperado? Procura, com qualquer nome de coluna, uma coluna com as
// chaves dos grupos e outra com os valores (contagem, soma, média…). linhas: [{chave:…, valor:…}] via linhasDe().
function bateGrupos(R,linhas,chave,valor,tol){
  if(!linhas.length||R.n!==linhas.length)return false;tol=tol==null?0.005:tol;
  var mapa={};linhas.forEach(function(l){mapa[String(l[chave]).toLowerCase()]=l[valor]});
  for(var i=0;i<R.cols.length;i++){
    if(!R.rows.every(function(r){return Object.prototype.hasOwnProperty.call(mapa,String(r[i]).toLowerCase())}))continue;
    for(var j=0;j<R.cols.length;j++)if(j!==i&&R.rows.every(function(r){var e=mapa[String(r[i]).toLowerCase()];return typeof r[j]==='number'&&Math.abs(r[j]-e)<=tol}))return true;
  }
  return false;
}
// Lê um valor digitado pelo jogador: "R$ 136.166,83", "136166.83", "136 166,83"…
function lerNumero(txt){var s=String(txt||'').replace(/[^\d,.\-]/g,'');if(s.indexOf(',')>=0){s=s.replace(/\./g,'').replace(',','.')}return s===''?NaN:parseFloat(s)}
// A coluna está em ordem (decrescente se desc)?
function ordenado(R,col,desc){var i=R.cols.indexOf(col);if(i<0)return false;for(var k=1;k<R.rows.length;k++){var a=R.rows[k-1][i],b=R.rows[k][i];if(desc?b>a:b<a)return false}return true}
function normPlaca(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function normTxt(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function esc(k,arr){return arr[Math.min(k,arr.length-1)]}
function rcols(R){return R.cols.slice().sort().join(',')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
