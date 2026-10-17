/* ---------- Caderno do Investigador ----------
   Anotações livres (uma página "Geral" e uma por BO) e linhas fixadas a partir da grade do DB-Investigator
   (o 📌 em cada linha). Clicar num valor fixado cola no editor SQL, já com aspas se for texto: é o que
   permite carregar um CPF ou um número de conta de uma consulta para outra antes do JOIN (Módulo 4).
   Tudo fica em S.caderno, salvo com o progresso e no backup. */
var CADERNO_MAX_FIXADOS=60, CADERNO_MAX_TEXTO=20000;
function cadernoPaginaAtiva(){var i=caseActive();return i<0?'geral':CASES[i].id}
function cadernoPagina(id){var p=S.caderno.paginas;return p[id]||(p[id]={texto:'',fixados:[]})}
function cadernoNomePagina(id){if(id==='geral')return L('Geral');if(id==='treino')return L('Treino com o Beto');var i=indiceCaso(id);return i<0?id:L('BO {id} · {titulo}',{id:id,titulo:CASES[i].titulo})}
// Páginas visíveis: Geral + BOs liberados (para não revelar casos futuros).
function cadernoPaginas(){return ['geral'].concat(CASES.filter(function(c,i){return caseUnlocked(i)}).map(function(c){return c.id}),servicosLiberados()?['treino']:[])}

// Fixa uma linha do último resultado na página do BO em andamento.
function fixarLinha(res,i){
  var id=cadernoPaginaAtiva(),pg=cadernoPagina(id);
  if(pg.fixados.length>=CADERNO_MAX_FIXADOS){toast(L('Caderno cheio'),L('Esta página já tem {n} linhas fixadas. Apague algumas no Caderno.',{n:CADERNO_MAX_FIXADOS}),'warn');return}
  pg.fixados.push({hora:horaJogo(),sql:String(res.sql||'').slice(0,400),cols:res.columns.slice(0,12),row:res.values[i].slice(0,12).map(function(v){return v===null?null:typeof v==='number'?v:String(v).slice(0,200)})});
  save();tele('caderno',{acao:'fixar',pagina:id});
  toast(L('Fixado no Caderno'),L('Linha guardada na página {pagina}. Clique num valor lá para colar no editor.',{pagina:escH(cadernoNomePagina(id))}),'ok',function(){openCaderno(id)});
  if(WINS.caderno)renderCaderno();
}
// Cola um valor no editor SQL (texto com aspas simples; número como está).
function colarNoEditor(v){
  if(!WINS.db)openDb();
  var txt=v===null?'NULL':typeof v==='number'?String(v):"'"+String(v).replace(/'/g,"''")+"'";
  focusWin('db');insertAt(txt);tele('caderno',{acao:'colar'});
}
// Abre na página pedida ou, por padrão, na do BO em andamento (é onde o jogador está trabalhando).
function openCaderno(pagina){
  S.caderno.aberta=pagina||cadernoPaginaAtiva();
  openWin('caderno',{title:nomeApp('caderno'),w:640,h:480,x:180,y:40,build:function(){renderCaderno()},refresh:function(){renderCaderno()}});
}
function renderCaderno(){
  var r=WINS.caderno;if(!r)return;
  var pags=cadernoPaginas();if(pags.indexOf(S.caderno.aberta)<0)S.caderno.aberta=cadernoPaginaAtiva();
  var id=S.caderno.aberta,pg=id==='treino'?{fixados:[]}:cadernoPagina(id);
  r.body.innerHTML='';
  var wrap=h('div',{class:'caderno'}),lista=h('div',{class:'cad-pags'}),dir=h('div',{class:'cad-pagina'});
  pags.forEach(function(p){var n=(S.caderno.paginas[p]||{fixados:[]}).fixados.length;
    var b=h('button',{class:p===id?'sel':''},escH(cadernoNomePagina(p))+(n?' <span class="cad-n">'+n+'</span>':''));
    b.onclick=function(){S.caderno.aberta=p;save();renderCaderno()};lista.appendChild(b)});
  dir.appendChild(h('div',{class:'cad-titulo'},escH(cadernoNomePagina(id))));
  if(id==='treino'){paginaTreino(dir);wrap.appendChild(lista);wrap.appendChild(dir);r.body.appendChild(wrap);return}
  var ta=h('textarea',{class:'cad-texto','aria-label':L('Anotações'),placeholder:L('Anote aqui pistas, números e suspeitas. Tudo é salvo sozinho.'),maxlength:String(CADERNO_MAX_TEXTO)});
  ta.value=pg.texto;var anotou=false;
  ta.addEventListener('input',function(){pg.texto=ta.value;save();if(!anotou){anotou=true;tele('caderno',{acao:'nota',pagina:id})}});
  dir.appendChild(ta);
  dir.appendChild(h('div',{class:'cad-sec'},L('Linhas fixadas')));
  if(!pg.fixados.length)dir.appendChild(h('div',{class:'muted cad-vazio'},L('Nenhuma linha fixada. No resultado do DB-Investigator, clique no 📌 da linha para guardá-la aqui.')));
  pg.fixados.forEach(function(f,k){
    var box=h('div',{class:'cad-fix'});
    var cab=h('div',{class:'cad-fix-cab'},'<span>'+escH(f.hora)+'</span><code title="'+escH(f.sql)+'">'+escH(f.sql)+'</code>');
    var x=h('button',{class:'cad-x',title:L('Apagar esta linha'),'aria-label':L('Apagar esta linha')},'&#10005;');
    x.onclick=function(){pg.fixados.splice(k,1);save();renderCaderno()};cab.appendChild(x);box.appendChild(cab);
    var tb=h('table',{class:'minitab'});
    tb.innerHTML='<tr>'+f.cols.map(function(c){return '<th>'+escH(c)+'</th>'}).join('')+'</tr>';
    var tr=h('tr');
    f.row.forEach(function(v){var td=h('td',{class:'cad-valor',title:L('Clique para colar no editor SQL')},v===null?'<i>NULL</i>':escH(String(v)));td.onclick=function(){colarNoEditor(v)};tr.appendChild(td)});
    tb.appendChild(tr);box.appendChild(tb);dir.appendChild(box);
  });
  wrap.appendChild(lista);wrap.appendChild(dir);r.body.appendChild(wrap);
}
// Página "Treino com o Beto": situação de cada conceito liberado. Dominado = 3 acertos seguidos de primeira.
function paginaTreino(dir){
  var T=treinoLivre();
  dir.appendChild(h('div',{class:'muted cad-vazio'},L('Peça serviço ao Beto no PolíciaZap ("Tem serviço?"). Um conceito fica dominado com três acertos seguidos de primeira. Quando você domina as partes, ele começa a mandar serviços que misturam.')));
  var tb=h('table',{class:'minitab cad-treino'});
  tb.innerHTML='<tr><th>'+escH(L('Conceito'))+'</th><th>'+escH(L('Situação'))+'</th><th>'+escH(L('Acertos'))+'</th></tr>';
  Object.keys(CONCEITOS).filter(conceitoLiberado).forEach(function(c){
    var e=T.conceitos[c],sit=!e||e.visto<0?'⚪ '+L('Ainda não treinou'):e.dominado?'✅ '+L('Dominado'):'🟡 '+L('Praticando')+' ('+e.seguidos+'/'+DOMINIO_SEGUIDOS+')';
    tb.appendChild(h('tr',{},'<td>'+escH(CONCEITOS[c].nome)+'</td><td>'+sit+'</td><td>'+(e?e.acertos:0)+'</td>'));
  });
  dir.appendChild(tb);
}
