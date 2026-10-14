/* Side quest do Beto (catraca e pedido de fraude de ponto). */
function startBeto(){
  if(S.beto!=='none')return;S.beto='asked';
  say('beto','Irmão, salva minha vida. Esqueci se bati o ponto na saída ontem (12/10). Dá uma olhada na <code>catraca_acessos</code> e me fala o horário de saída que tá lá? Meu nome tá como Roberto Silva.');
}
function answerBeto(v){
  var t=v.replace(/[^\d:]/g,'');
  if(t==='16:40:12'||t==='16:40'||t==='1640'){S.beto='favor';addMetas(10);
    say('beto','16:40?! Verdade, saí pro dentista e esqueci de avisar. Valeu! Ó, em troca: o rádio da viatura falou que a caminhonete da Castelo é uma <b>Hilux</b>.');
    setTimeout(function(){say('beto','Agora… consegue mudar esse horário pra 18:00 aí no sistema? Ninguém vai ver, juro.')},1800);
  }else if(S.beto==='asked'){S.beto='wrong';
    addCorr(15,'Beto passou ao RH um horário errado informado por você.');
    say('beto','Passei esse horário pro RH e eles disseram que não bate. Agora abriram uma nota. Confere de novo? Filtra pelo meu nome E pela data.');
  }else say('beto','Ainda não bate… filtra por funcionario e por data = \'2026-10-12\'.');
}
function favorBeto(c){
  S.beto='done';
  if(c==='no'){say('beto','Tá certo, tá certo. Não custava tentar. Valeu mesmo assim.')}
  else{say('beto','Sabia que podia contar contigo!');addCorr(15,'Pedido de alteração de ponto registrado no seu login.');
    setTimeout(function(){say('celia','Recruta, a Corregedoria registrou uma conversa sobre alteração de ponto no teu login. Teu perfil nem tem permissão de escrita, e mesmo se tivesse: não se mete nisso. O Beto é gente boa, mas já me rendeu duas sindicâncias.')},2500)}
  save();
}
