/* Termo de uso da telemetria remota. Mudou algo importante (o que é coletado ou para quê)?
   Aumente TERMO_VERSAO: todo mundo é perguntado de novo. */
var TERMO_VERSAO=1;
function termoResumoHTML(){return ''+
 '<p>'+L('Este é um jogo educativo em desenvolvimento. Para melhorá-lo, ele pode registrar <b>como</b> você joga e enviar esses dados, de forma <b>anônima</b>, para quem faz o jogo.')+'</p>'+
 '<p>'+L('<b>O que é enviado:</b> em que parte do jogo você está, quanto tempo leva, as consultas que você executa e os erros, as dicas que pede, as escolhas que faz, erros técnicos do jogo e o tipo de aparelho (computador ou celular, navegador e tamanho da tela).')+'</p>'+
 '<p>'+L('<b>O que nunca é enviado:</b> seu nome, e-mail, endereço ou qualquer dado pessoal. Você é identificado só por um <b>código aleatório</b> criado neste navegador.')+'</p>'+
 '<p>'+L('<b>Para quê:</b> só para melhorar o jogo, por exemplo achar onde as pessoas travam e corrigir erros. Os dados não são vendidos nem compartilhados.')+'</p>'+
 '<p>'+L('O jogo funciona igual nas duas escolhas, e você pode mudar de ideia quando quiser em <b>SISP › Configurações › Privacidade</b>.')+'</p>'}
function termoCompletoHTML(){var c=TELEMETRIA_REMOTA.contato;return ''+
 '<h5>'+L('Quem coleta')+'</h5><p>'+L('A equipe que desenvolve o SISP, um jogo educativo de SQL. Os dados ficam guardados num banco de dados na nuvem.')+'</p>'+
 '<h5>'+L('Dados coletados')+'</h5><ul><li>'+L('Eventos do jogo: passos do treinamento, chamados, provas, dicas, mensagens de erro, tempo em cada parte, escolhas (por exemplo, nas conversas com personagens).')+'</li>'+
 '<li>'+L('As consultas SQL que você executa no jogo (até 400 caracteres cada). São sobre o banco fictício do jogo.')+'</li>'+
 '<li>'+L('Informações técnicas: tipo de aparelho, família do navegador e do sistema, idioma, faixa de tamanho da tela, erros técnicos do jogo e versão do jogo.')+'</li>'+
 '<li>'+L('Um código aleatório deste navegador e um código para cada vez que o jogo é aberto.')+'</li></ul>'+
 '<h5>'+L('Dados que não coletamos')+'</h5><p>'+L('Nome, e-mail, telefone, endereço, localização, fotos, contatos ou qualquer coisa fora do jogo. O código aleatório não permite descobrir quem você é.')+'</p>'+
 '<h5>'+L('Finalidade')+'</h5><p>'+L('Melhorar o jogo: entender onde as pessoas travam, quanto tempo cada parte leva, quais mensagens ajudam e quais erros técnicos acontecem. Nenhum uso comercial; nenhum compartilhamento com terceiros.')+'</p>'+
 '<h5>'+L('Seus direitos')+'</h5><p>'+L('Você pode parar de enviar a qualquer momento (SISP › Configurações › Privacidade).')+' '+(c?L('Os dados já enviados podem ser apagados: envie o seu código (aparece em Privacidade) para <b>{contato}</b>.',{contato:escH(c)}):L('Os dados já enviados podem ser apagados: peça à equipe do jogo informando o seu código (aparece em Privacidade).'))+'</p>'+
 '<h5>'+L('Menores de idade')+'</h5><p>'+L('Se você tem menos de 18 anos, leia este termo com o seu responsável antes de aceitar.')+'</p>'+
 '<p class="muted">'+L('Versão {v} do termo.',{v:TERMO_VERSAO})+'</p>'}
