/* ---------- Mapa das tabelas (Dicionário de Dados › Mapa) ----------
   Desenho das tabelas liberadas, com as chaves (PK) e as colunas que apontam para outra tabela (FK), e uma seta
   para cada ligação. As ligações vêm das notas "aponta para tabela.coluna" do Dicionário (COLNOTES): tabela nova
   com nota entra no mapa sozinha. Tabelas ainda bloqueadas não aparecem (não revela o que vem depois). */
var MAPA_POS={leituras_radar:[0,0],veiculos:[1,0],pessoas:[2,0],empresas:[3,0],
  transferencias:[0,1],contas_bancarias:[1,1],imoveis:[3,1],catraca_acessos:[0,2],itens_nota:[1,2],notas_fiscais:[2,2]};
function ligacoesMapa(){
  var l=[];Object.keys(COLNOTES).forEach(function(k){var m=COLNOTES[k].match(/aponta para (\w+)\.(\w+)/);if(m){var p=k.split('.');l.push({de:p[0],col:p[1],para:m[1],alvo:m[2]})}});return l;
}
function openMapa(){openWin('mapa',{title:L('Mapa das tabelas'),w:900,h:520,x:120,y:20,build:function(){renderMapa()},refresh:function(){renderMapa()}});tele('mapa',{})}
function renderMapa(){
  var r=WINS.mapa;if(!r)return;
  var tabs=SCHEMA.tables.slice(),liga=ligacoesMapa().filter(function(x){return tabs.indexOf(x.de)>=0&&tabs.indexOf(x.para)>=0});
  var W=180,DX=220,DY=165,box={},livre=0;
  tabs.forEach(function(t){var p=MAPA_POS[t]||[livre++%4,3];
    var cols=SCHEMA.info[t].filter(function(c){return c.pk||liga.some(function(x){return x.de===t&&x.col===c.name})||liga.some(function(x){return x.para===t&&x.alvo===c.name})});
    box[t]={x:12+p[0]*DX,y:12+p[1]*DY,w:W,h:26+cols.length*19,cols:cols}});
  var maxX=0,maxY=0;Object.keys(box).forEach(function(t){maxX=Math.max(maxX,box[t].x+W+12);maxY=Math.max(maxY,box[t].y+box[t].h+12)});
  // ponto onde a reta entre os centros cruza a borda da caixa
  var borda=function(b,tx,ty){var cx=b.x+b.w/2,cy=b.y+b.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return [cx,cy];var s=Math.min(Math.abs((b.w/2)/(dx||1e-9)),Math.abs((b.h/2)/(dy||1e-9)));return [cx+dx*s,cy+dy*s]};
  var svg='<svg class="mapa-svg" width="'+maxX+'" height="'+maxY+'" viewBox="0 0 '+maxX+' '+maxY+'" role="img" aria-label="'+escH(L('Mapa das tabelas e das ligações entre elas'))+'"><defs><marker id="mseta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="mapa-ponta"/></marker></defs>';
  liga.forEach(function(x,i){var a=box[x.de],b=box[x.para];if(!a||!b)return;
    var p1=borda(a,b.x+b.w/2,b.y+b.h/2),p2=borda(b,a.x+a.w/2,a.y+a.h/2),dup=liga.filter(function(y){return y.de===x.de&&y.para===x.para}).indexOf(x)*6;
    svg+='<line class="mapa-liga" x1="'+p1[0]+'" y1="'+(p1[1]+dup)+'" x2="'+p2[0]+'" y2="'+(p2[1]+dup)+'" marker-end="url(#mseta)"><title>'+escH(x.de+'.'+x.col+' → '+x.para+'.'+x.alvo)+'</title></line>'});
  Object.keys(box).forEach(function(t){var b=box[t];
    svg+='<g class="mapa-tab"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="3"/><rect class="mapa-cab" x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="22" rx="3"/><text class="mapa-nome" x="'+(b.x+8)+'" y="'+(b.y+15)+'">'+escH(t)+'</text>';
    b.cols.forEach(function(c,k){var fk=liga.some(function(x){return x.de===t&&x.col===c.name});
      svg+='<text class="mapa-col" x="'+(b.x+8)+'" y="'+(b.y+40+k*19)+'"><tspan class="mapa-chave">'+(c.pk?'PK':fk?'FK':'')+'</tspan> '+escH(c.name)+'</text>'});
    svg+='</g>'});
  svg+='</svg>';
  r.body.innerHTML='<div class="mapa"><p class="mapa-dica">'+L('Cada seta sai da coluna que <b>aponta</b> (FK) e chega na tabela de onde vem a informação. É por essas colunas que um JOIN liga uma tabela à outra: <code>ON a.coluna_fk = b.chave</code>.')+'</p>'+svg+'</div>';
}
