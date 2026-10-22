/* Cláudio, do TI: o canal de problemas e sugestões (contato "claudio" do PolíciaZap e SISP › Falar com o TI).
   O jogador escolhe Problema ou Sugestão (vai em contexto.tipo: a tabela não muda) e descreve; o jogo junta o contexto técnico (onde estava, última consulta, último erro,
   aparelho), mostra tudo e só envia depois do "Enviar". Vai para a tabela "relatos" do Supabase
   (supabase/relatos.sql), que só aceita inserção. Não depende do consentimento da telemetria: cada envio é
   uma ação do jogador, com aviso na hora (termo, seção 11). Sem internet: fica na fila e vai depois. */
var RELATOS_FILA_KEY='sisp-relatos-fila',RELATOS_DIA_KEY='sisp-relatos-dia',RELATOS_LIMITE_DIA=5,RELATO_MIN=10,RELATO_MAX=1000;
var rascunhoRelato='',tipoRelato='bug',enviandoRelatos=false,avisouErroJs=false;
var filaRelatos=(function(){try{var f=JSON.parse(localStorage.getItem(RELATOS_FILA_KEY)||'[]');return Array.isArray(f)?f:[]}catch(e){return []}})();
function salvarFilaRelatos(){try{localStorage.setItem(RELATOS_FILA_KEY,JSON.stringify(filaRelatos))}catch(e){}}

// O que vai junto com o texto: só coisas do jogo e do aparelho em categorias amplas (nada de login ou senha).
function contextoRelato(){
  // último erro técnico: só o desta sessão (um erro de dias atrás, já corrigido, só confunde)
  var ev=TELE.ev,ultima=null,erroJs=null;
  for(var i=ev.length-1;i>=0&&(!ultima||!erroJs);i--){
    if(!ultima&&ev[i].tipo==='consulta')ultima={sql:String(ev[i].sql||'').slice(0,400),resultado:ev[i].res,erro:ev[i].erro?String(ev[i].erro).slice(0,200):null,onde:ev[i].onde};
    if(!erroJs&&ev[i].tipo==='erro_js'&&ev[i].s===TELE.sessoes)erroJs={msg:ev[i].msg,arquivo:ev[i].arquivo,linha:ev[i].linha,quando:new Date(ev[i].t).toISOString()};
  }
  var ci=caseActive();
  return {onde:teleOnde(),dia:S.dia,patente:rankT(),bo:ci<0?null:CASES[ci].id,treino:S.treino?{modulo:S.treino,passo:S.tut+1,pausado:!!S.tutPausado}:null,
    casos_fechados:S.closed.length,janelas:Object.keys(WINS),ultima_consulta:ultima,ultimo_erro_do_jogo:erroJs,
    aparelho:infoAparelho(),idioma:idiomaAtual(),sessao:SESSAO_ID,enviado_em:new Date().toISOString()};
}
function contextoRelatoHTML(c){
  var linhas=[[L('Onde você está'),c.onde],[L('Dia e patente'),L('dia {d}, patente {p}',{d:c.dia+1,p:c.patente})],
    [L('Última consulta'),c.ultima_consulta?c.ultima_consulta.sql+(c.ultima_consulta.erro?' → '+c.ultima_consulta.erro:''):L('nenhuma')],
    [L('Último erro do jogo'),c.ultimo_erro_do_jogo?c.ultimo_erro_do_jogo.msg:L('nenhum')],
    [L('Aparelho'),[c.aparelho.faixa,c.aparelho.sistema,c.aparelho.navegador,c.aparelho.largura+'px'].join(' · ')],[L('Versão do jogo'),VERSAO_JOGO]];
  return '<dl class="relato-ctx">'+linhas.map(function(l){return '<dt>'+escH(l[0])+'</dt><dd>'+escH(String(l[1]))+'</dd>'}).join('')+'</dl>';
}
function relatosHoje(){try{var d=JSON.parse(localStorage.getItem(RELATOS_DIA_KEY)||'null');return d&&d.data===new Date().toISOString().slice(0,10)?d.n:0}catch(e){return 0}}
function contarRelatoHoje(){try{localStorage.setItem(RELATOS_DIA_KEY,JSON.stringify({data:new Date().toISOString().slice(0,10),n:relatosHoje()+1}))}catch(e){}}
function codigoChamado(){return gerarId().replace(/[^a-z0-9]/gi,'').slice(-4).toUpperCase()}

