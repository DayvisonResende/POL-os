/* BO 1006 · Módulo 4 · JOIN de 2 a 5 tabelas · Operação Véio, Ato III (docs/historia.md)
   A Hilux passou num segundo radar (Raposo Tavares, Km 92, 23:41). O dono no papel é o Valdemar, e no nome dele há
   uma empresa de fachada aberta em setembro, que aluga um galpão no Km 93. Cada tarefa acrescenta um JOIN; a última
   junta tudo numa consulta só (a cena que a Célia prometeu: "o que na terça levou três consultas"). */
registrarCaso({id:'1006',titulo:L('O segundo radar'),modulo:4,natureza:L('Roubo de carga · localização'),quando:'15/10/2026 08:40',local:L('DTI · Operação Véio'),solicitante:L('Célia Moura, Supervisora DTI'),
  treino:'m4-join',rankMin:3,diaMin:2,tempo:180,
  relato:L('A Hilux da Castelo Branco sumiu desde terça, e com ela a carga. A escuta foi clara: <q>Some com ela até sexta.</q> Sexta é amanhã.<br><br><q>Ontem eu te perguntei se o radar viu aquela caminhonete uma vez só, recruta. Hoje você responde. E não para no radar: quem é o dono, o que mais está no nome dele, onde isso tudo vai dar.</q><br><br>Agora você tem as bases da Junta Comercial (<code>empresas</code>) e dos cartórios (<code>imoveis</code>). Cruze tudo.'),
  steps:[
   {t:L('Liste as <b>passagens de radar</b> das caminhonetes <b>Hilux</b>, com a placa, o local e o horário.'),
    h:[L('O modelo está em <code>veiculos</code>; a passagem, em <code>leituras_radar</code>. Junte as duas pela placa.'),
       L("O formato é <code>SELECT r.placa, r.local_radar, r.data_hora FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa WHERE v.modelo = '…';</code>"),
       L("<code>SELECT r.placa, r.local_radar, r.data_hora FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa WHERE v.modelo = 'Hilux';</code>")],
    ok:function(R){return R.n===linhasDe("SELECT r.id FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa WHERE v.modelo = 'Hilux'").length&&has(R,F.passagemKm92)},
    quase:function(R){if(R.n>F.nVeic*10)return L('resultado gigante: faltou o <code>ON</code>, e o banco combinou cada passagem com cada carro.');
      if(has(R,'Hilux')&&!has(R,F.passagemKm92))return L('as Hilux estão aí, mas falta o horário das passagens: <code>r.data_hora</code>.')},
    aoConcluir:function(){say('celia',L('Duas vezes a KZX9B21. A primeira na Castelo, 22:58, saindo do assalto. A segunda às 23:41, na Raposo, Km 92: uma hora depois, indo pro outro lado da cidade.'))}},
   {t:L('Numa consulta só, mostre o <b>nome do dono</b> da Hilux que passou no radar do <b>Km 92</b>.'),
    h:[L('Acrescente um JOIN com <code>pessoas</code>: o carro aponta para o dono por <code>cpf_proprietario</code>.'),
       L("O formato é <code>… FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar LIKE '%Km 92%';</code>"),
       L("<code>SELECT p.nome, r.data_hora FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario WHERE r.local_radar LIKE '%Km 92%' AND v.modelo = 'Hilux';</code>")],
    ok:function(R){return R.n<=3&&has(R,'Valdemar Silveira')},
    quase:function(R){if(has(R,'KZX9B21')&&!has(R,'Valdemar Silveira'))return L('a placa está aí; falta o dono. Mais um JOIN, com <code>pessoas</code>.');
      if(has(R,'Valdemar Silveira'))return L('o nome está aí, mas no meio de muita gente. Filtre o radar do Km 92 e o modelo.')},
    aoConcluir:function(){say('celia',L('O Valdemar de novo. O de chinelo, que nunca dirigiu uma Hilux. Nome emprestado, igual aos velhinhos de ontem. Se usaram o nome dele pra caminhonete, pra que mais usaram?'))}},
   {t:L('Descubra se existe alguma <b>empresa</b> no nome dessa pessoa. Mostre o nome da empresa e <b>quando foi aberta</b>.'),
    h:[L('A empresa aponta para quem responde por ela em <code>empresas.cpf_responsavel</code>. Junte com <code>pessoas</code>.'),
       L("O formato é <code>SELECT e.razao_social, e.aberta_em FROM empresas e JOIN pessoas p ON p.cpf = e.cpf_responsavel WHERE p.nome = '…';</code>"),
       L("<code>SELECT e.razao_social, e.aberta_em FROM empresas e JOIN pessoas p ON p.cpf = e.cpf_responsavel WHERE p.nome = 'Valdemar Silveira';</code>")],
    ok:function(R){return has(R,F.fachada)&&has(R,F.aberturaFachada)&&R.n<=3},
    quase:function(R){if(has(R,F.fachada)&&!has(R,F.aberturaFachada))return L('achou a empresa. Falta a data em que ela foi aberta: <code>aberta_em</code>.')},
    aoConcluir:function(){say('celia',L('Aberta em setembro. Igual às contas dos velhinhos: semanas antes do assalto. Ninguém de 66 anos abre armazém do nada.'))}},
   {t:L('Veja se essa empresa <b>aluga algum imóvel</b>: o endereço e desde quando.'),
    h:[L('O imóvel aponta para quem aluga em <code>imoveis.cnpj_locatario</code>, que liga com <code>empresas.cnpj</code>.'),
       L("O formato é <code>SELECT i.endereco, i.alugado_em FROM imoveis i JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE e.razao_social = '…';</code>"),
       L('Use o nome da empresa que você achou na tarefa anterior, igualzinho, dentro das aspas.')],
    ok:function(R){return has(R,F.galpao)&&has(R,F.aluguelGalpao)&&R.n<=3},
    quase:function(R){if(has(R,F.galpao)&&!has(R,F.aluguelGalpao))return L('o endereço está aí. Falta desde quando: <code>alugado_em</code>.');
      if(R.n>3&&has(R,F.galpao))return L('o galpão está no meio de muitos imóveis. Filtre pela empresa.')},
    aoConcluir:function(){
     say('celia',L('Um galpão. Raposo Tavares, Km 93: um quilômetro depois do radar. Alugado no fim de setembro.'));
     setTimeout(function(){say('jairo',L('Recruta, o Km 93 fica a cinco minutos do radar. Bate certinho com o horário da Hilux. Só falta uma coisa pro delegado assinar.'))},4500)}},
   {t:L('Agora <b>junte tudo numa consulta só</b>: do radar do Km 92 até o galpão. Mostre o <b>horário da passagem</b> e o <b>endereço do imóvel</b>.'),
    h:[L('São cinco tabelas e quatro JOINs: <code>leituras_radar → veiculos → pessoas → empresas → imoveis</code>. Cada JOIN com o seu ON. O Mapa das tabelas (no Dicionário) mostra o caminho.'),
       L("O formato é <code>SELECT r.data_hora, i.endereco FROM leituras_radar r JOIN veiculos v ON … JOIN pessoas p ON … JOIN empresas e ON … JOIN imoveis i ON … WHERE r.local_radar LIKE '%Km 92%';</code>"),
       L("<code>SELECT r.data_hora, i.endereco FROM leituras_radar r JOIN veiculos v ON v.placa = r.placa JOIN pessoas p ON p.cpf = v.cpf_proprietario JOIN empresas e ON e.cpf_responsavel = p.cpf JOIN imoveis i ON i.cnpj_locatario = e.cnpj WHERE r.local_radar LIKE '%Km 92%' AND v.modelo = 'Hilux';</code>")],
    ok:function(R){return R.n<=3&&has(R,F.passagemKm92)&&has(R,F.galpao)},
    achado:{valores:function(){return [F.passagemKm92,F.galpao]},frase:L('Do radar ao galpão, numa consulta só: a Hilux passou no Km 92 e o galpão fica logo ali. Isso aí vira <b>mandado de busca</b>.')},
    quase:function(R){if(has(R,F.galpao)&&!has(R,F.passagemKm92))return L('o galpão está aí. Mostre também o horário da passagem (<code>r.data_hora</code>): é isso que prova o caminho inteiro.');
      if(has(R,F.galpao)&&R.n>3)return L('o caminho está certo, mas veio mais gente. Filtre o radar do Km 92 e o modelo Hilux.')},
    aoConcluir:function(){say('celia',L('Lembra quanto tempo você levou na terça, com três consultas e um monte de copiar e colar? Olha agora: cinco tabelas, uma consulta. Pede o mandado.'))}}
  ],
  final:{tipo:'mandado',titulo:L('Pedido de mandado de busca'),campos:[{id:'endereco',label:L('Endereço do imóvel')},{id:'empresa',label:L('Empresa que aluga o imóvel')}],
    check:function(v){
      var end=normTxt(v.endereco),emp=normTxt(v.empresa),km=(end.match(/km\s*(\d+)/)||[])[1];
      if(!/raposo/.test(end)||!km)return {ok:false,pen:15,msg:L('O juiz negou o mandado: o endereço está incompleto. Escreva a rodovia e o quilômetro, como está no cadastro.')};
      if(km!=='93'){var outro=linhasDe("SELECT i.alugado_em AS a FROM imoveis i WHERE i.referencia = 'Rod. Raposo Tavares, Km "+km+"'")[0];
        return {ok:false,pen:15,msg:outro?(outro.a?L('O juiz negou o mandado: esse galpão é alugado há anos por uma empresa comum, sem ligação com o caso.'):L('O juiz negou o mandado: esse galpão está vazio, sem inquilino. Não tem ligação com o caso.')):L('O juiz negou o mandado: não existe imóvel nesse quilômetro no cadastro.')}}
      if(emp.indexOf(normTxt(F.fachada).split(' ')[0])<0||emp.indexOf('armaz')<0)return {ok:false,pen:10,msg:L('Endereço certo, mas a empresa não confere com o cadastro do cartório. Juiz não assina mandado com dado errado.')};
      return {ok:true,msg:L('Mandado de busca deferido. Operação marcada para hoje à noite no galpão do Km 93.')}}},
  manual:L("<h5>JOIN … ON</h5>Junta duas tabelas pela coluna que liga uma à outra.<pre>SELECT v.placa, p.nome\nFROM veiculos v\nJOIN pessoas p ON p.cpf = v.cpf_proprietario;</pre><h5>Apelidos</h5><code>veiculos v</code>: depois, <code>v.placa</code> é a placa de veículos.<h5>Três tabelas ou mais</h5>Um JOIN e um ON para cada ligação.<pre>FROM leituras_radar r\nJOIN veiculos v ON v.placa = r.placa\nJOIN pessoas p ON p.cpf = v.cpf_proprietario</pre><h5>Quem liga com quem</h5>Dicionário de Dados › <b>Mapa das tabelas</b>, ou a nota \"aponta para\" de cada coluna.<h5>Cuidado</h5>JOIN sem ON combina tudo com tudo: resultado enorme e falso."),
  aoEncerrar:function(){
    setTimeout(function(){say('celia',L('Mandado na mão. A operação é hoje à noite, com o Jairo e a perícia. Até lá, bico fechado: isso não sai desta sala.'))},1500);
    setTimeout(function(){say('jairo',L('Equipe sai às 22h, pela Raposo. Ninguém comenta nada, nem no Zap. Recruta, segura o resto do dia pra mim: o delegado quer o tamanho do prejuízo.'))},6000);
    setTimeout(marinaPerguntaOperacao,14000)}
});
