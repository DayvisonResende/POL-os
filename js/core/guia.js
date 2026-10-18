/* Guia SQL: referência rápida dos comandos já ensinados. Conteúdo em js/conteudo/guia.js; app em js/apps/guia.js.
   Cada verbete: {id, titulo, treino (o treinamento que o libera), resumo, formato, exemplos:[{sql, explica}],
   erros:[...], mercado (opcional), ver:[ids relacionados], busca (palavras extras)}.
   Regra: o Guia ensina o "como", nunca o "o quê" dos BOs. Exemplos com outros valores e outras perguntas;
   tests/guia.test.js reprova qualquer exemplo que mostre resposta de caso. */
var VERBETES=[];
function registrarVerbete(v){VERBETES.push(v)}
function verbete(id){return VERBETES.filter(function(v){return v.id===id})[0]||null}
// feito(idTreino) → bool. Só aparece o que o jogador já aprendeu, na ordem do jogo.
function verbetesLiberados(feito){return VERBETES.filter(function(v){return feito(v.treino)})}
function buscarVerbetes(lista,termo){
  var t=normTxt(termo);if(!t)return lista;
  return lista.filter(function(v){return normTxt([v.titulo,v.resumo,v.formato,v.busca||''].join(' ')).indexOf(t)>=0})
    .sort(function(a,b){return (normTxt(b.titulo).indexOf(t)>=0)-(normTxt(a.titulo).indexOf(t)>=0)});
}
