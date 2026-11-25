/* PC Werx hero CTA v2: measure the two morph labels so the width animates to fit,
   reserve the widest size in the slot (neighbours never move), and tuck the chat
   launcher on phones while the hero buttons are on screen. No libraries. */
(function(){
  var d=document,w=window;
  function measure(){
    d.querySelectorAll('.pcw-morph').forEach(function(m){
      var a=m.querySelector('.pcw-morph__a'),b=m.querySelector('.pcw-morph__b');
      m.classList.remove('is-measured'); var wa=Math.ceil(a.getBoundingClientRect().width),wb=b?Math.ceil(b.getBoundingClientRect().width):wa;
      m.style.setProperty('--wa',wa+'px'); m.style.setProperty('--wb',wb+'px'); m.classList.add('is-measured');
      var slot=m.closest('.pcw-cta-slot'),btn=m.closest('a');
      if(slot&&btn){ slot.style.minWidth=''; var rest=btn.getBoundingClientRect().width; slot.style.minWidth=Math.ceil(rest+Math.max(0,wb-wa))+'px'; }
    });
  }
  /* re-measure when web fonts swap in (labels get wider) and on resize */
  var t; function later(){clearTimeout(t);t=setTimeout(measure,120);}
  measure(); w.addEventListener('load',measure); w.addEventListener('resize',later);
  if(d.fonts){ if(d.fonts.ready) d.fonts.ready.then(measure); if(d.fonts.addEventListener) d.fonts.addEventListener('loadingdone',later); }
  /* chat launcher: hide on small screens while the hero action buttons are visible */
  var acts=d.querySelector('.pcw-hero .pcw-actions'), mq=w.matchMedia('(max-width: 699px)');
  if(acts&&'IntersectionObserver' in w){
    new IntersectionObserver(function(es){ var on=es[0].isIntersecting; d.documentElement.classList.toggle('pcw-chat-tuck',on&&mq.matches); },{threshold:0}).observe(acts);
  }
})();
