/* ---------- PolíciaZap (chat) ---------- */
var chatSel='celia';
/* Lidas e não lidas (playtest da Mayumi: com a janela aberta, mensagem nova chegava sem sinal, e com várias
   não dava para saber onde tinha parado de ler).
   - S.lidas[contato]: quantas mensagens da conversa já foram vistas.
   - A mensagem só conta como vista se o PolíciaZap estiver em primeiro plano e na conversa dela.
   - divisoria[contato]: onde fica a linha "N mensagens novas"; some ao trocar de conversa, responder ou fechar. */
var divisoria={};
function horaJogo(){return String(Math.floor(S.clock/60)).padStart(2,'0')+':'+String(S.clock%60).padStart(2,'0')}
function zapEmPrimeiroPlano(who){var w=WINS.zap;return !!w&&!w.el.classList.contains('min')&&w.el.classList.contains('active')&&chatSel===who}
function say(who,text,me){
  S.chat[who].push({me:!!me,sys:me==='sys',text:text,hora:horaJogo()});
  if(me)delete divisoria[who];   // respondeu: leu tudo
  else if(!me)falar(who,text);
  if(!me&&!zapEmPrimeiroPlano(who)){S.unread[who]++;tocarAviso();toast(PEOPLE[who].nome,escH(text.replace(/<[^>]+>/g,'')).slice(0,140),'',function(){chatSel=who;openZap()})}
  save();if(WINS.zap)renderZap();renderIcons();
}
function openZap(){openWin('zap',{title:nomeApp('zap'),w:560,h:440,x:null,onClose:function(){divisoria={}},build:function(r){renderZap()},refresh:function(){renderZap()}});}
function renderZap(){
  var r=WINS.zap;if(!r)return;
  var conv=S.chat[chatSel],lidasAntes=Math.min(S.lidas[chatSel]||0,conv.length);
  var antigo=r.body.querySelector('.msgs'),estavaNoFim=!antigo||antigo.scrollHeight-antigo.scrollTop-antigo.clientHeight<30,rolagem=antigo?antigo.scrollTop:0;
  // só marca como lido o que está de fato na frente do jogador
  if(zapEmPrimeiroPlano(chatSel)){
    if(divisoria[chatSel]==null&&lidasAntes<conv.length&&conv.slice(lidasAntes).some(function(m){return !m.me&&!m.sys}))divisoria[chatSel]=lidasAntes;
    S.lidas[chatSel]=conv.length;S.unread[chatSel]=0;save();renderIcons();
  }
  var b=r.body;b.innerHTML='';
  var wrap=h('div',{class:'zap'}),cl=h('div',{class:'contacts'}),th=h('div',{class:'thread'});
  Object.keys(PEOPLE).forEach(function(k){
    if(!PEOPLE[k].sempre&&!S.chat[k].length)return;
    var p=PEOPLE[k],c=h('button',{class:'contact'+(k===chatSel?' sel':'')},'<span class="av '+p.cls+'">'+p.av+'</span><span><span class="cn">'+escH(p.nome)+'</span><br><span class="cr">'+escH(p.cargo)+'</span></span>'+(S.unread[k]?'<span class="badge">'+S.unread[k]+'</span>':''));
    c.onclick=function(){if(k!==chatSel)delete divisoria[chatSel];chatSel=k;renderZap()};cl.appendChild(c)});
  var ms=h('div',{class:'msgs'}),div=divisoria[chatSel],linha=null;
  var novas=div==null?0:conv.slice(div).filter(function(m){return !m.me&&!m.sys}).length;
  conv.forEach(function(m,i){
    if(i===div&&novas){linha=h('div',{class:'novas',role:'status'},Lp(novas,'1 mensagem nova','{n} mensagens novas'));ms.appendChild(linha)}
    var nova=div!=null&&i>=div&&!m.me&&!m.sys,chegou=nova&&i>=lidasAntes;
    var el=h('div',{class:'msg'+(m.sys?' sys':m.me?' me':'')+(nova?' nova':'')+(chegou?' chegou':'')},(m.me||m.sys?'':'<span class="who">'+escH(PEOPLE[chatSel].nome.split(' ')[0])+'</span>')+m.text+(m.hora?'<span class="hora">'+m.hora+'</span>':''));
    if(!m.me&&!m.sys){var ou=botaoOuvir(chatSel,m.text);if(ou)el.appendChild(ou)}
    ms.appendChild(el)});
  th.appendChild(ms);
  var pular=h('button',{class:'pular',hidden:''},'&#8595; '+L('Nova mensagem'));
  pular.onclick=function(){ms.scrollTop=ms.scrollHeight;pular.hidden=true};
  ms.addEventListener('scroll',function(){if(ms.scrollHeight-ms.scrollTop-ms.clientHeight<30)pular.hidden=true});
  th.appendChild(pular);th.appendChild(replyBox());
  wrap.appendChild(cl);wrap.appendChild(th);b.appendChild(wrap);
  var mesma=!!antigo&&antigo.dataset.quem===chatSel,chegouAlgo=mesma&&conv.length>+antigo.dataset.n;
  ms.dataset.quem=chatSel;ms.dataset.n=conv.length;
  setTimeout(function(){
    if(!mesma)ms.scrollTop=linha?Math.max(0,linha.offsetTop-8):ms.scrollHeight;   // abriu a conversa: vai à primeira não lida
    else if(estavaNoFim)ms.scrollTop=ms.scrollHeight;                             // acompanhando a conversa: segue o fim
    else{ms.scrollTop=rolagem;if(chegouAlgo)pular.hidden=false}                   // lendo coisa antiga: não pula, avisa
  },0);
}
function replyBox(){
  var box=h('div',{class:'reply'});
  var ped=pedidoAberto(chatSel);
  if(ped){
    var pin=h('input',{placeholder:ped.placeholder||L('sua resposta'),'aria-label':L('Resposta ao pedido')}),pbt=h('button',{class:'tb-btn run'},L('Enviar'));
    var ir=function(){var v=pin.value.trim();if(!v)return;say(chatSel,escH(v),true);responderPedido(ped,v)};
    pbt.onclick=ir;pin.addEventListener('keydown',function(e){if(e.key==='Enter')ir()});
    box.appendChild(pin);box.appendChild(pbt);return box;
  }
  if(chatSel==='beto'&&(S.beto==='asked'||S.beto==='wrong')){
    var inp=h('input',{id:'betoAns',placeholder:L('horário de saída, ex.: 17:55:03'),'aria-label':L('Horário de saída do Beto')});
    var send=h('button',{class:'tb-btn run'},L('Enviar'));
    var go=function(){var v=inp.value.trim();if(!v)return;say('beto',escH(v),true);answerBeto(v)};
    send.onclick=go;inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
    box.appendChild(inp);box.appendChild(send);
  }else if(chatSel==='beto'&&S.beto==='favor'){
    [[L('Não dá, Beto. Pede pro RH corrigir.'),'no'],[L('Deixa comigo, ninguém vai ver.'),'yes']].forEach(function(o){
      var b=h('button',{class:'opt'},escH(o[0]));b.onclick=function(){say('beto',escH(o[0]),true);favorBeto(o[1])};box.appendChild(b)});
  }else if(!(chatSel==='beto'&&caixaServico(box))&&!(chatSel==='marina'&&caixaMarina(box)))box.appendChild(h('span',{class:'muted'},L('Nenhuma resposta pendente.')));
  return box;
}

/* Marina se apresenta na primeira vez que o jogador abre a escuta (ou ao fechar o BO 1003).
   A fala tem duplo sentido de propósito: "pedaços que nem dava pra entender" justifica o trecho que ela cortou (Ato V). */
function marinaApresenta(){
  if(S.marinaApresentou||S.chat.marina.length)return;S.marinaApresentou=true;save();
  setTimeout(function(){say('marina',L('Oi, recruta! Marina, da perícia. Fui eu que transcrevi essa escuta da Castelo. Áudio horrível, viu? Tinha uns pedaços que nem dava pra entender. Qualquer coisa, me chama.'))},2500);
}
