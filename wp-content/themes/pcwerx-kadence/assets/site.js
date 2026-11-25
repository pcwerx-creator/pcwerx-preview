/* PC Werx: nav toggle, hero motion (turntable / push-in), safe scroll reveal. No libraries. */
(function(){
  var d=document,root=d.documentElement,w=window; root.classList.add('pcw-js');
  var t=d.querySelector('.nav-toggle'),nav=d.getElementById('primary-nav');
  if(t&&nav){t.addEventListener('click',function(){var o=nav.classList.toggle('is-open');t.setAttribute('aria-expanded',o?'true':'false');});}
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in w)) return;
  /* reveal: only elements fully below the fold at load get hidden, so above-fold content never flashes */
  var vh=w.innerHeight, els=d.querySelectorAll('.pcw-svc,.pcw-cards-row .wp-block-kadence-column,.pcw-sec h2,.pcw-awards li,.pcw-faq__item,.pcw-cta');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});
  Array.prototype.forEach.call(els,function(el,i){ if(el.getBoundingClientRect().top>vh){ el.classList.add('pcw-rv-on'); el.style.transitionDelay=((i%4)*70)+'ms'; io.observe(el);} });
  /* hero */
  var hero=d.querySelector('[data-pcw-hero]'); if(!hero) return;
  if(hero.classList.contains('is-zoom')) return; /* dark home: pinned zoom lives in home-hero.js */
  var obj=hero.querySelector('.pcw-float'); if(!obj) return;
  if(d.body.classList.contains('pcw-bizit')) return; /* Business IT: pictures stay still and flat (Danny, Nov 25) */
  var mode=hero.getAttribute('data-motion'), mobile=w.matchMedia('(max-width: 899px)').matches;
  var dark=d.body.classList.contains('pcw-home-dark'), push=mode==='pushin'&&!mobile, lite=mode==='pushin'&&mobile&&dark, stage=hero.querySelector('.pcw-hero__stage');
  if(lite) hero.classList.add('is-lite');
  if(push){ hero.classList.add('is-pushin'); var hd=d.querySelector('.pcw-header'); if(hd) root.style.setProperty('--hdr',hd.offsetHeight+'px'); }
  var range=mode==='still'?10:(mobile?16:34), active=false, ticking=false;
  function frame(){ticking=false; var r=hero.getBoundingClientRect();
    if(push){ var span=r.height-(w.innerHeight-(parseInt(getComputedStyle(root).getPropertyValue('--hdr'))||78)); var p=Math.min(1,Math.max(0,-r.top/(span||1))); hero.style.setProperty('--p',p.toFixed(4)); return; }
    if(lite&&stage){ var sb=stage.getBoundingClientRect().bottom+w.scrollY; var lp=Math.min(1,Math.max(0,w.scrollY/(((sb-60)*.55)||1))); hero.style.setProperty('--p',lp.toFixed(4)); return; }
    var q=Math.min(1,Math.max(0,-r.top/(r.height||1)));
    obj.style.setProperty('--ry',(-range/2+range*q).toFixed(2)+'deg');
    obj.style.setProperty('--rx',((mobile?2:6)*(1-q)).toFixed(2)+'deg');
    obj.style.setProperty('--ty',(-40*q).toFixed(1)+'px');}
  function onScroll(){if(active&&!ticking){ticking=true;requestAnimationFrame(frame);}}
  new IntersectionObserver(function(es){active=es[0].isIntersecting; if(active) onScroll();}).observe(hero);
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll,{passive:true}); frame();
})();
