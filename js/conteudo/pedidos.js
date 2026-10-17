/* Pedidos dos colegas (opcionais): prática fora da história principal, pelo PolíciaZap.
   quando(): o pedido chega quando isso fica verdadeiro. check(resposta) → {ok, msg}. Erro não pune: é treino.
   Motor: js/historia/pedidos.js. A conta é feita no banco (valorDe/linhasDe): nada de número fixo no texto. */
registrarPedido({id:'jairo-radares',de:'jairo',metas:10,
  quando:function(){return S.dia>=1&&caseDone(indiceCaso('1004'))},
  texto:L('Recruta, me salva numa rápida? O delegado quer um número pro relatório da Operação: qual <b>local de radar</b> registrou <b>mais passagens</b> no cadastro inteiro, e <b>quantas</b>? Me manda o local e o número. Sem pressa, mas é pra hoje.'),
  placeholder:L('local e quantidade, ex.: Av. Tal, 10'),
  check:function(v){
    var top=linhasDe('SELECT local_radar, COUNT(*) AS n FROM leituras_radar GROUP BY local_radar ORDER BY n DESC LIMIT 1')[0];
    var t=normTxt(v),nums=String(v).match(/\d+/g)||[];
    var palavras=normTxt(top.local_radar).split(/[^a-z]+/).filter(function(w){return w.length>=4});
    var local=palavras.some(function(w){return t.indexOf(w)>=0}),numero=nums.indexOf(String(top.n))>=0;
    if(local&&numero)return {ok:true,msg:L('Isso! {local}, {n} passagens. Vou mandar pro delegado com teu nome do lado. Fico te devendo um café.',{local:top.local_radar,n:top.n})};
    if(numero)return {ok:false,msg:L('O número bate. Mas de qual radar? Me manda o local também.')};
    if(local)return {ok:false,msg:L('O radar é esse mesmo. E quantas passagens? Agrupa e conta.')};
    return {ok:false,msg:L('Hmm, não bate com o que eu tenho aqui. Agrupa as passagens por local_radar, conta e ordena da maior pra menor.')};
  }});
