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
function normPlaca(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function normTxt(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function esc(k,arr){return arr[Math.min(k,arr.length-1)]}
function rcols(R){return R.cols.slice().sort().join(',')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
