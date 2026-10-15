/* Telemetria local para playtest. Fica só neste navegador, numa chave separada do progresso
   (Reiniciar turno não apaga), e nunca é enviada a lugar nenhum.
   O painel aparece no menu iniciar quando o jogo é aberto com ?teste no endereço (ex.: index.html?teste). */
var TELE_KEY='sisp-telemetria-v1', TELE_MAX=4000, TELE_OCIO=300;
var TELE=(function(){try{var t=JSON.parse(localStorage.getItem(TELE_KEY)||'null');if(t&&t.ev)return t}catch(e){}return {sessoes:0,ev:[]}})();
function teleModo(){return /[?&]teste\b/.test(location.search)}
function teleSalvar(){try{localStorage.setItem(TELE_KEY,JSON.stringify(TELE))}catch(e){}}
function teleOnde(){
  if(tutActive())return 'Treino '+String(S.tut+1).padStart(2,'0')+' · '+tutStep().type;
  var i=caseActive();return i<0?'Sem chamado aberto':'BO '+CASES[i].id;
}
function tele(tipo,dados){
  var e={t:Date.now(),s:TELE.sessoes,tipo:tipo,onde:teleOnde()};
  if(dados)for(var k in dados)if(k!=='tipo')e[k]=dados[k];   // tipo é reservado: identifica o evento
  TELE.ev.push(e);if(TELE.ev.length>TELE_MAX)TELE.ev.splice(0,TELE.ev.length-TELE_MAX);
  teleSalvar();
}
function teleSessao(retomada){TELE.sessoes++;tele('sessao',{retomada:!!retomada,largura:window.innerWidth})}
function semTags(html){return String(html).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()}

/* Resumo por lugar do jogo. O tempo entre um evento e o próximo (da mesma sessão) conta para o
   lugar do primeiro; intervalos maiores que TELE_OCIO segundos contam como ociosidade e são ignorados. */
function teleResumo(){
  var por={},ordem=[],erros={},trop={};
  function g(o){if(!por[o]){por[o]={onde:o,seg:0,consultas:0,erros:0,vazias:0,tropecos:0,dicas:0,explique:0};ordem.push(o)}return por[o]}
  TELE.ev.forEach(function(e,i){
    var x=g(e.onde),nx=TELE.ev[i+1];
    if(nx&&nx.s===e.s){var d=(nx.t-e.t)/1000;if(d<=TELE_OCIO)x.seg+=d}
    if(e.tipo==='consulta'){x.consultas++;if(e.res==='erro'||e.res==='bloqueada'){x.erros++;var m=e.res==='bloqueada'?'bloqueada como tentativa de escrita':e.erro;erros[m]=(erros[m]||0)+1}if(e.res==='vazio')x.vazias++}
    if(e.tipo==='tropeco'){x.tropecos++;var k=e.onde+' — '+e.msg;trop[k]=(trop[k]||0)+1}
    if(e.tipo==='dica')x.dicas++;
    if(e.tipo==='explique')x.explique++;
  });
  var top=function(o){return Object.keys(o).map(function(k){return [k,o[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,10)};
  return {lugares:ordem.map(function(o){return por[o]}),erros:top(erros),tropecos:top(trop)};
}

function openDiag(){openWin('diag',{title:'Diagnóstico de playtest',w:760,h:560,x:130,y:16,build:function(){renderDiag()},refresh:function(){renderDiag()}})}
function renderDiag(){
  var r=WINS.diag;if(!r)return;var R=teleResumo(),ev=TELE.ev;
  var mmss=function(s){s=Math.round(s);return Math.floor(s/60)+'min '+String(s%60).padStart(2,'0')+'s'};
  var html='<div class="diag"><p class="muted">Dados gravados só neste navegador. '+TELE.sessoes+' sessão(ões), '+ev.length+' eventos'+
    (ev.length?', de '+new Date(ev[0].t).toLocaleString('pt-BR')+' a '+new Date(ev[ev.length-1].t).toLocaleString('pt-BR'):'')+'.</p>'+
    '<div class="gact"><button class="tb-btn run" id="dgBaixar">Baixar JSON</button><button class="tb-btn" id="dgAtual">Atualizar</button><button class="tb-btn" id="dgLimpar">Limpar telemetria</button></div>';
  if(!ev.length){r.body.innerHTML=html+'<p class="empty">Nenhum evento ainda. Jogue um pouco e volte aqui.</p></div>';ligarDiag(r);return}
  html+='<h3>Onde o tempo foi gasto</h3><table class="dtab"><thead><tr><th>Lugar</th><th>Tempo</th><th>Consultas</th><th>Com erro</th><th>Vazias</th><th>Tropeços</th><th>Dicas</th><th>Explique</th></tr></thead><tbody>'+
    R.lugares.map(function(x){var alerta=x.erros+x.tropecos>=3||x.seg>=300;return '<tr'+(alerta?' class="quente"':'')+'><td>'+escH(x.onde)+'</td><td>'+mmss(x.seg)+'</td><td>'+x.consultas+'</td><td>'+x.erros+'</td><td>'+x.vazias+'</td><td>'+x.tropecos+'</td><td>'+x.dicas+'</td><td>'+x.explique+'</td></tr>'}).join('')+
    '</tbody></table><p class="muted">Em destaque: lugares com 3 ou mais erros/tropeços, ou 5 minutos ou mais.</p>';
  var lista=function(t,a){return '<h3>'+t+'</h3>'+(a.length?'<ol class="dlist">'+a.map(function(p){return '<li><b>'+p[1]+'×</b> '+escH(p[0])+'</li>'}).join('')+'</ol>':'<p class="muted">Nenhum.</p>')};
  html+=lista('Erros de SQL mais comuns',R.erros)+lista('Broncas da Célia mais repetidas',R.tropecos)+'</div>';
  r.body.innerHTML=html;ligarDiag(r);
}
function ligarDiag(r){
  $('#dgAtual',r.body).onclick=renderDiag;
  $('#dgLimpar',r.body).onclick=function(){TELE={sessoes:0,ev:[]};teleSalvar();renderDiag()};
  $('#dgBaixar',r.body).onclick=function(){
    var a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify({exportado:new Date().toISOString(),resumo:teleResumo(),eventos:TELE.ev},null,1)],{type:'application/json'})),download:'sisp-telemetria-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json'});
    document.body.appendChild(a);a.click();a.remove()};
}
