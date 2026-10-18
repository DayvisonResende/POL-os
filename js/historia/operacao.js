/* Operação do galpão (Ato III, docs/historia.md). Depois do mandado (BO 1006), a Marina pergunta pelo PolíciaZap
   o horário e o caminho da equipe. A escolha do jogador fica em S.marinaOperacao ('contou' | 'recusou') e na
   telemetria: no Ato V, quando a informante aparece, isso volta. Nenhuma das duas evita o galpão vazio: ela é da
   perícia e sabia da operação de qualquer jeito. É assim que o vazamento acontece, e não por culpa do jogador. */
function marinaPerguntaOperacao(){
  if(S.marinaOperacao)return;S.marinaOperacao='perguntou';save();
  say('marina',L('Soube do galpão! Vou junto pra perícia. Que horas a equipe sai? E vão pela Raposo ou pela Castelo?'));
}
function responderMarina(contou){
  if(S.marinaOperacao!=='perguntou')return;
  S.marinaOperacao=contou?'contou':'recusou';save();
  tele('dilema',{quem:'marina',escolha:S.marinaOperacao});
  say('marina',contou?L('22h, pela Raposo.'):L('O Jairo pediu pra não falar nada no Zap. Pergunta pra ele.'),true);
  setTimeout(function(){say('marina',contou?L('Valeu! Te vejo lá. Quer dizer, vejo o Jairo, né, você fica na mesa.'):L('Certinho, profissional. Pergunto pra ele então. Bom trabalho!'))},1200);
}
function caixaMarina(box){
  if(S.marinaOperacao!=='perguntou')return false;
  [[L('Contar: "22h, pela Raposo."'),true],[L('Não contar: "O Jairo pediu pra não falar nada no Zap."'),false]].forEach(function(o){
    var b=h('button',{class:'opt'},escH(o[0]));b.onclick=function(){responderMarina(o[1])};box.appendChild(b)});
  return true;
}