// Envia a fila (um relato por vez). Devolve uma promessa: true se a fila esvaziou.
function enviarFilaRelatos(){
  if(enviandoRelatos||!filaRelatos.length||!remotaConfigurada()||typeof fetch!=='function')return Promise.resolve(!filaRelatos.length);
  var r=filaRelatos[0],c=TELEMETRIA_REMOTA;enviandoRelatos=true;
  return fetch(c.url.replace(/\/$/,'')+'/rest/v1/relatos',{method:'POST',
    headers:{'apikey':c.chave,'Authorization':'Bearer '+c.chave,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(r)})
  .then(function(res){
    enviandoRelatos=false;
    // 4xx de dado inválido: descarta para não travar a fila. 401/403/404 (chave ou tabela ainda não criada): guarda e tenta depois
    if(res.ok||(res.status>=400&&res.status<500&&[401,403,404].indexOf(res.status)<0)){filaRelatos.shift();salvarFilaRelatos();if(!res.ok)return false;return filaRelatos.length?enviarFilaRelatos():true}
    return false;
  },function(){enviandoRelatos=false;return false});
}
setInterval(function(){if(filaRelatos.length)enviarFilaRelatos()},60000);

/* ---------- Conversa ---------- */
function abrirSuporte(tipo){if(tipo==='bug'||tipo==='sugestao')tipoRelato=tipo;chatSel='claudio';openZap();renderZap()}
// Primeira vez na conversa: o Cláudio se apresenta (sem toast nem som: o jogador já está olhando).
// Quem conversou antes de existirem as sugestões recebe o aviso da novidade uma vez.
function saudacaoClaudio(){
  var hora=horaJogo();
  if(S.chat.claudio.length){
    if(!S.claudioSugestoes){S.claudioSugestoes=true;S.chat.claudio.push({me:false,text:L('Novidade: agora eu também anoto <b>sugestão</b>. Teve ideia para melhorar o sistema? Escolhe <b>Sugestão</b> aqui embaixo. A chefia diz que lê tudo; eu garanto que chega.'),hora:hora});S.lidas.claudio=S.chat.claudio.length;save()}
    return;
  }
  S.claudioSugestoes=true;
  S.chat.claudio.push({me:false,text:L('Cláudio, do TI. Antes que você pergunte: não, eu não conserto impressora de casa.'),hora:hora});
  S.chat.claudio.push({me:false,text:L('Achou algo esquisito no sistema? Tela travada, botão que não faz nada, resposta certa que o sistema diz que está errada, texto que não dá para entender? Me conta aqui embaixo o que aconteceu e o que você esperava que acontecesse.'),hora:hora});
  S.chat.claudio.push({me:false,text:L('E se tiver ideia para melhorar o sistema, também serve: escolhe <b>Sugestão</b> antes de escrever.'),hora:hora});
  S.chat.claudio.push({me:'sys',sys:true,text:L('Fora da história: o que você escrever aqui vai de verdade para a equipe que faz o jogo, junto com informações técnicas (onde você estava, a última consulta, o tipo de aparelho). Não escreva nome, e-mail, telefone ou senha. Dúvida de SQL é com a Célia e o Guia SQL.')});
  S.lidas.claudio=S.chat.claudio.length;save();
}
function caixaClaudio(box){
  var sug=tipoRelato==='sugestao',tipos=h('div',{class:'relato-tipos',role:'group','aria-label':L('Tipo do chamado')});
  [['bug',L('Problema')],['sugestao',L('Sugestão')]].forEach(function(t){
    var b=h('button',{class:'relato-tipo','aria-pressed':String(tipoRelato===t[0])},escH(t[1]));
    b.onclick=function(){tipoRelato=t[0];renderZap()};tipos.appendChild(b)});
  box.appendChild(tipos);
  var ta=h('textarea',{class:'relato',rows:'3',maxlength:String(RELATO_MAX),placeholder:sug?L('O que você mudaria ou acrescentaria no jogo? Por quê?'):L('O que aconteceu? O que você esperava que acontecesse?'),'aria-label':sug?L('Descreva a sugestão'):L('Descreva o problema')});
  ta.value=rascunhoRelato;
  var cont=h('span',{class:'relato-cont muted'}),bt=h('button',{class:'tb-btn run'},L('Revisar e enviar'));
  var atualizar=function(){rascunhoRelato=ta.value;cont.textContent=ta.value.length+'/'+RELATO_MAX};
  ta.addEventListener('input',atualizar);atualizar();
  ta.addEventListener('focus',function(){caixaClaudio.foco=true});ta.addEventListener('blur',function(){caixaClaudio.foco=false});
  if(caixaClaudio.foco)setTimeout(function(){ta.focus();ta.selectionStart=ta.selectionEnd=ta.value.length},0);
  bt.onclick=function(){revisarRelato(ta.value.trim(),tipoRelato)};
  box.appendChild(ta);box.appendChild(cont);box.appendChild(bt);
  return true;
}
function claudioDiz(texto,atraso){setTimeout(function(){say('claudio',texto)},atraso==null?1200:atraso)}
function revisarRelato(texto,tipo){
  var sug=tipo==='sugestao';
  if(texto.length<RELATO_MIN)return toast(PEOPLE.claudio.nome,sug?L('Me conta um pouco mais: o que você mudaria e por quê.'):L('Me conta um pouco mais: o que você fez, o que apareceu na tela e o que esperava.'),'warn');
  if(relatosHoje()>=RELATOS_LIMITE_DIA)return toast(PEOPLE.claudio.nome,L('Hoje já são {n} chamados seus. Anota o resto e me manda amanhã, combinado?',{n:RELATOS_LIMITE_DIA}),'warn');
  var ctx=contextoRelato();ctx.tipo=sug?'sugestao':'bug';
  confirmar(L('Enviar para a equipe do jogo'),
    '<p>'+(sug?L('Esta <b>sugestão</b> vai <b>de verdade</b> para quem faz o Pol-OS. Confira antes de enviar:'):L('Isto vai <b>de verdade</b> para quem faz o Pol-OS, para corrigir o problema. Confira antes de enviar:'))+'</p>'+
    '<blockquote class="relato-texto">'+escH(texto)+'</blockquote>'+
    '<p class="muted">'+(sug?L('Vai junto, para a equipe entender de onde veio a ideia:'):L('Vai junto, para ajudar a achar o problema:'))+'</p>'+contextoRelatoHTML(ctx)+
    '<p class="muted">'+L('Não vai junto: seu login, senha ou qualquer dado de fora do jogo. Seu código anônimo:')+' <code>'+escH(jogadorId())+'</code></p>',
    [[L('Enviar'),function(){enviarRelato(texto,ctx)},'btn-primary'],[L('Voltar e editar'),null,'tb-btn']]);
}
function enviarRelato(texto,ctx){
  var cod=codigoChamado();
  filaRelatos.push({chamado:cod,jogador:jogadorId(),versao:VERSAO_JOGO,texto:texto.slice(0,RELATO_MAX),contexto:ctx});
  if(filaRelatos.length>20)filaRelatos.splice(0,filaRelatos.length-20);
  var sug=ctx.tipo==='sugestao';
  salvarFilaRelatos();contarRelatoHoje();rascunhoRelato='';tipoRelato='bug';
  say('claudio',escH(texto),true);
  tele('relato_bug',{chamado:cod,tipo:ctx.tipo});
  if(!remotaConfigurada()){claudioDiz(L('Anotei o chamado #{c}, mas o sistema de chamados está fora do ar nesta versão do jogo. Se puder, conta para quem te passou o jogo.',{c:cod}));return}
  enviarFilaRelatos().then(function(ok){
    claudioDiz(ok?(sug?L('Sugestão #{c} anotada e encaminhada para a equipe. Se virar realidade, pode dizer que foi ideia sua.',{c:cod})
                     :L('Chamado #{c} aberto. Já está na fila da equipe, valeu por avisar! Lembrou de mais alguma coisa? Manda outro.',{c:cod}))
              :L('Opa, a rede daqui caiu. Guardei o chamado #{c} e mando sozinho assim que voltar.',{c:cod}));
  });
}
// Erro técnico do próprio jogo: uma vez por sessão, o Cláudio se oferece (é o tipo de bug que mais precisamos saber).
function oferecerSuporteErro(){
  if(avisouErroJs||!S||!TELE.sessoes)return;avisouErroJs=true;
  setTimeout(function(){toast(PEOPLE.claudio.nome,L('Vi um erro aqui no sistema. Se alguma coisa parou de funcionar, me conta o que você estava fazendo.'),'warn',function(){abrirSuporte('bug')})},800);
}
