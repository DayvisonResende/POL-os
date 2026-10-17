/* Tocador das vozes. Só toca o que está no manifesto (js/vozes/<idioma>.js): nada de pedir arquivo que não existe.
   Preferência por navegador (não vai no progresso): sisp-vozes = {ligado, volume}. Desligado por padrão.
   O texto continua sempre na tela: a voz acompanha, nunca substitui. */
var VOZ_PREF=(function(){try{var p=JSON.parse(localStorage.getItem('sisp-vozes')||'null');if(p)return p}catch(e){}return {ligado:false,volume:0.8}})();
var vozFila=[],vozTocando=null;
function vozesDisponiveis(){var m=VOZES[idiomaAtual()];return m?Object.keys(m).length:0}
function temVoz(personagem,html){var m=VOZES[idiomaAtual()];return !!m&&!!m[idFala(personagem,html)]}
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
