/* ---------- window manager ---------- */
var WINS={}, zTop=10;
function focusWin(id){var w=WINS[id];if(!w)return;w.el.classList.remove('min');w.el.style.zIndex=++zTop;Object.keys(WINS).forEach(function(k){WINS[k].el.classList.toggle('active',k===id)});renderTasks()}
function openWin(id,opts){
  if(WINS[id]){focusWin(id);if(opts.refresh)opts.refresh(WINS[id]);return WINS[id]}
  var desk=$('#desk'),dw=desk.clientWidth,dh=desk.clientHeight;
  var w=Math.min(opts.w||640,dw-20),hh=Math.min(opts.h||460,dh-20);
  var n=Object.keys(WINS).length;
  var x=opts.x!=null?opts.x:Math.max(110,Math.min(dw-w-10,120+n*28)),y=opts.y!=null?opts.y:Math.min(dh-hh-10,20+n*24);
  x=Math.max(0,Math.min(x,dw-w));y=Math.max(0,Math.min(y,dh-hh));
  var el=h('div',{class:'win',role:'dialog','aria-label':opts.title});
  el.style.cssText='left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+hh+'px';
  var tb=h('div',{class:'wtb'});
  tb.appendChild(h('span',{class:'wt'},escH(opts.title)));
  var bMin=h('button',{'aria-label':'Minimizar',title:'Minimizar'},'&#8211;');
  var bMax=h('button',{class:'mx','aria-label':'Maximizar',title:'Maximizar'},'&#9633;');
  var bX=h('button',{class:'x','aria-label':'Fechar',title:'Fechar'},'&#10005;');
  tb.appendChild(bMin);tb.appendChild(bMax);tb.appendChild(bX);
  var body=h('div',{class:'wbody'});
  el.appendChild(tb);el.appendChild(body);desk.appendChild(el);
  var rec={id:id,el:el,body:body,title:opts.title,max:null};
  WINS[id]=rec;
  bMin.onclick=function(e){e.stopPropagation();el.classList.add('min');el.classList.remove('active');renderTasks()};
  bX.onclick=function(e){e.stopPropagation();el.remove();delete WINS[id];if(opts.onClose)opts.onClose();renderTasks()};
  bMax.onclick=function(e){e.stopPropagation();toggleMax(rec)};
  tb.addEventListener('dblclick',function(){toggleMax(rec)});
  el.addEventListener('pointerdown',function(){if(!el.classList.contains('active'))focusWin(id)});
  // drag
  tb.addEventListener('pointerdown',function(e){
    if(e.target.closest('button')||window.innerWidth<=760)return;
    var sx=e.clientX,sy=e.clientY,ox=el.offsetLeft,oy=el.offsetTop;tb.setPointerCapture(e.pointerId);
    function mv(ev){var nx=ox+ev.clientX-sx,ny=oy+ev.clientY-sy;nx=Math.max(-el.offsetWidth+80,Math.min(nx,desk.clientWidth-80));ny=Math.max(0,Math.min(ny,desk.clientHeight-30));el.style.left=nx+'px';el.style.top=ny+'px'}
    function up(){tb.removeEventListener('pointermove',mv);tb.removeEventListener('pointerup',up)}
    tb.addEventListener('pointermove',mv);tb.addEventListener('pointerup',up);
  });
  opts.build(rec);
  focusWin(id);
  return rec;
}
function toggleMax(rec){var el=rec.el;if(rec.max){el.style.cssText=rec.max;rec.max=null}else{rec.max=el.style.cssText;el.style.left='0px';el.style.top='0px';el.style.width='100%';el.style.height='100%'}el.style.zIndex=++zTop}
function renderTasks(){
  var t=$('#tasks');t.innerHTML='';
  Object.keys(WINS).forEach(function(id){var w=WINS[id];var on=w.el.classList.contains('active')&&!w.el.classList.contains('min');
    var b=h('button',{class:'tbtn'+(on?' on':''),title:w.title},escH(w.title));
    b.onclick=function(){if(on){w.el.classList.add('min');w.el.classList.remove('active');renderTasks()}else focusWin(id)};t.appendChild(b)});
}
