/* Serviços do Beto: o jogador pede ("Tem serviço?"), o Beto "organiza" por 20 a 60 s e manda um serviço.
   Sem limite para treinar; só os SERV_METAS_TURNO primeiros de cada turno (um BO fechado ou um dia novo) dão Metas.
   Lógica e sorteio: js/core/servicos.js · conteúdo: js/conteudo/servicos.js · estado: S.servicos. */
var SERV_ESPERA=[20,60], SERV_METAS_TURNO=3, SERV_METAS=5;
function treinoLivre(){return S.servicos||(S.servicos=novoTreinoLivre())}
function conceitoLiberado(c){return !!CONCEITOS[c]&&treinoFeito(CONCEITOS[c].treino)}
function servicoDisponivel(s){
  if((s.tabelas||[]).some(function(t){var d=TABELAS.filter(function(x){return x.nome===t})[0];return d&&!tabelaLiberada(d)}))return false;
  return !s.variar||s.variar().length>0;
}
// O Beto só oferece serviço depois que o dilema do ponto terminou (antes disso, a conversa é outra).
function servicosLiberados(){return S.beto==='done'&&SERVICOS.some(function(s){return s.conceitos.every(conceitoLiberado)&&servicoDisponivel(s)})}
function turnoAtual(){return S.dia+'-'+S.closed.length}
function servicoDe(id){return SERVICOS.filter(function(s){return s.id===id})[0]}
function sorteio(l){return l[Math.floor(Math.random()*l.length)]}

function pedirServico(){
  var T=treinoLivre();if(T.aberto)return;
  if(T.turno!==turnoAtual()){T.turno=turnoAtual();T.noTurno=0}
  var s=sortearServico(T,conceitoLiberado,servicoDisponivel);if(!s)return;
  var p=variarServico(s,null,T.ultimo===s.id?T.ultimaVariacao:null);
  var espera=Math.round((SERV_ESPERA[0]+Math.random()*(SERV_ESPERA[1]-SERV_ESPERA[0]))*1000);
  T.aberto={id:s.id,p:p,tentativas:0,chegaEm:Date.now()+espera,entregue:false};
  say('beto',L('Tem serviço?'),true);
  tele('servico',{id:s.id,acao:'pedido',conceitos:s.conceitos.join(','),noTurno:T.noTurno});
  setTimeout(function(){say('beto',T.noTurno>=SERV_METAS_TURNO?sorteio([L('Tá com fome, hein? Beleza, já te mando mais um.'),L('De novo? Gostei de ver. Me dá um minuto que eu separo.')])
    :sorteio([L('Fala, recruta! Claro, tô com umas coisas aqui. Me dá um minuto que já te mando.'),L('Opa, sempre tem. Deixa eu ver aqui o que tá parado na minha mesa…'),L('Tem, e muito. Só um minutinho que eu organizo e te mando.')]))},900);
  agendarServico();
}
// Entrega o serviço quando a espera acaba (também depois de recarregar a página no meio da espera).
var servTimer=null;
function agendarServico(){
  var T=treinoLivre(),a=T.aberto;if(!a||a.entregue)return;
  clearTimeout(servTimer);servTimer=setTimeout(entregarServico,Math.max(1500,a.chegaEm-Date.now()));
}
function entregarServico(){
  var T=treinoLivre(),a=T.aberto;if(!a||a.entregue)return;
  var s=servicoDe(a.id);if(!s){T.aberto=null;save();return}
  a.entregue=true;save();say('beto',s.texto(a.p));
}
function responderServico(v){
  var T=treinoLivre(),a=T.aberto,s=a&&servicoDe(a.id);if(!s||!a.entregue)return;
  var ok=conferirServico(s,a.p,v);a.tentativas++;
  tele('servico',{id:s.id,acao:'resposta',ok:ok,tentativa:a.tentativas});
  if(!ok){save();setTimeout(function(){say('beto',a.tentativas===1?L('Hmm, não bate com o que o pessoal falou. {dica}',{dica:s.dica}):L('Ainda não. {dica} Se enroscar, pode deixar pra lá que eu me viro.',{dica:s.dica}))},900);return}
  concluirServico(s,a.tentativas===1);
  var metas=T.noTurno<SERV_METAS_TURNO;T.noTurno++;if(metas)addMetas(SERV_METAS);
  setTimeout(function(){say('beto',sorteio([L('Isso! Valeu, recruta. Te devo uma.'),L('Perfeito. Ganhei a aposta do café!'),L('Era isso mesmo. Tu é bom nisso, hein?'),L('Fechou. Anotado aqui.')]))},900);
}
function desistirServico(){
  var T=treinoLivre(),a=T.aberto,s=a&&servicoDe(a.id);if(!s)return;
  say('beto',L('Não consegui, Beto. Deixa pra lá.'),true);
  tele('servico',{id:s.id,acao:'desistiu',tentativa:a.tentativas});
  var consulta=(s.mostrar||s.sql)(a.p),resp=respostaServico(s,a.p);
  concluirServico(s,false);
  setTimeout(function(){say('beto',L('Relaxa, eu dei um jeito. Fiz assim: <code>{sql}</code> e deu <b>{resp}</b>. Pede outro depois, que esse tipo volta.',{sql:escH(consulta),resp:escH(typeof resp==='number'?String(Math.round(resp*100)/100).replace('.',','):String(resp))}))},900);
}
function concluirServico(s,dePrimeira){
  var T=treinoLivre();T.ultimaVariacao=T.aberto.p;T.aberto=null;
  var novos=registrarResultado(T,s,dePrimeira);save();
  novos.forEach(function(c){tele('servico',{id:s.id,acao:'dominou',conceito:c});
    toast(L('Conceito dominado'),L('{nome}: três acertos seguidos de primeira. Veja no Caderno, página Treino.',{nome:escH(CONCEITOS[c].nome)}),'ok',function(){openCaderno('treino')})});
  if(WINS.caderno)renderCaderno();
}
// Caixa de resposta na conversa com o Beto (chamada por replyBox quando não há dilema pendente).
function caixaServico(box){
  var T=treinoLivre(),a=T.aberto;
  if(a&&a.entregue){
    var inp=h('input',{placeholder:L('sua resposta'),'aria-label':L('Resposta ao serviço do Beto')}),env=h('button',{class:'tb-btn run'},L('Enviar'));
    var ir=function(){var v=inp.value.trim();if(!v)return;say('beto',escH(v),true);responderServico(v)};
    env.onclick=ir;inp.addEventListener('keydown',function(e){if(e.key==='Enter')ir()});
    var des=h('button',{class:'opt'},L('Deixa pra lá'));des.onclick=desistirServico;
    box.appendChild(inp);box.appendChild(env);box.appendChild(des);return true;
  }
  if(a){box.appendChild(h('span',{class:'muted'},L('O Beto está separando o serviço…')));return true}
  if(servicosLiberados()){var b=h('button',{class:'opt servico-pedir'},L('Tem serviço?'));b.onclick=pedirServico;box.appendChild(b);return true}
  return false;
}
// O Beto conta que tem serviço, uma vez só, assim que houver o que treinar.
function apresentarServicos(){
  var T=treinoLivre();if(T.apresentado||!servicosLiberados())return;
  T.apresentado=true;save();
  say('beto',L('Ó, recruta, uma coisa: quando quiser dar uma ajuda pro pai aqui, me pede serviço. Minha mesa vive cheia, e quem pratica não esquece. Fechou?'));
}
