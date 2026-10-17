/* Geração determinística do banco (seed 1042). Acrescente dados novos DEPOIS dos existentes: mudar a ordem das chamadas ao PRNG muda todos os dados aleatórios. */
function buildSeedSQL(){
  var rnd=mulberry32(1042);
  var pick=function(a){return a[Math.floor(rnd()*a.length)]};
  var pad=function(n){return String(n).padStart(2,'0')};
  var LET='ABCDEFGHJKLMNPRSTUVWXYZ';
  var usedCpf=new Set(), usedPl=new Set();
  var people=[], vehicles=[], radar=[], catraca=[];
  function cpf(){var s;do{s=(100+Math.floor(rnd()*899))+'.'+(100+Math.floor(rnd()*899))+'.'+(100+Math.floor(rnd()*899))+'-'+pad(Math.floor(rnd()*99))}while(usedCpf.has(s));usedCpf.add(s);return s}
  var cidades=['Sorocaba','Votorantim','Itu','Salto','Piedade','Araçoiaba da Serra'];
  function person(nome,fixedCpf){var c=fixedCpf||cpf();usedCpf.add(c);var p={cpf:c,nome:nome,nasc:(1960+Math.floor(rnd()*44))+'-'+pad(1+Math.floor(rnd()*12))+'-'+pad(1+Math.floor(rnd()*28)),cidade:pick(cidades)};people.push(p);return p}
  function plate(){var p;do{p=pick(LET)+pick(LET)+pick(LET)+Math.floor(rnd()*10)+pick(LET)+Math.floor(rnd()*10)+Math.floor(rnd()*10)}while(usedPl.has(p)||/^(FTR|KZX|JKL|RTA|MNP|LMB|HBD)/.test(p));usedPl.add(p);return p}

  var planted=[
    ['FTR7A93','Virtus','prata',2021,'Denise Albuquerque Prado'],
    ['FTR2C41','Onix','branco',2020,'Gustavo Henrique Lemos'],
    ['FTR1D08','Corolla','preto',2019,'Patrícia Nogueira Sales'],
    ['FTR9B50','Kwid','vermelho',2022,'Lucas Ferraz Tavares'],
    ['KZX9B21','Hilux','preto',2023,'Valdemar Silveira'],
    ['JKL4A12','Corolla','preto',2022,'Renata Campos Vidal'],
    ['RTA8K02','S10','prata',2021,'Osvaldo Brito Menezes'],
    ['MNP3F77','Hilux','preto',2018,'Carlos Eduardo Paiva'],
    ['LMB6G55','Hilux','preto',2024,'Fernanda Rocha Bastos'],
    ['HBD2D44','HB20','preto',2017,'Igor Matsumoto']
  ];
  planted.forEach(function(v){usedPl.add(v[0])});
  planted.forEach(function(v){var p=person(v[4],v[0]==='KZX9B21'?'318.442.907-15':null);vehicles.push({placa:v[0],modelo:v[1],cor:v[2],ano:v[3],cpf:p.cpf})});

  var nomes=['Ana','Bruno','Camila','Diego','Eduarda','Felipe','Giovana','Heitor','Isabela','João','Karina','Leonardo','Mariana','Natália','Otávio','Priscila','Rafael','Sabrina','Tiago','Vanessa','Wesley','Yasmin','Rodrigo','Beatriz','Marcelo','Larissa','André','Tatiane'];
  var sobre=['Almeida','Barros','Cardoso','Duarte','Esteves','Fonseca','Gomes','Hirata','Junqueira','Leme','Moraes','Nakamura','Oliveira','Pires','Queiroz','Ribeiro','Siqueira','Toledo','Vasconcelos','Zanetti','Moreira','Santana'];
  var modelos=['Gol','Onix','HB20','Corolla','Civic','Compass','Renegade','Strada','Toro','Kwid','Mobi','Polo','T-Cross','Creta','Argo','Saveiro','Ranger','Tracker','Sandero','Fiorino'];
  var cores=['preto','prata','branco','vermelho','cinza','azul'];
  for(var i=0;i<38;i++){
    var p=(i>4&&rnd()<.18)?pick(people.slice(planted.length)):person(pick(nomes)+' '+pick(sobre)+' '+pick(sobre));
    var cor=i<6?cores[i]:pick(['preto','prata','branco','branco','prata','cinza','vermelho','azul','preto']);
    vehicles.push({placa:plate(),modelo:pick(modelos),cor:cor,ano:2008+Math.floor(rnd()*17),cpf:p.cpf});
  }
  for(i=0;i<6;i++)person(pick(nomes)+' '+pick(sobre)+' '+pick(sobre));

  var locais=[['Rod. Castelo Branco - Km 18','km18'],['Rod. Raposo Tavares - Km 92','km92'],['Av. Dom Aguirre','aguirre'],['Av. São Paulo','avsp']];
  var randV=vehicles.slice(planted.length);
  function stamp(min){var d=new Date(Date.UTC(2026,9,12,18,0,0)+min*60000+Math.floor(rnd()*60)*1000);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())}
  for(i=0;i<72;i++){
    var loc=pick(locais), v=pick(randV), min=Math.floor(rnd()*780), ts=stamp(min);
    var sp=loc[1].indexOf('km')===0?70+Math.floor(rnd()*62):30+Math.floor(rnd()*45);
    var t=ts.slice(11);
    if(loc[1]==='km18'&&ts.slice(0,10)==='2026-10-12'&&t>='22:40:00'&&t<='23:20:00')sp=Math.min(sp,115);
    radar.push([v.placa,loc[0],ts,sp,'radar_'+loc[1]+'_'+ts.slice(11).replace(/:/g,'')+'.jpg']);
  }
  [['KZX9B21',0,'2026-10-12 22:58:14',154],['JKL4A12',0,'2026-10-12 22:51:40',128],['RTA8K02',0,'2026-10-12 23:09:03',139],
   ['MNP3F77',0,'2026-10-12 23:05:47',97],['LMB6G55',0,'2026-10-12 21:32:10',141],['HBD2D44',2,'2026-10-12 22:59:30',78],
   ['KZX9B21',1,'2026-10-12 23:41:02',112],['FTR7A93',3,'2026-10-12 19:31:22',64],['FTR2C41',2,'2026-10-12 19:24:05',52]
  ].forEach(function(r){var loc=locais[r[1]];radar.push([r[0],loc[0],r[2],r[3],'radar_'+loc[1]+'_'+r[2].slice(11).replace(/:/g,'')+'.jpg'])});
  radar.sort(function(a,b){return a[2]<b[2]?-1:1});

  var func=[['Roberto Silva','Investigador'],['Roberta Silva Lima','Escrivã'],['Célia Moura','Supervisora DTI'],['Jairo Teixeira','Agente'],['Marina Okada','Perita Criminal'],['Paulo Henrique Dias','Delegado'],['Sueli Ramos','Escrivã']];
  ['2026-10-08','2026-10-09','2026-10-12'].forEach(function(d){
    func.forEach(function(f){
      var e='0'+(7+(rnd()<.5?1:0))+':'+pad(rnd()<.5?Math.floor(rnd()*15):45+Math.floor(rnd()*14))+':'+pad(Math.floor(rnd()*60));
      if(e.slice(0,2)==='08'&&e.slice(3,5)>'40')e='07'+e.slice(2);
      var s=(rnd()<.5?'17:5':'18:0')+Math.floor(rnd()*10)+':'+pad(Math.floor(rnd()*60));
      if(f[0]==='Roberto Silva'&&d==='2026-10-12'){e='08:02:51';s='16:40:12'}
      catraca.push([f[0],f[1],d,e,s]);
    });
  });

  var sql=[];
  sql.push("CREATE TABLE pessoas (cpf TEXT PRIMARY KEY, nome TEXT NOT NULL, data_nascimento DATE, cidade TEXT);");
  sql.push("CREATE TABLE veiculos (placa TEXT PRIMARY KEY, modelo TEXT NOT NULL, cor TEXT NOT NULL, ano INTEGER, cpf_proprietario TEXT NOT NULL REFERENCES pessoas(cpf));");
  sql.push("CREATE TABLE leituras_radar (id INTEGER PRIMARY KEY AUTOINCREMENT, placa TEXT NOT NULL REFERENCES veiculos(placa), local_radar TEXT NOT NULL, data_hora DATETIME NOT NULL, velocidade_kmh INTEGER NOT NULL, foto_radar_url TEXT NOT NULL);");
  sql.push("CREATE TABLE catraca_acessos (id INTEGER PRIMARY KEY AUTOINCREMENT, funcionario TEXT NOT NULL, cargo TEXT NOT NULL, data DATE NOT NULL, horario_entrada TEXT NOT NULL, horario_saida TEXT NOT NULL);");
  people.forEach(function(p){sql.push('INSERT INTO pessoas VALUES ('+[p.cpf,p.nome,p.nasc,p.cidade].map(sq).join(',')+');')});
  // embaralha a ordem de inserção dos veículos para que os plantados não fiquem no topo
  var vs=vehicles.slice();for(i=vs.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var tmp=vs[i];vs[i]=vs[j];vs[j]=tmp}
  vs.forEach(function(v){sql.push('INSERT INTO veiculos VALUES ('+sq(v.placa)+','+sq(v.modelo)+','+sq(v.cor)+','+v.ano+','+sq(v.cpf)+');')});
  radar.forEach(function(r){sql.push('INSERT INTO leituras_radar (placa,local_radar,data_hora,velocidade_kmh,foto_radar_url) VALUES ('+sq(r[0])+','+sq(r[1])+','+sq(r[2])+','+r[3]+','+sq(r[4])+');')});
  catraca.forEach(function(c){sql.push('INSERT INTO catraca_acessos (funcionario,cargo,data,horario_entrada,horario_saida) VALUES ('+c.map(sq).join(',')+');')});
  sql.push(seedFinanceiro(people));
  return sql.join('\n');
}

