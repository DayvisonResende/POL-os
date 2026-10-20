/* Telemetria remota: envia os eventos de js/ui/telemetria.js para o Supabase, SÓ com consentimento
   (termo de uso, js/conteudo/termo.js) e só se js/config.js tiver url e chave. Sem isso, não faz nada.
   Envio em lotes, com fila guardada no navegador: se a internet cair, manda depois. Nunca trava o jogo. */
var CONSENT_KEY='sisp-consentimento',JOGADOR_KEY='sisp-jogador',FILA_KEY='sisp-telemetria-fila',FILA_MAX=1000,LOTE=40;
function gerarId(){try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID()}catch(e){}return 'j'+Date.now().toString(36)+Math.random().toString(36).slice(2,14)}
var SESSAO_ID=gerarId(),enviandoFila=false;
var filaRemota=(function(){try{var f=JSON.parse(localStorage.getItem(FILA_KEY)||'[]');return Array.isArray(f)?f:[]}catch(e){return []}})();
function salvarFila(){try{localStorage.setItem(FILA_KEY,JSON.stringify(filaRemota))}catch(e){}}
function remotaConfigurada(){return !!(TELEMETRIA_REMOTA&&TELEMETRIA_REMOTA.url&&TELEMETRIA_REMOTA.chave)}
function consentimento(){try{return JSON.parse(localStorage.getItem(CONSENT_KEY)||'null')}catch(e){return null}}
function remotaLigada(){var c=consentimento();return remotaConfigurada()&&!!c&&c.decisao==='sim'&&c.versao===TERMO_VERSAO}
function precisaPerguntar(){var c=consentimento();return remotaConfigurada()&&(!c||c.versao!==TERMO_VERSAO)}
function jogadorId(){var j=null;try{j=localStorage.getItem(JOGADOR_KEY)}catch(e){}if(!j){j=gerarId();try{localStorage.setItem(JOGADOR_KEY,j)}catch(e){}}return j}
function decidirConsentimento(sim){
  try{localStorage.setItem(CONSENT_KEY,JSON.stringify({decisao:sim?'sim':'nao',versao:TERMO_VERSAO,em:new Date().toISOString()}))}catch(e){}
  if(!sim){filaRemota=[];salvarFila()}
  tele('consentimento',{decisao:sim?'sim':'nao'});   // só chega ao servidor quando é "sim"
  if(typeof buildStart==='function'&&$('#startMenu'))buildStart();
}
// Chamado por tele() a cada evento.
function enfileirarRemota(e){
  if(!remotaLigada())return;
  var dados={};for(var k in e)if(['t','s','tipo','onde'].indexOf(k)<0)dados[k]=e[k];
  filaRemota.push({jogador:jogadorId(),sessao:SESSAO_ID,versao:VERSAO_JOGO,t:e.t,tipo:String(e.tipo).slice(0,40),onde:e.onde?String(e.onde).slice(0,80):null,dados:dados});
  if(filaRemota.length>FILA_MAX)filaRemota.splice(0,filaRemota.length-FILA_MAX);
  salvarFila();
  if(filaRemota.length>=LOTE)enviarFila();
}
function enviarFila(saindo){
  if(enviandoFila||!filaRemota.length||!remotaLigada()||typeof fetch!=='function')return;
  var lote=filaRemota.slice(0,LOTE),c=TELEMETRIA_REMOTA;enviandoFila=true;
  fetch(c.url.replace(/\/$/,'')+'/rest/v1/eventos',{method:'POST',keepalive:!!saindo,
    headers:{'apikey':c.chave,'Authorization':'Bearer '+c.chave,'Content-Type':'application/json','Prefer':'return=minimal'},
    body:JSON.stringify(lote)})
  .then(function(r){
    // 2xx: enviado. 4xx: o servidor recusou o lote (dado inválido); descarta para a fila não travar. 5xx: tenta de novo depois.
    if(r.ok||(r.status>=400&&r.status<500)){filaRemota.splice(0,lote.length);salvarFila()}
    enviandoFila=false;if(r.ok&&!saindo&&filaRemota.length>=LOTE)enviarFila();
  },function(){enviandoFila=false});
}
setInterval(function(){enviarFila()},15000);
// pausa, volta e saída só de quem entrou no jogo: recarregar a tela de login não é uma sessão (era 70% do barulho)
function entrouNoJogo(){return TELE.sessoes>0}
document.addEventListener('visibilitychange',function(){
  if(!entrouNoJogo())return;
  if(document.visibilityState==='hidden'){tele('pausa');enviarFila(true)}else tele('volta');
});
window.addEventListener('pagehide',function(){if(entrouNoJogo()){tele('saida');enviarFila(true)}});
// Erros técnicos do próprio jogo: o tipo de problema que só aparece no aparelho dos outros.
var dentroDoErro=false;
function registrarErroJs(msg,arq,linha){if(dentroDoErro)return;dentroDoErro=true;try{tele('erro_js',{msg:String(msg).slice(0,200),arquivo:String(arq||'').split('/').slice(-2).join('/'),linha:linha||0});if(typeof oferecerSuporteErro==='function')oferecerSuporteErro()}catch(e){}dentroDoErro=false}
window.addEventListener('error',function(e){registrarErroJs(e.message,e.filename,e.lineno)});
window.addEventListener('unhandledrejection',function(e){registrarErroJs('promessa: '+(e.reason&&e.reason.message||e.reason),'',0)});

/* Termo de uso: no primeiro login (se a telemetria remota estiver configurada) e em Configurações › Privacidade. */
function mostrarTermo(depois){
  confirmar(L('Termos de uso'),
    termoResumoHTML()+'<details class="termo"><summary>'+L('Ler os termos completos')+'</summary>'+termoCompletoHTML()+'</details>',
    // os termos do jogo valem nas duas escolhas; só a coleta muda. Botões com o mesmo peso:
    // consentimento não pode ser empurrado (LGPD)
    [[L('Aceito os termos e envio dados anônimos'),function(){decidirConsentimento(true);if(depois)depois()},'btn-igual'],
     [L('Aceito os termos, sem enviar dados'),function(){decidirConsentimento(false);if(depois)depois()},'btn-igual']]);
}
function abrirPrivacidade(){
  var lig=remotaLigada();
  confirmar(L('Privacidade'),
    '<p>'+(lig?L('Envio de dados anônimos de uso: <b>ligado</b>.'):L('Envio de dados anônimos de uso: <b>desligado</b>.'))+'</p>'+
    '<p>'+L('Seu código anônimo neste navegador:')+' <code>'+escH(jogadorId())+'</code><br><span class="muted">'+L('Use este código se quiser pedir a exclusão dos dados já enviados.')+'</span></p>'+
    '<details class="termo"><summary>'+L('Ler os termos completos')+'</summary>'+termoCompletoHTML()+'</details>',
    [[lig?L('Desligar o envio'):L('Ligar o envio'),function(){decidirConsentimento(!lig);toast(L('Privacidade'),lig?L('Envio de dados desligado.'):L('Envio de dados ligado. Obrigado por ajudar!'),'ok')},'btn-primary'],
     [L('Fechar'),null,'tb-btn']]);
}
