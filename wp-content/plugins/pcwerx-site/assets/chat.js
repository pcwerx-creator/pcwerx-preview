/* PC Werx chat (self-hosted). Server matches questions against the published FAQ; this file is UI only. */
(function(){
  var C=window.PCW_CHAT; if(!C||document.getElementById('pcw-chat')) return;
  var d=document, launch=d.getElementById('pcw-chat-launch'), log=[], session='';
  try{ session=sessionStorage.getItem('pcwChatS')||''; if(!/^[a-f0-9]{16}$/.test(session)){ var a=new Uint8Array(8); crypto.getRandomValues(a); session=Array.prototype.map.call(a,function(x){return ('0'+x.toString(16)).slice(-2);}).join(''); sessionStorage.setItem('pcwChatS',session);} }catch(e){ session=''; }
  var w=d.createElement('div'); w.id='pcw-chat'; w.className='pcw-chat'; w.setAttribute('role','dialog'); w.setAttribute('aria-modal','false'); w.setAttribute('aria-labelledby','pcw-chat-title');
  w.innerHTML='<div class="pcw-chat__head"><a class="pcw-chat__logo" href="'+C.home+'" aria-label="PC Werx home"><img src="'+C.logo+'" srcset="'+(C.logo2x||'')+'" alt="PC Werx" width="80" height="27"></a><div><b id="pcw-chat-title">PC Werx assistant</b><small>Mon–Fri 9–7 · Weekends by appointment</small></div>'+
   '<div class="pcw-chat__acts"><a href="tel:+19055729379" aria-label="Call 905-5PC-WERX (905-572-9379)"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6 6l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/></svg></a>'+
   '<a href="mailto:support@pcwerx.ca" aria-label="Email support@pcwerx.ca"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></a>'+
   '<button type="button" class="pcw-chat__x" aria-label="Close chat"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'+
   '<div class="pcw-chat__log" role="log" aria-live="polite" aria-relevant="additions"></div>'+
   '<p class="pcw-chat__note">Automated answers from the PC Werx FAQ. Questions are saved to improve answers. Urgent? Call <a href="tel:+19055729379">905-5PC-WERX</a>.</p>'+
   '<form class="pcw-chat__form"><label class="screen-reader-text" for="pcw-chat-in">Type your question</label><input id="pcw-chat-in" type="text" maxlength="300" autocomplete="off" placeholder="Ask about repairs, IT, hours…"><button type="submit">Ask</button></form>';
  d.body.appendChild(w);
  var body=w.querySelector('.pcw-chat__log'), input=w.querySelector('#pcw-chat-in');
  function esc(s){var x=d.createElement('div');x.textContent=s;return x.innerHTML;}
  function phones(h){return h.split(/(<a\b[^>]*>[\s\S]*?<\/a>|<[^>]+>)/gi).map(function(x,i){return i%2?x:x.replace(/905-5PC-WERX(?:\s*\(905[-\s.]572[-\s.]9379\))?|\(?905\)?[-\s.]572[-\s.]9379/g,function(n){return '<a href="tel:+19055729379">'+n+'</a>';});}).join('');}
  function say(html,who){if(who!=='me')html=phones(html);var m=d.createElement('div');m.className='pcw-msg pcw-msg--'+(who||'bot');m.innerHTML=html;body.appendChild(m);body.scrollTop=body.scrollHeight;var tx=(m.textContent||'').replace(/\s+/g,' ').trim();if(tx)log.push((who==='me'?'Visitor: ':'Assistant: ')+tx);return m;}
  function chips(list){var c=d.createElement('div');c.className='pcw-chips2';list.forEach(function(l){var b=d.createElement('button');b.type='button';b.textContent=l[0];b.addEventListener('click',l[1]);c.appendChild(b);});body.appendChild(c);body.scrollTop=body.scrollHeight;}
  function ask(text){say(esc(text),'me');var t=say('<span class="pcw-typing" aria-label="Looking that up"><i></i><i></i><i></i></span>');
    fetch(C.ask,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({question:text,session:session,page:location.pathname})})
    .then(function(r){return r.json();}).then(function(j){t.remove();
      if(j.answered){say('<span class="pcw-msg__q">'+esc(j.q)+'</span>'+j.html+(j.url?'<a class="pcw-msg__more" href="'+j.url+'">Open in FAQ →</a>':''));var more=(j.related||[]).map(function(q){return [q,function(){ask(q);}];});more.push(['Talk to a technician',leadForm]);chips(more);}
      else{say(j.html);var s=(j.suggest||[]).map(function(q){return ['Did you mean: '+q,function(){ask(q);}];});s.unshift(['Leave my details',leadForm]);s.push(['Call 905-5PC-WERX',function(){location.href='tel:+19055729379';}]);chips(s);}
    }).catch(function(){t.remove();say('Sorry, I couldn’t look that up. Please call <a href="tel:+19055729379">905-5PC-WERX (905-572-9379)</a>.');});}
  function leadForm(){var ex=body.querySelector('.pcw-lead2');if(ex){ex.querySelector('input').focus();return;}
    say('Leave your details and a PC Werx technician will get back to you. Remote support within 1 hour, onsite the same day.');
    var last='';for(var i=log.length-1;i>=0;i--){if(log[i].indexOf('Visitor: ')===0){last=log[i].slice(9);break;}}
    var f=d.createElement('form');f.className='pcw-msg pcw-msg--bot pcw-lead2';f.noValidate=true;var id='pl'+Date.now();
    f.innerHTML='<label for="'+id+'n">Name</label><input id="'+id+'n" name="name" autocomplete="name" required><label for="'+id+'e">Email</label><input id="'+id+'e" name="email" type="email" autocomplete="email" required><label for="'+id+'p">Phone</label><input id="'+id+'p" name="phone" type="tel" autocomplete="tel" required><label for="'+id+'q">Your question</label><textarea id="'+id+'q" name="question" required>'+esc(last)+'</textarea><span class="hp"><label for="'+id+'w">Leave empty</label><input id="'+id+'w" name="website" tabindex="-1" autocomplete="off"></span><div class="err" role="alert"></div><button type="submit">Send to PC Werx</button>';
    body.appendChild(f);body.scrollTop=body.scrollHeight;f.querySelector('input').focus();
    f.addEventListener('submit',function(e){e.preventDefault();var v={};['name','email','phone','question','website'].forEach(function(k){v[k]=f.elements[k].value.trim();});var err=f.querySelector('.err');
      if(!v.name||!/^\S+@\S+\.\S+$/.test(v.email)||v.phone.replace(/\D/g,'').length<10||!v.question){err.textContent='Please add your name, a valid email, a 10-digit phone number and your question.';return;}
      v.page=location.href;v.session=session;v.transcript=log.join('\n').slice(-3000);var b=f.querySelector('button');b.disabled=true;b.textContent='Sending…';
      fetch(C.lead,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(v)}).then(function(r){return r.json().then(function(j){return {ok:r.ok&&j.ok,j:j};});})
      .then(function(r){if(r.ok){f.remove();say('Thanks, '+esc(v.name)+'. We got your question and a PC Werx technician will get back to you at '+esc(v.email)+'.');}else{b.disabled=false;b.textContent='Send to PC Werx';err.textContent=(r.j&&r.j.error)||'Sorry, that did not send. Please call 905-5PC-WERX (905-572-9379).';}})
      .catch(function(){b.disabled=false;b.textContent='Send to PC Werx';err.textContent='Sorry, that did not send. Please call 905-5PC-WERX (905-572-9379).';});});}
  var started=false;
  function open(){w.classList.add('is-open');launch&&launch.setAttribute('aria-expanded','true');
    if(!started){started=true;say('Hi! I’m the PC Werx assistant. Ask me about computer repair, business IT, visits and hours, or pass your question to a technician.');chips((C.starters||[]).map(function(q){return [q,function(){ask(q);}];}).concat([['Talk to a technician',leadForm]]));}
    setTimeout(function(){input.focus();},30);}
  function close(){w.classList.remove('is-open');if(launch){launch.setAttribute('aria-expanded','false');launch.focus();}}
  w.querySelector('.pcw-chat__x').addEventListener('click',close);
  w.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  w.querySelector('.pcw-chat__form').addEventListener('submit',function(e){e.preventDefault();var t=input.value.trim();if(!t)return;input.value='';ask(t);});
  window.PCW_CHAT_API={open:open,close:close,ask:function(q){open();ask(q);},lead:function(){open();leadForm();}};
})();
