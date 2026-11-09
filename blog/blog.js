(function(){
  var $=function(s){return document.querySelector(s)};
  var header=$('#header'),burger=$('#burger'),menu=$('#menu');
  var y=$('#year'); if(y) y.textContent=new Date().getFullYear();
  function close(){menu.classList.remove('is-open');burger.setAttribute('aria-expanded','false');document.documentElement.style.overflow='';}
  if(burger&&menu){
    burger.addEventListener('click',function(){var o=!menu.classList.contains('is-open');menu.classList.toggle('is-open',o);burger.setAttribute('aria-expanded',o);document.documentElement.style.overflow=o?'hidden':'';});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});
    addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  }
  var btns=document.querySelectorAll('.bfilters button');
  btns.forEach(function(b){b.addEventListener('click',function(){
    btns.forEach(function(x){x.classList.remove('is-on');x.setAttribute('aria-pressed','false')});
    b.classList.add('is-on');b.setAttribute('aria-pressed','true');
    var f=b.getAttribute('data-filter');
    document.querySelectorAll('#bgrid .bcard').forEach(function(c){c.hidden=!(f==='Todos'||c.getAttribute('data-cat')===f)});
  })});
  var wa=$('.wa'); if(wa) wa.classList.add('is-on');
})();
