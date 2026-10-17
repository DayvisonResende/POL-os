/* Serviços do Beto: treino livre pelo PolíciaZap ("Tem serviço?"). Lógica pura: catálogo, sorteio e domínio.
   Conteúdo em js/conteudo/servicos.js; motor (conversa, espera, Metas) em js/historia/servicos.js.
   - CONCEITOS[id] = {nome, treino}: o treinamento que libera o conceito.
   - Domínio: DOMINIO_SEGUIDOS acertos seguidos de primeira. Uma vez dominado, fica dominado (o selo não cai).
   - Serviço com vários conceitos (mistura) só aparece quando cada um deles já está dominado sozinho:
     é assim que o treino mistura o básico com o avançado, aos poucos.
   - O sorteio favorece o que ainda não foi dominado, o que o jogador errou e o que ele não vê há tempo. */
var CONCEITOS={}, SERVICOS=[], DOMINIO_SEGUIDOS=3;
function registrarConceito(id,c){CONCEITOS[id]=c}
function registrarServico(s){SERVICOS.push(s)}
function novoTreinoLivre(){return {conceitos:{},n:0,ultimo:null,aberto:null,turno:'',noTurno:0}}
function estadoConceito(T,id){return T.conceitos[id]||(T.conceitos[id]={seguidos:0,acertos:0,erros:0,dominado:false,visto:-1})}
function dominado(T,id){return !!(T.conceitos[id]&&T.conceitos[id].dominado)}
// liberado(conceito) → bool; disponivel(servico) → bool (ex.: tabelas que o jogador ainda não acessa)
function servicosDisponiveis(T,liberado,disponivel){
  return SERVICOS.filter(function(s){
    if(!s.conceitos.every(liberado))return false;
    if(disponivel&&!disponivel(s))return false;
    return s.conceitos.length===1||s.conceitos.every(function(c){return dominado(T,c)});
  });
}
function pesoServico(T,s){
  var p=1;
  s.conceitos.forEach(function(c){var e=estadoConceito(T,c);
    if(!e.dominado)p+=2;                            // ainda aprendendo
    p+=Math.min(e.erros,3);                         // errou: volta mais
    p+=Math.min(T.n-e.visto,6)/2;                   // espaçamento: faz tempo que não vê
  });
  if(s.conceitos.length>1)p+=2;                     // a mistura é o objetivo final
  if(s.id===T.ultimo)p=p/10;                        // não repetir o mesmo em seguida
  return p;
}
function sortearServico(T,liberado,disponivel,rng){
  var l=servicosDisponiveis(T,liberado,disponivel);if(!l.length)return null;
  var pesos=l.map(function(s){return pesoServico(T,s)}),tot=pesos.reduce(function(a,b){return a+b},0),x=(rng||Math.random)()*tot;
  for(var i=0;i<l.length;i++){x-=pesos[i];if(x<0)return l[i]}
  return l[l.length-1];
}
// Variação sorteada do serviço: os valores vêm do banco (s.variar), para não decorar a resposta.
function variarServico(s,rng,anterior){
  var vs=s.variar?s.variar():[{}];
  if(vs.length>1&&anterior){var outro=vs.filter(function(v){return JSON.stringify(v)!==JSON.stringify(anterior)});if(outro.length)vs=outro}
  return vs[Math.floor((rng||Math.random)()*vs.length)];
}
// Resposta do serviço: o primeiro valor da consulta de referência (s.sql(p)).
function respostaServico(s,p){return valorDe(s.sql(p))}
// Confere a resposta digitada: número (com tolerância) ou texto. Texto: basta ter as palavras que importam
// ("São Paulo" vale por "Av. São Paulo"), sem ligar para acento, maiúscula ou pontuação.
var SERV_PALAVRAS_SOLTAS=['av','rod','km','da','de','do','das','dos'];
function conferirServico(s,p,v){
  var certo=respostaServico(s,p);
  if(typeof certo==='number'){
    var tol=typeof s.tolerancia==='function'?s.tolerancia(p):(s.tolerancia||0);
    return (String(v).match(/-?\d+(?:[.,]\d+)*/g)||[]).some(function(n){return Math.abs(lerNumero(n)-certo)<=tol+1e-9});
  }
  var dito=' '+normTxt(v).replace(/[^a-z0-9]+/g,' ')+' ';
  var chave=normTxt(certo).split(/[^a-z0-9]+/).filter(function(w){return w&&SERV_PALAVRAS_SOLTAS.indexOf(w)<0});
  return chave.length>0&&chave.every(function(w){return dito.indexOf(' '+w+' ')>=0||dito.replace(/ /g,'').indexOf(w)>=0&&w.length>=5});
}
// Marca o resultado. Devolve os conceitos que ficaram dominados agora (para o aviso).
function registrarResultado(T,s,dePrimeira){
  var novos=[];
  s.conceitos.forEach(function(c){var e=estadoConceito(T,c);e.visto=T.n;
    if(dePrimeira){e.acertos++;e.seguidos++;if(!e.dominado&&e.seguidos>=DOMINIO_SEGUIDOS){e.dominado=true;novos.push(c)}}
    else{e.erros++;e.seguidos=0}
  });
  T.n++;T.ultimo=s.id;return novos;
}
