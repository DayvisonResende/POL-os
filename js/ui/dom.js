/* Atalhos de DOM. */
var $=function(s,el){return (el||document).querySelector(s)};
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e}
