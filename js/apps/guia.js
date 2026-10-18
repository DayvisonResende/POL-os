/* ---------- Guia SQL ----------
   Referência rápida dos comandos já ensinados (verbetes em js/conteudo/guia.js). Busca, exemplos para copiar ou
   testar no editor, erros comuns e a diferença para outros bancos. Aparece depois do primeiro treinamento. */
var guiaSel=null,guiaBusca='';
function guiaLiberados(){return verbetesLiberados(treinoFeito)}
function guiaLiberado(){return guiaLiberados().length>0}
function openGuia(id){
  if(id){guiaSel=id;guiaBusca=''}
  openWin('guia',{title:nomeApp('guia'),w:720,h:500,x:200,y:30,build:function(){renderGuia()},refresh:function(){renderGuia()}});
  tele('guia',{acao:'abrir',verbete:guiaSel||''});
}
function renderGuia(){
  var r=WINS.guia;if(!r)return;
  var todos=guiaLiberados(),lista=buscarVerbetes(todos,guiaBusca);
  if(!guiaSel||!todos.some(function(v){return v.id===guiaSel}))guiaSel=todos.length?todos[0].id:null;
  var v=verbete(guiaSel);
  r.body.innerHTML='';
  var wrap=h('div',{class:'guia'}),esq=h('div',{class:'guia-lista'}),dir=h('div',{class:'guia-verbete'});
  var busca=h('input',{type:'search',class:'guia-busca',placeholder:L('Buscar: média, vazio, ordenar…'),'aria-label':L('Buscar no Guia SQL')});
  busca.value=guiaBusca;
  busca.addEventListener('input',function(){guiaBusca=busca.value;var l=buscarVerbetes(todos,guiaBusca);if(l.length&&!l.some(function(x){return x.id===guiaSel}))guiaSel=l[0].id;renderGuia();var b=$('.guia-busca');if(b){b.focus();b.setSelectionRange(b.value.length,b.value.length)}});
  esq.appendChild(busca);
  if(!lista.length)esq.appendChild(h('div',{class:'muted guia-vazio'},L('Nada encontrado. O Guia só tem os comandos que você já aprendeu.')));
  lista.forEach(function(x){var b=h('button',{class:x.id===guiaSel?'sel':''},escH(x.titulo));b.onclick=function(){guiaSel=x.id;renderGuia();tele('guia',{acao:'ver',verbete:x.id})};esq.appendChild(b)});
  if(v){
    dir.innerHTML='<div class="guia-titulo">'+escH(v.titulo)+'</div><p class="guia-resumo">'+v.resumo+'</p>'+
      '<div class="guia-sec">'+L('Formato')+'</div><pre class="guia-formato">'+escH(v.formato)+'</pre>'+
      '<div class="guia-sec">'+L('Exemplos')+'</div>';
    v.exemplos.forEach(function(e){
      var ex=h('div',{class:'guia-ex'},'<pre>'+escH(e.sql)+'</pre><p>'+e.explica+'</p>');
      var acoes=h('div',{class:'guia-acoes'});
      if(!tutActive()){var t=h('button',{class:'tb-btn run'},'&#9654; '+L('Testar no editor'));t.onclick=function(){openDb(e.sql);tele('guia',{acao:'testar',verbete:v.id})};acoes.appendChild(t)}
      var c=h('button',{class:'tb-btn'},L('Copiar'));c.onclick=function(){copiarTexto(e.sql,function(ok){c.textContent=ok?'✓ '+L('Copiado'):L('Não deu para copiar');setTimeout(function(){c.textContent=L('Copiar')},1200)});tele('guia',{acao:'copiar',verbete:v.id})};
      acoes.appendChild(c);ex.appendChild(acoes);dir.appendChild(ex);
    });
    dir.appendChild(h('div',{class:'guia-sec'},L('Erros comuns')));
    dir.appendChild(h('ul',{class:'guia-erros'},v.erros.map(function(x){return '<li>'+x+'</li>'}).join('')));
    if(v.mercado)dir.appendChild(h('div',{class:'guia-mercado'},'<b>'+L('No trabalho')+'</b> '+v.mercado));
    var ver=(v.ver||[]).filter(function(id){return todos.some(function(x){return x.id===id})});
    if(ver.length){var vt=h('div',{class:'guia-ver'},'<span>'+L('Veja também:')+'</span>');
      ver.forEach(function(id){var b=h('button',{},escH(verbete(id).titulo));b.onclick=function(){guiaSel=id;guiaBusca='';renderGuia()};vt.appendChild(b)});dir.appendChild(vt)}
  }
  wrap.appendChild(esq);wrap.appendChild(dir);r.body.appendChild(wrap);
}

/* Atalhos para o Guia: nas mensagens de erro e de dica ("Ver no Guia: HAVING") e no Explique ("No Guia: …").
   Só aponta para verbetes já liberados. */
var GUIA_PISTAS=[[/veio antes do|ordem das partes/i,'ordem'],[/HAVING/,'having'],[/GROUP BY/,'groupby'],[/COALESCE/,'coalesce'],[/COUNT\(coluna\)|COUNT\(descricao\)/,'countcoluna'],
  [/IS NULL|NULL/,'null'],[/BETWEEN/,'between'],[/I?LIKE/,'like'],[/aspas/i,'aspas'],[/ORDER BY/,'orderby'],[/\bIN\b/,'in'],[/LIMIT|TOP/,'limit'],
  [/COUNT|SUM|AVG|MIN|MAX/,'count'],[/data_hora|AAAA-MM-DD/,'datahora'],[/\bAND\b|\bOR\b/,'and'],[/WHERE/,'where'],[/DISTINCT/,'distinct'],[/FROM|SELECT/,'select']];
function verbeteDoTexto(txt){var lib=guiaLiberados().map(function(v){return v.id});
  for(var i=0;i<GUIA_PISTAS.length;i++)if(GUIA_PISTAS[i][0].test(txt)&&lib.indexOf(GUIA_PISTAS[i][1])>=0)return GUIA_PISTAS[i][1];return null}
function botaoGuia(id,rotulo){var b=h('button',{class:'ver-guia',type:'button'},'&#128214; '+escH(rotulo||L('Ver no Guia'))+': <b>'+escH(verbete(id).titulo)+'</b>');b.onclick=function(){tele('guia',{acao:'atalho',verbete:id});openGuia(id);renderGuia()};return b}
function guiaNasMensagens(caixa){
  if(!caixa||!guiaLiberado())return;
  caixa.querySelectorAll('.err,.hint0').forEach(function(d){var id=verbeteDoTexto(d.textContent.replace(/SQLite:.*$/,''));if(id)d.appendChild(botaoGuia(id))});
}
var GUIA_TOKENS={SELECT:'select',DISTINCT:'distinct',AS:'as',LIMIT:'limit',WHERE:'where',LIKE:'like',AND:'and',OR:'and',BETWEEN:'between',IN:'in',ORDER:'orderby',
  COUNT:'count',SUM:'sumavg',AVG:'sumavg',MIN:'minmax',MAX:'minmax',GROUP:'groupby',HAVING:'having',NULL:'null',COALESCE:'coalesce','>':'comparacao','<':'comparacao','>=':'comparacao','<=':'comparacao','!=':'comparacao','<>':'comparacao'};
function guiaDaConsulta(sql){var lib=guiaLiberados().map(function(v){return v.id}),ids=[];
  tokSQL(sql).forEach(function(t){var id=GUIA_TOKENS[t.toUpperCase()];if(id&&lib.indexOf(id)>=0&&ids.indexOf(id)<0)ids.push(id)});return ids}
