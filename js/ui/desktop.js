/* ---------- desktop icons & start menu ---------- */
function renderIcons(){
  var el=$('#icons');el.innerHTML='';var unread=S.unread.celia+S.unread.beto;
  [['ocorr','SISP Ocorrências',openOcorr],['db','DB-Investigator',function(){openDb()}],['zap','PolíciaZap',openZap],['files','Arquivos',openFiles],['prova','ACADEPOL',openProva]].filter(function(a){return S.apps.indexOf(a[0])>=0}).forEach(function(a){
    var b=h('button',{class:'dicon',id:'ic-'+a[0]},'<span class="ico">'+ICONS[a[0]]+(a[0]==='zap'&&unread?'<span class="badge">'+unread+'</span>':'')+'</span><span>'+a[1]+'</span>');
    b.ondblclick=a[2];b.onkeydown=function(e){if(e.key==='Enter')a[2]()};b.onclick=function(){if(window.matchMedia('(pointer:coarse)').matches||window.innerWidth<=760)a[2]()};
    el.appendChild(b)});
}
function buildStart(){
  var m=$('#startMenu');m.innerHTML='<div class="smh">POL-OS v4.2 · recruta.dti04<br><span style="color:#e8b04a">'+escH(rankT())+'</span></div>';
  [['SISP Ocorrências',openOcorr,'ocorr'],['DB-Investigator',function(){openDb()},'db'],['PolíciaZap',openZap,'zap'],['Arquivos',openFiles,'files'],['ACADEPOL',openProva,'prova'],null,['Relatório do turno',report],teleModo()?['Diagnóstico de playtest',openDiag]:false,['Reiniciar turno (apaga progresso)',resetAll]].filter(function(it){return it!==false&&(!it||!it[2]||S.apps.indexOf(it[2])>=0)}).forEach(function(it){
    if(!it){m.appendChild(h('hr'));return}var b=h('button',null,escH(it[0]));b.onclick=function(){toggleStart(false);it[1]()};m.appendChild(b)});
}
function unlockApp(id,label){if(S.apps.indexOf(id)>=0)return;S.apps.push(id);save();renderIcons();buildStart();toast('Programa liberado',escH(label)+' agora está na sua área de trabalho.','warn')}
function toggleStart(v){var m=$('#startMenu');m.hidden=v===undefined?!m.hidden:!v;$('#startBtn').setAttribute('aria-expanded',!m.hidden)}
