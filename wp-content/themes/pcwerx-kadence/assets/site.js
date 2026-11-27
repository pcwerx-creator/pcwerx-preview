/* PC Werx: nav toggle, hero motion (turntable / push-in), safe scroll reveal. No libraries. */
(function(){
  var d=document,root=d.documentElement,w=window; root.classList.add('pcw-js');
  var t=d.querySelector('.nav-toggle'),nav=d.getElementById('primary-nav');
  if(t&&nav){t.addEventListener('click',function(){var o=nav.classList.toggle('is-open');t.setAttribute('aria-expanded',o?'true':'false');});}
  /* Mobile drawer accordion (Danny t247u, Nov 25 2026): submenus start collapsed; tapping the parent row or its chevron toggles it,
     opening one closes the others. Desktop (>=1024px) hover dropdowns are untouched: the chevron button and the "All ..." item are mobile-only. */
  var mq=w.matchMedia?w.matchMedia('(max-width: 1023px)'):null, rm=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches, subs=[];
  function mobileNav(){return !!(mq&&mq.matches);}
  function setSub(it,open){var ul=it.ul; if(it.btn.getAttribute('aria-expanded')===(open?'true':'false'))return;
    it.btn.setAttribute('aria-expanded',open?'true':'false'); it.li.classList.toggle('is-sub-open',open);
    if(rm||!mobileNav()){ul.style.height=open?'auto':'';return;}
    var from=ul.getBoundingClientRect().height; ul.style.height=from+'px'; void ul.offsetHeight; ul.style.height=(open?ul.scrollHeight:0)+'px';}
  function closeAll(except){subs.forEach(function(it){if(it!==except)setSub(it,false);});}
  if(nav){Array.prototype.forEach.call(nav.querySelectorAll('.pcw-nav>li.menu-item-has-children'),function(li,i){
    var a=li.querySelector(':scope>a'), ul=li.querySelector(':scope>.sub-menu'); if(!a||!ul)return;
    var label=(a.textContent||'').trim(); if(!ul.id)ul.id='pcw-sub-'+(i+1);
    var href=a.getAttribute('href')||''; if(href&&href!=='#'&&!ul.querySelector('.pcw-sub-all')){var all=d.createElement('li'); all.className='menu-item pcw-sub-all';
      var al=d.createElement('a'); al.href=href; al.textContent='All '+label; if(li.classList.contains('current-menu-item'))al.setAttribute('aria-current','page'); all.appendChild(al); ul.insertBefore(all,ul.firstChild);}
    var btn=d.createElement('button'); btn.type='button'; btn.className='pcw-sub-toggle'; btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls',ul.id);
    btn.setAttribute('aria-label',label+' submenu'); btn.innerHTML='<span aria-hidden="true"></span>'; a.insertAdjacentElement('afterend',btn);
    var it={li:li,a:a,ul:ul,btn:btn}; subs.push(it);
    function toggle(e){ if(!mobileNav())return; e.preventDefault(); var open=btn.getAttribute('aria-expanded')!=='true'; if(open)closeAll(it); setSub(it,open); }
    btn.addEventListener('click',toggle); a.addEventListener('click',toggle);
    ul.addEventListener('transitionend',function(e){ if(e.target===ul&&e.propertyName==='height'&&btn.getAttribute('aria-expanded')==='true')ul.style.height='auto'; });
  });
  nav.classList.add('pcw-acc');
  if(t)t.addEventListener('click',function(){ if(!nav.classList.contains('is-open'))subs.forEach(function(it){setSub(it,false);it.ul.style.height='';}); });
  if(mq&&mq.addEventListener)mq.addEventListener('change',function(){subs.forEach(function(it){it.btn.setAttribute('aria-expanded','false');it.li.classList.remove('is-sub-open');it.ul.style.height='';});});
  }
  /* upload27 (Danny t386u-t392u): every collapsible starts closed, on first load and when a page comes back from the back/forward cache:
     FAQ accordions, the mobile drawer and its submenus, and desktop dropdowns (focus left inside a dropdown would keep it open via :focus-within).
     The current-page highlight inside a submenu is untouched and shows once the user opens it. */
  function resetCollapsibles(){
    Array.prototype.forEach.call(d.querySelectorAll('details[open]'),function(x){x.open=false;});
    if(nav){ nav.classList.remove('is-open'); if(t)t.setAttribute('aria-expanded','false');
      subs.forEach(function(it){it.btn.setAttribute('aria-expanded','false');it.li.classList.remove('is-sub-open');it.ul.style.height='';});
      var ae=d.activeElement; if(ae&&ae!==d.body&&nav.contains(ae)&&ae.blur)ae.blur(); }
  }
  resetCollapsibles(); w.addEventListener('pageshow',function(e){ if(e.persisted)resetCollapsibles(); });
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
  if(d.body.classList.contains('pcw-bizit')||obj.classList.contains('pcw-float--pick-contact')) return; /* Business IT and the contact picture stay still and flat (Danny, Nov 25; contact t209u) */ /* Business IT: pictures stay still and flat (Danny, Nov 25) */
  if(hero.getAttribute('data-motion')==='flat') return; /* upload21 (Danny t353u): straight, static still on the area/residential pages */
  var mode=hero.getAttribute('data-motion'), mobile=w.matchMedia('(max-width: 899px)').matches;
  var dark=d.body.classList.contains('pcw-home-dark')||d.body.classList.contains('pcw-home-light'), push=mode==='pushin'&&!mobile, lite=mode==='pushin'&&mobile&&dark, stage=hero.querySelector('.pcw-hero__stage');
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
