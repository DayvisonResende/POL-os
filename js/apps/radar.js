/* ---------- radar photo ---------- */
var COR_HEX={preto:'#141617',prata:'#a9b0b3',branco:'#e8ebea',vermelho:'#8e2222',cinza:'#5d6366',azul:'#24457a'};
function openPhoto(name){
  var r=db.exec('SELECT r.placa,r.local_radar,r.data_hora,r.velocidade_kmh,v.cor,v.modelo FROM leituras_radar r LEFT JOIN veiculos v ON v.placa=r.placa WHERE r.foto_radar_url='+sq(name)+' LIMIT 1');
  var row=r.length?r[0].values[0]:null;
  openWin('ph_'+name,{title:name,w:560,h:400,build:function(rec){
    rec.body.innerHTML='<div class="photo"><canvas width="640" height="400" role="img" aria-label="Foto do radar '+escH(name)+'"></canvas></div>';
    drawRadar(rec.body.querySelector('canvas'),row,name)}});
}
function drawRadar(cv,row,name){
  var x=cv.getContext('2d'),W=cv.width,H=cv.height,seed=0;for(var i=0;i<name.length;i++)seed=(seed*31+name.charCodeAt(i))|0;var rnd=mulberry32(seed);
  var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#071012');g.addColorStop(1,'#1a2a24');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='#202c28';x.beginPath();x.moveTo(W*.32,H*.32);x.lineTo(W*.68,H*.32);x.lineTo(W,H);x.lineTo(0,H);x.fill();
  x.strokeStyle='rgba(230,220,170,.55)';x.lineWidth=4;x.setLineDash([22,26]);x.beginPath();x.moveTo(W/2,H*.34);x.lineTo(W/2,H);x.stroke();x.setLineDash([]);
  if(row){
    var col=COR_HEX[row[4]]||'#444',big=/Hilux|S10|Ranger|Toro|Strada|Saveiro|Fiorino/.test(row[5]||'');
    var cw=big?250:220,ch=big?150:118,cx=W*.5-cw/2+(rnd()-.5)*60,cy=H*.48;
    x.fillStyle=col;x.fillRect(cx,cy+ch*.28,cw,ch*.62);
    x.beginPath();x.moveTo(cx+cw*.16,cy+ch*.3);x.lineTo(cx+cw*.26,cy);x.lineTo(cx+cw*.74,cy);x.lineTo(cx+cw*.84,cy+ch*.3);x.fill();
    x.fillStyle='rgba(120,170,180,.25)';x.fillRect(cx+cw*.28,cy+ch*.05,cw*.44,ch*.22);
    x.fillStyle='#fff8d0';x.shadowColor='#fff3a0';x.shadowBlur=24;x.beginPath();x.arc(cx+cw*.13,cy+ch*.55,10,0,7);x.arc(cx+cw*.87,cy+ch*.55,10,0,7);x.fill();x.shadowBlur=0;
    x.fillStyle='#f1f1ea';x.fillRect(cx+cw/2-52,cy+ch*.66,104,26);x.fillStyle='#1d3f8a';x.fillRect(cx+cw/2-52,cy+ch*.66,104,6);
    x.fillStyle='#111';x.font='bold 17px monospace';x.textAlign='center';x.fillText(row[0],cx+cw/2,cy+ch*.66+23);
  }
  var id=x.getImageData(0,0,W,H),d=id.data;for(i=0;i<d.length;i+=4){var n=(rnd()-.5)*38;d[i]+=n;d[i+1]+=n*1.15;d[i+2]+=n}x.putImageData(id,0,0);
  x.fillStyle='rgba(60,255,120,.06)';x.fillRect(0,0,W,H);
  x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,W,30);x.fillRect(0,H-34,W,34);
  x.font='600 14px monospace';x.textAlign='left';x.fillStyle='#9ff0b6';
  if(row){x.fillText('DER-SP · '+row[1].toUpperCase(),10,20);x.fillText(row[2],10,H-12);x.textAlign='right';x.fillStyle=row[3]>120?'#ffb347':'#9ff0b6';x.fillText('VEL '+row[3]+' KM/H · LIM 120',W-10,H-12);x.fillStyle='#9ff0b6';x.fillText('PLACA '+row[0],W-10,20)}
  else{x.fillText('ARQUIVO SEM METADADOS',10,20)}
}
