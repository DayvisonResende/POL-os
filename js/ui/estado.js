/* Estado salvo do jogador (S). Mudança incompatível no formato → trocar SAVE_KEY. */
var SAVE_KEY='sisp-proto-v2';
function freshState(){return {caseSel:0,steps:{},closed:[],metas:0,corr:0,clock:480,chat:{celia:[],beto:[],jairo:[],marina:[]},unread:{celia:0,beto:0,jairo:0,marina:0},beto:'none',writeWarned:false,queries:0,errors:0,editor:'',hintsSeen:{},fired:false,done:false,verdict:{},marinaApresentou:false,treino:null,treinosFeitos:[],tutEntrou:null,tut:0,tutPhase:'doing',tutPick:null,tutPred:false,tutWrong:[],tutBlocks:[],tutHint:0,tutFb:null,apps:['db'],rank:0,prova:null,provaTries:{}}}
var S=freshState();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function load(){try{var s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&s.chat){S=Object.assign(freshState(),s);if(!('treino' in s))migrarTreino();Object.keys(PEOPLE).forEach(function(k){S.chat[k]=S.chat[k]||[];S.unread[k]=S.unread[k]||0});return true}}catch(e){}return false}
// Saves de antes do Sprint 2 só tinham o treinamento do Módulo 1, controlado por S.tut.
function migrarTreino(){if(S.tut<TREINOS.m1.passos.length)S.treino='m1';else{S.treinosFeitos=['m1'];S.tut=0}}
function rankT(){return RANKS[S.rank].t}
function resetAll(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}location.reload()}
