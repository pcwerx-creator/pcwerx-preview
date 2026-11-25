/* Hybrid home hero: 8089 pinned camera zoom, then a damped handoff (PC shrinks into the chip)
   into the Option C network scene. No libraries. Skipped under prefers-reduced-motion. */
(function(){
  var d=document,root=d.documentElement,w=window;
  var hero=d.querySelector('.pcw-home-dark .pcw-hero'); if(!hero){root.classList.remove('pcw-reveal-pending');return;}
  if(w.matchMedia('(prefers-reduced-motion: reduce)').matches){root.classList.remove('pcw-reveal-pending');return;}
  /* 1) H1 word-by-word reveal. Text nodes stay in the h1 (same words, same order). */
  var h1=hero.querySelector('h1');
  if(h1&&!h1.querySelector('.pcw-w')){
    var n=0;
    (function wrap(el){ Array.prototype.slice.call(el.childNodes).forEach(function(c){
      if(c.nodeType===1){wrap(c);return;} if(c.nodeType!==3)return; var frag=d.createDocumentFragment();
      c.data.split(/(\s+)/).forEach(function(p){ if(!p)return; if(/^\s+$/.test(p)){frag.appendChild(d.createTextNode(p));return;}
        var s=d.createElement('span'); s.className='pcw-w'; s.style.setProperty('--i',n++); s.textContent=p; frag.appendChild(s); });
      el.replaceChild(frag,c); }); })(h1);
  }
  requestAnimationFrame(function(){ root.classList.add('pcw-reveal-go'); root.classList.remove('pcw-reveal-pending'); });
  /* 2) soft brand-blue glow + beam behind the PC; follows the pointer on desktop, static on touch */
  var stage=hero.querySelector('.is-zoom .pcw-glass')||hero.querySelector('.pcw-hero__stage');
  if(stage){ var b=d.createElement('span'); b.className='pcw-beam'; b.setAttribute('aria-hidden','true'); stage.insertBefore(b,stage.firstChild);
    if(w.matchMedia('(hover: hover) and (pointer: fine)').matches){
      var tx=0,ty=0,cx=0,cy=0,raf=0;
      function step(){ cx+=(tx-cx)*.08; cy+=(ty-cy)*.08; hero.style.setProperty('--mx',cx.toFixed(3)); hero.style.setProperty('--my',cy.toFixed(3));
        raf=(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)?requestAnimationFrame(step):0; }
      hero.addEventListener('pointermove',function(e){ var r=hero.getBoundingClientRect(); tx=(e.clientX-r.left)/r.width-.5; ty=(e.clientY-r.top)/Math.min(r.height,w.innerHeight)-.5; if(!raf)raf=requestAnimationFrame(step); },{passive:true});
      hero.addEventListener('pointerleave',function(){ tx=0;ty=0; if(!raf)raf=requestAnimationFrame(step); });
    } }
  /* 4) pinned camera zoom, then handoff into the network scene. Scroll only sets a target; one rAF loop eases toward it. */
  var Z=hero.classList.contains('is-zoom')&&hero.querySelector('.pcw-float');
  if(Z){ (function(){
    var fl=Z, inner=hero.querySelector('.pcw-hero__inner'), st=hero.querySelector('.pcw-hero__stage'), copy=hero.querySelector('.pcw-hero__copy'),
        nx=hero.querySelector('.pcw-hero__next'), net=hero.querySelector('.pcw-hero__net'), crop=hero.querySelector('.pcw-zoomcrop'), orb=hero.querySelector('.pcw-orbit'),
        layer=hero.querySelector('.hybrid-net'), cos=hero.querySelector('.pcw-callouts'), cps=[];
    /* callouts live outside the scaled figure (Nov 25, Danny t133u): inside it they were rasterised at 1x and stretched, so they blurred at full zoom.
       Each label point is mapped through the same zoom transform here and moved with a whole-pixel translate3d, so the text always renders at 1x. */
    if(cos&&st){ cos.classList.add('is-free'); st.appendChild(cos);
      cps=Array.prototype.map.call(cos.querySelectorAll('.pcw-callout'),function(e){ return {e:e,x:parseFloat(e.style.left)/100,y:parseFloat(e.style.top)/100}; }); }
    var g={}, tgt=0, cur=-1, raf=0, last=0, zoomed=false, mob=false, phase='zoom';
    /* fractions of the pin: zoom, short hold, shrink-into-chip, network hold */
    var Z1=0.42, H0=0.50, H1=0.72;
    function cl(v){return v<0?0:v>1?1:v;}
    function ease(v){return v*v*(3-2*v);}
    function measure(){
      mob=w.matchMedia('(max-width: 899px)').matches;
      var keep=fl.style.transform; fl.style.transform='none'; if(orb)orb.style.transform='';
      var sr=st.getBoundingClientRect(), fr=fl.getBoundingClientRect(), ir=inner.getBoundingClientRect(), hdr=parseFloat(getComputedStyle(root).getPropertyValue('--hdr'))||76;
      var px=fr.left-sr.left+.44*fr.width, py=fr.top-sr.top+.49*fr.height;
      g.pinStart=ir.top+w.scrollY-hdr; g.range=Math.max(1,ir.height-sr.height);
      g.S=mob?1.6:Math.min(2.3,Math.max(1.5,.82*sr.height/(.44*fr.height)));
      g.dx=(mob?.36:.62)*sr.width-px; g.dy=(mob?.33:.5)*sr.height-py;
      g.zEnd=mob?.62:.78; g.fx=fr.left-sr.left; g.fy=fr.top-sr.top; g.fw=fr.width; g.fh=fr.height; g.ox=g.fx+.44*fr.width; g.oy=g.fy+.49*fr.height; fl.style.transform=keep; }
    function zoomE(t){ return ease(cl(t/Z1)); }
    function handE(t){ return ease(cl((t-H0)/(H1-H0))); }
    function apply(t){
      var ze=zoomE(t), h=handE(t), e=ze;
      /* zoom transform, then shrink toward the chip as the handoff runs */
      var s=1+(g.S-1)*e, sx=g.dx*e, sy=g.dy*e, ry=-6*(1-e);
      if(h>0){
        var chipX=mob?0:g.dx*0.22, chipY=mob?g.dy*0.15:0;
        var k=ease(h);
        sx=sx+(chipX-sx)*k; sy=sy+(chipY-sy)*k;
        s=s+(0.16-s)*k; ry=ry+(0-ry)*k;
      }
      fl.style.transform='translate3d('+sx.toFixed(2)+'px,'+sy.toFixed(2)+'px,0) perspective(1600px) rotateY('+ry.toFixed(3)+'deg) scale('+s.toFixed(4)+')';
      fl.style.setProperty('--is',(1/s).toFixed(4));
      fl.style.setProperty('--co',(cl((e-.66)/.34)*(1-h)).toFixed(3));
      if(cps.length){ cos.style.setProperty('--co',(cl((e-.66)/.34)*(1-h)).toFixed(3));
        for(var ci=0;ci<cps.length;ci++){ var c=cps[ci], X=g.ox+sx+(g.fx+c.x*g.fw-g.ox)*s, Y=g.oy+sy+(g.fy+c.y*g.fh-g.oy)*s;
          c.e.style.transform='translate3d('+Math.round(X)+'px,'+Math.round(Y)+'px,0)'; } }
      fl.style.opacity=(1-cl((h-.08)/.7)).toFixed(3);
      if(crop)crop.style.opacity=(cl((e-.1)/.3)*(1-h)).toFixed(3);
      if(orb){
        orb.style.transform='translate(-50%,-50%) translate3d('+sx.toFixed(1)+'px,'+sy.toFixed(1)+'px,0) scale('+(.92+.26*e-0.5*h).toFixed(3)+')';
        orb.style.opacity=((.5+.5*e)*(1-h)).toFixed(3);
      }
      var co=1-cl(e/(mob?.45:.36));
      copy.style.opacity=co.toFixed(3);
      copy.style.transform=mob?'':'translate3d(0,'+(-36*(1-co)).toFixed(1)+'px,0)';
      if(nx){
        var no=cl((e-(mob?.5:.46))/.26)*(1-cl(h/.18));
        nx.style.opacity=no.toFixed(3);
        nx.style.transform='translate3d('+(-40*(1-no)).toFixed(1)+'px,0,0)';
      }
      if(net){
        var np=cl((h-.32)/.40);
        net.style.opacity=np.toFixed(3);
        net.style.transform=mob?'':'translate3d('+(-36*(1-np)).toFixed(1)+'px,0,0)';
      }
      if(layer){ var lo=cl((h-.02)/.45); layer.style.opacity=lo.toFixed(3); w.__pcwNetHold=lo<=0; } /* 3D renders nothing while its layer is invisible (WWL-18) */
      /* 3D camera progress: 0 while the chip is appearing, then a gentle dolly through the network hold */
      var netP=t<H1?0:cl((t-H1)/(1-H1))*0.55;
      w.__hybridNetP=netP;
      var z=e>.5&&h<.85, p=h>.08?(h>.92?'network':'handoff'):'zoom';
      if(z!==zoomed){zoomed=z; hero.classList.toggle('is-zoomed',z);}
      if(p!==phase){phase=p; hero.classList.toggle('is-handoff',p==='handoff'); hero.classList.toggle('is-network',p==='network');}
    }
    function loop(now){
      var dt=last?Math.min(64,now-last):16.7; last=now; var k=1-Math.pow(1-.1,dt/16.7);
      cur=cur<0?tgt:cur+(tgt-cur)*k;
      if(Math.abs(tgt-cur)<.0004){cur=tgt; apply(cur); raf=0; last=0; fl.style.willChange='auto'; return;}
      apply(cur); raf=requestAnimationFrame(loop); }
    function onScroll(){ tgt=cl((w.scrollY-g.pinStart)/g.range); if(!raf){fl.style.willChange='transform'; raf=requestAnimationFrame(loop);} }
    /* iOS fires resize as the address bar slides; the pin geometry uses svh/vh so only a width change needs a re-measure (WWL-18) */
    var lastW=w.innerWidth; function re(e){ if(e&&e.type==='resize'&&w.innerWidth===lastW)return; lastW=w.innerWidth; measure(); cur=-1; onScroll(); }
    measure(); tgt=cl((w.scrollY-g.pinStart)/g.range); cur=tgt; apply(cur);
    addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',re,{passive:true});
    addEventListener('load',re); if(d.fonts&&d.fonts.ready)d.fonts.ready.then(re);
    /* sharp interior close-up: fetched on the first scroll/touch/key, or 3 s after load, never before the LCP image */
    var img=crop&&crop.querySelector('img'), done=false;
    function go(){ if(done||!img)return; done=true; var p=img.parentNode; Array.prototype.forEach.call(p.querySelectorAll('source[data-srcset]'),function(s){s.srcset=s.getAttribute('data-srcset');});
      img.srcset=img.getAttribute('data-srcset'); if(img.decode)img.decode().catch(function(){}); /* decode before the zoom reveals it, not mid-scroll */ ['scroll','pointerdown','touchstart','keydown'].forEach(function(e){removeEventListener(e,go);}); }
    ['scroll','pointerdown','touchstart','keydown'].forEach(function(e){addEventListener(e,go,{passive:true});});
    if(d.readyState==='complete')setTimeout(go,3000); else addEventListener('load',function(){setTimeout(go,3000);});
    /* capture hooks */
    w.__hybrid={
      ready:Promise.resolve(),
      progress:function(){return cur<0?tgt:cur;},
      settle:function(){ cur=tgt=cl((w.scrollY-g.pinStart)/g.range); apply(cur); },
      step:function(){ /* damping already applied via settle in capture */ },
      scrollT:function(t){ var y=g.pinStart+cl(t)*g.range; w.scrollTo(0,y); tgt=cl(t); cur=tgt; apply(cur); }
    };
  })(); }
  /* 3) film grain: one 128px noise tile drawn once on a canvas, shifted with a stepped CSS animation */
  var sticky=hero.querySelector('.is-zoom .pcw-hero__stage')||hero.querySelector('.pcw-hero__sticky')||hero;
  try{ var c=d.createElement('canvas'); c.width=c.height=128; var x=c.getContext('2d'), im=x.createImageData(128,128), a=im.data;
    for(var i=0;i<a.length;i+=4){ var v=Math.random()*255|0; a[i]=a[i+1]=a[i+2]=v; a[i+3]=255; } x.putImageData(im,0,0);
    var g=d.createElement('span'); g.className='pcw-grain'; g.setAttribute('aria-hidden','true'); g.style.backgroundImage='url('+c.toDataURL('image/png')+')'; sticky.appendChild(g);
  }catch(e){}
})();
