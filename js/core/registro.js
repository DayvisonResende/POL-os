/* Registro do conteúdo do jogo. Cada arquivo em js/conteudo/ se registra aqui.
   Para criar um BO novo: crie js/conteudo/casos/<id>.js chamando registrarCaso({...})
   e acrescente a tag <script> correspondente no index.html. */
var CASES=[], PROVAS={}, TREINOS={};
function registrarCaso(c){CASES.push(c);CASES.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0})}
function registrarProva(mod,p){PROVAS[mod]=p}
// Treinamento guiado: {id, titulo, passos:[…], aoConcluir}. Um caso o declara com caso.treino = id.
function registrarTreino(t){TREINOS[t.id]=t}
function indiceCaso(id){for(var i=0;i<CASES.length;i++)if(CASES[i].id===id)return i;return -1}
