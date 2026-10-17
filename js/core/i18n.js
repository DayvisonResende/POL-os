/* Idiomas. Convenção (estilo gettext): todo texto que o jogador vê passa por L('texto em português', {vars}).
   O português (pt-BR) é o idioma-fonte e fica escrito no próprio código, onde o autor lê e edita.
   Cada tradução (js/i18n/<idioma>.js) mapeia "texto em português" → "texto traduzido".
   Sem tradução, aparece o português, nunca uma chave técnica. Guia: docs/idiomas.md · Progresso: npm run i18n

   Regras para escrever texto:
   - Frase inteira dentro do L(), com {marcadores} para valores: L('Base carregada: {n} veículos.', {n: total}).
     Nunca montar frase concatenando pedaços: outros idiomas mudam a ordem das palavras.
   - O texto dentro do L() precisa ser um literal ('…'), para a ferramenta de tradução enxergar. */
var IDIOMA_FONTE='pt-BR', IDIOMAS={}, _idiomaAtual=null;
function registrarIdioma(cod,def){
  var I=IDIOMAS[cod]||(IDIOMAS[cod]={nome:cod,pronto:false,textos:{}});
  if(def.nome)I.nome=def.nome;
  if('pronto' in def)I.pronto=!!def.pronto;   // pronto = pode ser oferecido aos jogadores (tradução completa e revisada)
  var t=def.textos||{};for(var k in t)I.textos[k]=t[k];
}
registrarIdioma(IDIOMA_FONTE,{nome:'Português (Brasil)',pronto:true});
function idiomasDisponiveis(incluirIncompletos){return Object.keys(IDIOMAS).filter(function(c){return incluirIncompletos||IDIOMAS[c].pronto})}
// Ordem: teste automático → ?idioma=xx no endereço (qualquer idioma, para testar) → escolha salva → idioma do navegador → português.
function escolherIdioma(){
  var g=typeof window!=='undefined'?window:{};
  if(g.SISP_IDIOMA_TESTE&&IDIOMAS[g.SISP_IDIOMA_TESTE])return g.SISP_IDIOMA_TESTE;
  try{var m=/[?&]idioma=([\w-]+)/.exec(g.location.search);if(m&&IDIOMAS[m[1]])return m[1]}catch(e){}
  try{var salvo=localStorage.getItem('sisp-idioma');if(salvo&&IDIOMAS[salvo]&&IDIOMAS[salvo].pronto)return salvo}catch(e){}
  var nav=String((g.navigator&&g.navigator.language)||'').toLowerCase(),prontos=idiomasDisponiveis();
  return prontos.filter(function(c){return c.toLowerCase()===nav})[0]||prontos.filter(function(c){return c.split('-')[0].toLowerCase()===nav.split('-')[0]})[0]||IDIOMA_FONTE;
}
function idiomaAtual(){return _idiomaAtual||(_idiomaAtual=escolherIdioma())}
function definirIdioma(c){_idiomaAtual=c}   // testes do Node
// Plural: Lp(n, '1 linha', '{n} linhas'). As duas formas vão para a tradução; {n} é preenchido sozinho.
function Lp(n,um,varios,vars){var v={};for(var k in vars||{})v[k]=vars[k];v.n=n;return L(n===1?um:varios,v)}
function L(texto,vars){
  var I=IDIOMAS[idiomaAtual()],s=(I&&I.textos[texto])||texto;
  if(vars)s=s.replace(/\{(\w+)\}/g,function(m,k){return Object.prototype.hasOwnProperty.call(vars,k)?vars[k]:m});
  return s;
}
