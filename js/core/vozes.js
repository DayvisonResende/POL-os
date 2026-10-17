/* Vozes dos personagens (áudio opcional, gravado à parte, ex.: ElevenLabs). Guia: docs/vozes.md
   Cada fala é identificada pelo personagem + o texto exibido (sem HTML). Mudou o texto, muda o id:
   o áudio antigo deixa de tocar e `npm run vozes` avisa que precisa regravar. Nada para numerar à mão. */
var VOZES={};   // idioma → {id: true} dos áudios que existem (js/vozes/<idioma>.js, gerado por npm run vozes -- manifesto)
function registrarVozes(idioma,ids){var m=VOZES[idioma]||(VOZES[idioma]={});ids.forEach(function(i){m[i]=true})}
// Texto como aparece na tela, sem HTML e com espaços normalizados: é ele que define o id.
function textoDaFala(html){return String(html||'').replace(/<br\s*\/?>/gi,' ').replace(/<\/p>\s*<p>/gi,' ').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
// FNV-1a 32 bits: id curto e estável (o mesmo no navegador e na ferramenta do Node).
function idFala(personagem,html){
  var s=personagem+'|'+textoDaFala(html),h=0x811c9dc5;
  for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}
  return personagem+'-'+('0000000'+h.toString(16)).slice(-8);
}
// Versão para a voz ler: símbolos de SQL viram palavras. Ajustes finos por fala: audio/<idioma>/ajustes.json
var PRONUNCIA={'pt-BR':[[/___/g,' tracinhos '],[/>=/g,' maior ou igual a '],[/<=/g,' menor ou igual a '],[/!=|<>/g,' diferente de '],[/(^|\s)>(\s|$)/g,' maior que '],[/(^|\s)<(\s|$)/g,' menor que '],
  [/\*/g,' asterisco '],[/%/g,' porcento '],[/;/g,'.'],[/\(\s*\)/g,''],[/[()]/g,' '],[/'([^']*)'/g,'$1'],[/\s+([.,!?])/g,'$1'],[/\s+/g,' ']]};
function textoFalado(html,idioma){var t=textoDaFala(html);(PRONUNCIA[idioma]||[]).forEach(function(r){t=t.replace(r[0],r[1])});return t.trim()}