/* Módulo 3: contas bancárias e transferências (liberadas na patente Inspetor Analítico).
   PRNG próprio (seed 2042): estes dados não mexem nos dados aleatórios de buildSeedSQL, dos quais os BOs 1001–1003 dependem.
   As transferências aleatórias evitam a faixa de R$ 8.500 a R$ 10.500: o padrão de depósitos fracionados logo abaixo
   de R$ 10 mil fica reservado para os registros plantados do caso de lavagem (Sprint 4), que devem ser acrescentados DEPOIS destes. */
function seedFinanceiro(people){
  var rf=mulberry32(2042),pf=function(a){return a[Math.floor(rf()*a.length)]};
  var pad=function(n){return String(n).padStart(2,'0')};
  var bancos=['Banco do Brasil','Caixa','Itaú','Bradesco','Santander','Nubank'];
  var contas=[],usados=new Set();
  people.forEach(function(p){
    var n=rf()<.2?2:(rf()<.85?1:0);
    for(var k=0;k<n;k++){var num;do{num=(10000+Math.floor(rf()*89999))+'-'+Math.floor(rf()*10)}while(usados.has(num));usados.add(num);
      contas.push({id:contas.length+1,banco:pf(bancos),agencia:String(1000+Math.floor(rf()*8999)),numero:num,cpf:p.cpf})}
  });
  var descr=['PIX','PIX','PIX','PIX','TED','Aluguel','Mercado','Conserto','Empréstimo','Presente','Mensalidade','Venda de usado',null];
  var inicio=Date.UTC(2026,8,1,0,0,0),fim=Date.UTC(2026,9,12,23,59,59),tr=[];
  for(var i=0;i<220;i++){
    var o=pf(contas),d;do{d=pf(contas)}while(d===o);
    var r=rf(),v=r<.6?20+rf()*780:(r<.9?800+rf()*7700:10500+rf()*37500);
    var t=new Date(inicio+Math.floor(rf()*(fim-inicio)));
    var ts=t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate())+' '+pad(t.getUTCHours())+':'+pad(t.getUTCMinutes())+':'+pad(t.getUTCSeconds());
    tr.push([o.id,d.id,Math.round(v*100)/100,ts,pf(descr)]);
  }
  tr.sort(function(a,b){return a[3]<b[3]?-1:1});
  // Data de abertura das contas aleatórias: PRNG próprio (3042), para não mudar os valores acima.
  var ra=mulberry32(3042);
  contas.forEach(function(c){c.aberta=(2008+Math.floor(ra()*17))+'-'+pad(1+Math.floor(ra()*12))+'-'+pad(1+Math.floor(ra()*28))});

  // ---- PLANTADO · Operação Véio, Ato II (docs/historia.md) ----
  // A carga roubada em 12/10 virou dinheiro em 13/10: depósitos em espécie (sem conta de origem: NULL) em contas
  // de idosos abertas em setembro (laranjas), repassados em valores logo abaixo de R$ 10 mil para a conta da Denise,
  // dona do Virtus do furto do shopping (BO 1002). PRNG próprio (4042). Acrescentado DEPOIS dos dados aleatórios.
  var rp=mulberry32(4042),novasPessoas=[],planta=[];
  var LARANJAS=[
    ['Antônio Bezerra Lima','211.304.118-07','1946-03-12','Piedade','Caixa','2026-09-15',2],
    ['Maria das Dores Faria','287.115.940-32','1949-11-02','Piedade','Bradesco','2026-09-17',2],
    ['José Carlos Pimentel','305.662.471-90','1944-07-21','Itu','Caixa','2026-09-18',2],
    ['Benedita Souza Arruda','198.540.336-14','1951-01-30','Piedade','Itaú','2026-09-22',1],
    ['Sebastião Ramos Godói','240.873.105-55','1942-09-08','Itu','Santander','2026-09-23',2],
    ['Aparecida Lemos Toledo','332.019.684-21','1953-05-17','Piedade','Caixa','2026-09-25',2],
    ['Geraldo Nunes Vilela','176.428.903-68','1947-12-25','Itu','Bradesco','2026-09-29',2],
    ['Lourdes Campos Vieira','263.957.012-49','1950-04-04','Piedade','Itaú','2026-10-01',1]];
  var denise=people.filter(function(p){return p.nome==='Denise Albuquerque Prado'})[0];
  var contaDenise={id:contas.length+1,banco:'Banco do Brasil',agencia:'3127',numero:'48211-6',cpf:denise.cpf,aberta:'2019-06-11'};
  contas.push(contaDenise);
  var minuto=8*60+12,horaDe=function(m){return '2026-10-13 '+pad(Math.floor(m/60))+':'+pad(m%60)+':'+pad(Math.floor(rp()*60))};
  LARANJAS.forEach(function(l){
    novasPessoas.push({cpf:l[1],nome:l[0],nasc:l[2],cidade:l[3]});
    var c={id:contas.length+1,banco:l[4],agencia:String(1000+Math.floor(rp()*8999)),numero:(10000+Math.floor(rp()*89999))+'-'+Math.floor(rp()*10),cpf:l[1],aberta:l[5]};
    contas.push(c);
    for(var k=0;k<l[6];k++){
      var dep=Math.round((9400+rp()*560)*100)/100;
      planta.push([null,c.id,dep,horaDe(minuto),'DEPÓSITO EM ESPÉCIE']);
      planta.push([c.id,contaDenise.id,Math.round((dep-50-rp()*300)*100)/100,horaDe(minuto+240+Math.floor(rp()*200)),rp()<.5?'PIX':'TED']);
      minuto+=13+Math.floor(rp()*9);
    }
  });
  planta.sort(function(a,b){return a[3]<b[3]?-1:1});

  var sql=["CREATE TABLE contas_bancarias (id INTEGER PRIMARY KEY, banco TEXT NOT NULL, agencia TEXT NOT NULL, numero TEXT NOT NULL, cpf_titular TEXT NOT NULL REFERENCES pessoas(cpf), aberta_em DATE NOT NULL);",
           "CREATE TABLE transferencias (id INTEGER PRIMARY KEY AUTOINCREMENT, conta_origem INTEGER REFERENCES contas_bancarias(id), conta_destino INTEGER NOT NULL REFERENCES contas_bancarias(id), valor REAL NOT NULL, data_hora DATETIME NOT NULL, descricao TEXT);"];
  novasPessoas.forEach(function(p){sql.push('INSERT INTO pessoas VALUES ('+[p.cpf,p.nome,p.nasc,p.cidade].map(sq).join(',')+');')});
  contas.forEach(function(c){sql.push('INSERT INTO contas_bancarias VALUES ('+c.id+','+[c.banco,c.agencia,c.numero,c.cpf,c.aberta].map(sq).join(',')+');')});
  tr.concat(planta).forEach(function(x){sql.push('INSERT INTO transferencias (conta_origem,conta_destino,valor,data_hora,descricao) VALUES ('+(x[0]==null?'NULL':x[0])+','+x[1]+','+x[2].toFixed(2)+','+sq(x[3])+','+(x[4]==null?'NULL':sq(x[4]))+');')});
  return sql.join('\n');
}
