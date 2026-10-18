/* BO 1007 · Módulo 4 · JOIN com GROUP BY, a soma que infla (★) e LEFT JOIN / "quem não tem" (★)
   O delegado precisa do valor exato da carga (R$ 380 mil, como no BO 1004) e a equipe da operação quer todos os
   galpões da Raposo Tavares, inclusive os vazios, para o cerco desta noite. */
registrarCaso({id:'1007',titulo:L('O tamanho do prejuízo'),modulo:4,natureza:L('Roubo de carga · avaliação do prejuízo'),quando:'15/10/2026 13:30',local:L('DTI · Operação Véio'),solicitante:L('Delegado Paulo Henrique Dias'),
  treino:'m4-left',rankMin:3,diaMin:2,tempo:150,
  relato:L('O pedido de prisão precisa do <b>valor exato</b> da carga roubada, e a seguradora da Transportadora Central também. As notas fiscais da viagem de 12/10 estão no sistema, com os itens de cada uma.<br><br>E a equipe que vai ao galpão hoje à noite pediu mais uma coisa: a lista de <b>todos</b> os imóveis da Rodovia Raposo Tavares, inclusive os <b>vazios</b>, para cercar a região.<br><br><q>Número de relatório pra delegado não pode ser inventado, recruta. Confere tudo duas vezes.</q> (Célia)'),
  steps:[
   {t:L('Liste as <b>notas fiscais</b> levadas pela <b>Transportadora Central</b> no dia <b>12/10</b>. Use o nome da transportadora, não o CNPJ: junte as notas com as empresas.'),
    h:[L('A nota aponta para quem levou a carga em <code>notas_fiscais.cnpj_transportadora</code>, que liga com <code>empresas.cnpj</code>.'),
       L("O formato é <code>SELECT n.* FROM notas_fiscais n JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '…';</code>"),
       L("<code>SELECT n.* FROM notas_fiscais n JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '2026-10-12';</code>")],
    ok:function(R){return R.n===F.notasCarga.length&&hasAll(R,F.notasCarga)},
    quase:function(R){if(hasAll(R,F.notasCarga)&&R.n>F.notasCarga.length)return L('as notas da carga estão aí, mas junto com as de outros dias. Filtre a data: <code>\'2026-10-12\'</code>.')}},
   {t:L('Mostre os <b>itens</b> dessas notas: o produto e a quantidade.'),
    h:[L('Mais um JOIN: o item aponta para a nota em <code>itens_nota.nota_id</code>, que liga com <code>notas_fiscais.id</code>.'),
       L('O formato é <code>SELECT i.produto, i.quantidade FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id JOIN empresas e ON … WHERE …;</code>'),
       L("<code>SELECT i.produto, i.quantidade FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '2026-10-12';</code>")],
    ok:function(R){return R.n===F.nItensCarga&&has(R,'Notebook','Celular','Smart TV')}},
   {t:L('Qual o <b>valor total</b> da carga roubada? Um número só.'),
    h:[L('Cuidado com a soma depois do JOIN com os itens: a nota se repete uma vez por item. Some do lado certo.'),
       L('Dois caminhos: <code>SUM(n.valor_total)</code> <b>sem</b> o JOIN com os itens, ou <code>SUM(i.quantidade * i.valor_unitario)</code> com ele.'),
       L("<code>SELECT SUM(n.valor_total) FROM notas_fiscais n JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '2026-10-12';</code>")],
    ok:function(R){return R.n===1&&temNumero(R,F.valorCarga,0.01)},
    quase:function(R){if(R.n===1&&temNumero(R,F.somaInflada,0.01))return L('esse número não existe, recruta. O BO 1004 dizia R$ 380 mil, e você me trouxe quase dois milhões. Conta quantas linhas o JOIN com os itens gerou: a nota se repetiu uma vez por item.')},
    aoConcluir:function(){say('celia',L('R$ 380 mil. Bate com a avaliação da seguradora. Número inflado em relatório pra delegado é processo anulado no tribunal; guarda isso pro resto da vida.'))}},
   {t:L('Quantas <b>unidades de cada produto</b> foram roubadas?'),
    h:[L('Agora, sim, a soma é do lado dos itens: <code>SUM(i.quantidade)</code>, agrupando por produto.'),
       L('O formato é <code>SELECT i.produto, SUM(i.quantidade) FROM … GROUP BY i.produto;</code>'),
       L("<code>SELECT i.produto, SUM(i.quantidade) FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id JOIN empresas e ON e.cnpj = n.cnpj_transportadora WHERE e.razao_social LIKE '%Central%' AND n.data_emissao = '2026-10-12' GROUP BY i.produto;</code>")],
    ok:function(R){return bateGrupos(R,linhasDe('SELECT i.produto, SUM(i.quantidade) AS q FROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id WHERE '+F.QCARGA+' GROUP BY i.produto'),'produto','q')}},
   {t:L('Liste <b>todos</b> os imóveis da <b>Rodovia Raposo Tavares</b>, com o nome da empresa que aluga cada um, <b>inclusive os vazios</b>.'),
    h:[L('JOIN comum tira o imóvel sem inquilino. Para manter todos, use <code>LEFT JOIN</code> com <code>empresas</code>.'),
       L("O formato é <code>SELECT i.endereco, e.razao_social FROM imoveis i LEFT JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE i.referencia LIKE '%Raposo%';</code>"),
       L("<code>SELECT i.endereco, e.razao_social FROM imoveis i LEFT JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE i.referencia LIKE '%Raposo%';</code>")],
    ok:function(R){return R.n===linhasDe("SELECT id FROM imoveis WHERE referencia LIKE '%Raposo%'").length&&has(R,F.fachada)&&R.rows.some(function(r){return r.some(function(v){return v===null})})},
    quase:function(R){var tot=linhasDe("SELECT id FROM imoveis WHERE referencia LIKE '%Raposo%'").length;if(has(R,F.fachada)&&R.n<tot)return L('faltam os imóveis vazios: o JOIN comum tira quem não tem par. Troque por <code>LEFT JOIN</code>.')}},
   {t:L('Agora só os <b>vazios</b>: os imóveis da Raposo Tavares <b>sem inquilino</b>.'),
    h:[L('LEFT JOIN + IS NULL: quem não teve par tem a empresa vazia.'),
       L("Acrescente no WHERE: <code>AND e.cnpj IS NULL</code>."),
       L("<code>SELECT i.endereco FROM imoveis i LEFT JOIN empresas e ON e.cnpj = i.cnpj_locatario WHERE i.referencia LIKE '%Raposo%' AND e.cnpj IS NULL;</code>")],
    ok:function(R){var l=linhasDe("SELECT i.endereco FROM imoveis i WHERE i.referencia LIKE '%Raposo%' AND i.cnpj_locatario IS NULL");return R.n===l.length&&hasAll(R,l.map(function(x){return x.endereco}))},
    quase:function(R){if(R.n===0)return L('voltou vazio? Aposto num <code>= NULL</code>. Pro vazio do LEFT JOIN, é <code>IS NULL</code>.')},
    aoConcluir:function(){say('jairo',L('Os vazios da região, anotados. A equipe passa por eles também, no caminho. Valeu, recruta.'))}}
  ],
  final:{tipo:'resposta',titulo:L('Relatório ao delegado'),campos:[{id:'valor',label:L('Valor total da carga roubada (R$)')},{id:'vagos',label:L('Quantos imóveis da Raposo Tavares estão vazios?')}],
    check:function(v){
      var val=lerNumero(v.valor),vg=parseInt(String(v.vagos).replace(/\D/g,''),10),nVagos=linhasDe("SELECT id FROM imoveis WHERE referencia LIKE '%Raposo%' AND cnpj_locatario IS NULL").length;
      if(Math.abs(val-F.somaInflada)<=1)return {ok:false,pen:10,msg:L('Célia: "Quase dois milhões? A seguradora avaliou em R$ 380 mil. Esse número é a soma que infla: a nota se repetiu uma vez por item no JOIN. Refaz a conta."')};
      if(!(Math.abs(val-F.valorCarga)<=1))return {ok:false,pen:5,msg:L('Célia: "O valor da carga não bate. É a soma das notas da Transportadora Central em 12/10."')};
      if(vg!==nVagos)return {ok:false,pen:5,msg:L('Célia: "O valor está certo, mas a contagem de imóveis vazios não. LEFT JOIN, e só quem ficou sem empresa."')};
      return {ok:true,msg:L('Relatório aceito. O delegado anexou ao pedido de prisão e mandou cópia para a seguradora. A equipe sai às 22h.')}}},
  manual:L("<h5>LEFT JOIN</h5>Mantém todas as linhas da tabela do FROM; quem não tem par vem com NULL.<pre>SELECT p.nome, v.placa\nFROM pessoas p\nLEFT JOIN veiculos v ON v.cpf_proprietario = p.cpf;</pre><h5>Quem não tem</h5>LEFT JOIN + IS NULL na coluna da outra tabela.<pre>… WHERE v.placa IS NULL;</pre><h5>A soma que infla</h5>1 nota → N itens: depois do JOIN, a nota se repete N vezes. Some do lado \"muitos\":<pre>SUM(i.quantidade * i.valor_unitario)</pre>ou some sem o JOIN com os itens.<h5>JOIN com GROUP BY</h5><pre>SELECT i.produto, SUM(i.quantidade)\nFROM notas_fiscais n JOIN itens_nota i ON i.nota_id = n.id\nGROUP BY i.produto;</pre>"),
  aoEncerrar:function(){
    setTimeout(function(){say('celia',L('Relatório na mesa do delegado. Agora a ACADEPOL, e depois casa. Hoje à noite é com o Jairo.'))},1500);
    setTimeout(function(){toast('ACADEPOL',L('Prova do Módulo 4 liberada.'),'warn',openProva)},3500)}
});
