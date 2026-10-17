/* Tocador das vozes. Só toca o que está no manifesto (js/vozes/<idioma>.js): nada de pedir arquivo que não existe.
   Preferência por navegador (não vai no progresso): sisp-vozes = {ligado, volume, aviso}. Vozes e som de mensagem desligados por padrão.
   O texto continua sempre na tela: a voz acompanha, nunca substitui. */
var VOZ_PREF=(function(){try{var p=JSON.parse(localStorage.getItem('sisp-vozes')||'null');if(p)return p}catch(e){}return {ligado:false,volume:0.8}})();
var vozFila=[],vozTocando=null;
function vozesDisponiveis(){var m=VOZES[idiomaAtual()];return m?Object.keys(m).length:0}
function temVoz(personagem,html){var m=VOZES[idiomaAtual()];return !!m&&!!m[idFala(personagem,html)]}
// "Plim" de mensagem nova, gerado na hora (sem arquivo de áudio). Desligado por padrão.
var avisoCtx=null;
function tocarAviso(){
  if(!VOZ_PREF.aviso)return;
  try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;avisoCtx=avisoCtx||new C();var t0=avisoCtx.currentTime;
    [[880,0],[1320,0.09]].forEach(function(n){var o=avisoCtx.createOscillator(),g=avisoCtx.createGain();o.type='sine';o.frequency.value=n[0];
      g.gain.setValueAtTime(0.0001,t0+n[1]);g.gain.exponentialRampToValueAtTime(0.18*(VOZ_PREF.volume||0.8),t0+n[1]+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+n[1]+0.22);
      o.connect(g);g.connect(avisoCtx.destination);o.start(t0+n[1]);o.stop(t0+n[1]+0.25)})}catch(e){}
}
function alternarAviso(){VOZ_PREF.aviso=!VOZ_PREF.aviso;salvarPrefVoz();buildStart();tele('som_aviso',{ligado:VOZ_PREF.aviso});if(VOZ_PREF.aviso)tocarAviso()}
function salvarPrefVoz(){try{localStorage.setItem('sisp-vozes',JSON.stringify(VOZ_PREF))}catch(e){}}
// Toca (ou enfileira) a fala, se houver áudio. forcar: botão 🔊, toca mesmo com as vozes desligadas.
function falar(personagem,html,forcar){
  if(!temVoz(personagem,html)||(!VOZ_PREF.ligado&&!forcar))return false;
  var src='audio/'+idiomaAtual()+'/'+idFala(personagem,html)+'.mp3';
  if(forcar){pararVozes();vozFila=[src]}else vozFila.push(src);
  if(!vozTocando)proximaVoz();
  return true;
}
function proximaVoz(){
  var src=vozFila.shift();if(!src){vozTocando=null;return}
  var a=new Audio(src);a.volume=VOZ_PREF.volume;vozTocando=a;
  a.onended=a.onerror=function(){vozTocando=null;proximaVoz()};
  var p=a.play();if(p&&p.catch)p.catch(function(){vozTocando=null;proximaVoz()});   // navegador bloqueou: segue sem som
  tele('voz',{arquivo:src.split('/').pop()});
}
function pararVozes(){vozFila=[];if(vozTocando){try{vozTocando.pause()}catch(e){}vozTocando=null}}
function botaoOuvir(personagem,html){
  if(!temVoz(personagem,html))return null;
  var b=h('button',{class:'ouvir',title:L('Ouvir'),'aria-label':L('Ouvir')},'&#128266;');
  b.onclick=function(e){e.stopPropagation();falar(personagem,html,true)};return b;
}
function abrirVozes(){
  confirmar(L('Vozes dos personagens'),
    '<p>'+L('As falas dos personagens podem ser lidas em voz alta. O texto continua na tela.')+'</p><label class="voz-vol">'+L('Volume')+' <input type="range" min="0" max="1" step="0.1" id="vozVol" value="'+VOZ_PREF.volume+'"></label>',
    [[VOZ_PREF.ligado?L('Desligar as vozes'):L('Ligar as vozes'),function(){VOZ_PREF.ligado=!VOZ_PREF.ligado;if(!VOZ_PREF.ligado)pararVozes();salvarPrefVoz();buildStart();tele('vozes',{ligado:VOZ_PREF.ligado})},'btn-primary'],
     [L('Fechar'),null,'tb-btn']]);
  var r=$('#vozVol');if(r)r.oninput=function(){VOZ_PREF.volume=+r.value;salvarPrefVoz();if(vozTocando)vozTocando.volume=VOZ_PREF.volume};
}
