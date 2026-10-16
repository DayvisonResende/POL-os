/* ---------- desktop icons & start menu ---------- */
function renderIcons(){
  var el=$('#icons');el.innerHTML='';var unread=S.unread.celia+S.unread.beto;
  [['ocorr','SISP Ocorrências',openOcorr],['db','DB-Investigator',function(){openDb()}],['zap','PolíciaZap',openZap],['files','Arquivos',openFiles],['prova','ACADEPOL',openProva]].filter(function(a){return S.apps.indexOf(a[0])>=0}).forEach(function(a){
    var b=h('button',{class:'dicon',id:'ic-'+a[0]},'<span class="ico">'+ICONS[a[0]]+(a[0]==='zap'&&unread?'<span class="badge">'+unread+'</span>':'')+'</span><span>'+a[1]+'</span>');
    b.ondblclick=a[2];b.onkeydown=function(e){if(e.key==='Enter')a[2]()};b.onclick=function(){if(window.matchMedia('(pointer:coarse)').matches||window.innerWidth<=760)a[2]()};
    el.appendChild(b)});
}
/* Menu iniciar, no estilo dos sistemas de desktop: faixa lateral, usuário, programas,
   e Configurações com submenu (salvar, carregar e reiniciar). No celular o submenu abre embaixo. */
function buildStart(){
  var m=$('#startMenu');m.innerHTML='';
  var main=h('div',{class:'sm-main'});
  m.appendChild(h('div',{class:'sm-side','aria-hidden':'true'},'POL-OS'));m.appendChild(main);
  main.appendChild(h('div',{class:'sm-user'},'<span class="av">RD</span><div><b>recruta.dti04</b><small>'+escH(rankT())+'</small></div>'));
  var item=function(pai,rotulo,icone,acao,cls){var b=h('button',{class:'sm-it'+(cls?' '+cls:''),role:'menuitem'},'<span class="sm-ico">'+icone+'</span><span>'+escH(rotulo)+'</span>');b.onclick=function(){toggleStart(false);acao()};pai.appendChild(b);return b};
  main.appendChild(h('div',{class:'sm-sec'},'Programas'));
  [['SISP Ocorrências',openOcorr,'ocorr'],['DB-Investigator',function(){openDb()},'db'],['PolíciaZap',openZap,'zap'],['Arquivos',openFiles,'files'],['ACADEPOL',openProva,'prova']]
    .filter(function(a){return S.apps.indexOf(a[2])>=0}).forEach(function(a){item(main,a[0],ICONS[a[2]],a[1],'app')});
  main.appendChild(h('hr'));
  item(main,'Relatório do turno',MENU_ICONS.relatorio,report);
  if(teleModo())item(main,'Diagnóstico de playtest',MENU_ICONS.diag,openDiag);
  // Configurações ▸
  var grupo=h('div',{class:'sm-grupo'}),abre=h('button',{class:'sm-it sm-abre','aria-haspopup':'true','aria-expanded':'false'},'<span class="sm-ico">'+MENU_ICONS.config+'</span><span>Configurações</span><span class="sm-seta" aria-hidden="true">&#9656;</span>');
  var fly=h('div',{class:'sm-fly',role:'menu','aria-label':'Configurações',hidden:''});
  fly.appendChild(h('div',{class:'sm-sec'},'Progresso'));
  item(fly,'Salvar progresso em arquivo',MENU_ICONS.salvar,exportarProgresso);
  item(fly,'Carregar progresso de arquivo',MENU_ICONS.carregar,importarProgresso);
  fly.appendChild(h('hr'));
  item(fly,'Reiniciar turno (apaga progresso)',MENU_ICONS.reiniciar,pedirReinicio,'perigo');
  var mostrar=function(v){fly.hidden=!v;abre.setAttribute('aria-expanded',v)};
  var comMouse=window.matchMedia('(hover:hover) and (min-width:761px)').matches;
  abre.onclick=function(e){e.stopPropagation();mostrar(comMouse?true:fly.hidden)};   // com mouse o hover já abre; o clique não pode fechar
  if(comMouse){
    grupo.addEventListener('mouseenter',function(){mostrar(true)});grupo.addEventListener('mouseleave',function(){mostrar(false)});
  }
  abre.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){mostrar(true);fly.querySelector('button').focus()}});
  fly.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='Escape'){e.stopPropagation();mostrar(false);abre.focus()}});
  grupo.appendChild(abre);grupo.appendChild(fly);main.appendChild(grupo);
  main.appendChild(h('div',{class:'sm-rod'},'POL-OS v4.2 · Estação DTI-04'));
}
function unlockApp(id,label){if(S.apps.indexOf(id)>=0)return;S.apps.push(id);save();renderIcons();buildStart();toast('Programa liberado',escH(label)+' agora está na sua área de trabalho.','warn')}
function toggleStart(v){var m=$('#startMenu');m.hidden=v===undefined?!m.hidden:!v;$('#startBtn').setAttribute('aria-expanded',!m.hidden);
  var f=m.querySelector('.sm-fly');if(f&&m.hidden){f.hidden=true;m.querySelector('.sm-abre').setAttribute('aria-expanded','false')}}
