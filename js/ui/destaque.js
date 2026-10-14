/* Destaque piscando e seta "clica aqui" do tutorial. */
var spotSel=null,spotLabel=null;
function spot(sel,label){spotSel=sel;spotLabel=label||null;document.querySelectorAll('.spot').forEach(function(e){e.classList.remove('spot')});if(sel){var e=$(sel);if(e)e.classList.add('spot')}}
(function ptrLoop(){requestAnimationFrame(ptrLoop);var p=$('#ptr');if(!p)return;
  var el=spotSel&&spotLabel?$(spotSel):null;
  if(!el||!el.offsetParent||el.closest('.win.min')||$('.overlay')){p.hidden=true;return}
  var a=$('#app').getBoundingClientRect(),r=el.getBoundingClientRect(),cx=r.left-a.left+r.width/2,below=r.bottom-a.top+8;
  var up=below+64<a.height;p.hidden=false;p.classList.toggle('down',!up);p.querySelector('span').textContent=spotLabel;
  var w=p.offsetWidth,x=Math.max(8,Math.min(cx-w/2,a.width-w-8));p.style.left=x+'px';p.style.setProperty('--ax',(cx-x)+'px');
  p.style.top=(up?below:(r.top-a.top-8-p.offsetHeight))+'px'})();
