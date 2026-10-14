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
  return sql.join('\n');
}
