(() => {
  const style=document.createElement('style');
  style.textContent='#shSearchOpen{border:1px solid var(--line);background:#fff;color:#4b4178;border-radius:14px;padding:10px 13px;cursor:pointer;font-weight:800}.shSearchModal{position:fixed;inset:0;z-index:12000;background:rgba(24,18,55,.35);backdrop-filter:blur(6px);display:grid;place-items:start center;padding-top:min(15vh,120px)}.shSearchModal.hidden{display:none}.shSearchCard{width:min(560px,calc(100vw - 24px));background:#fff;border-radius:24px;box-shadow:0 24px 80px rgba(30,20,75,.28);overflow:hidden}.shSearchInput{display:flex;gap:10px;padding:14px;border-bottom:1px solid var(--line)}.shSearchInput input{margin:0;border:0;background:#f7f5ff;font-size:16px}.shSearchClose{border:0;background:transparent;font-size:24px;cursor:pointer;color:#655b87}.shSearchResults{max-height:min(55vh,480px);overflow:auto;padding:9px}.shSearchResult{width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;border:0;background:#fff;border-radius:15px;padding:12px;text-align:left;cursor:pointer;color:inherit}.shSearchResult:hover,.shSearchResult.active{background:#f3efff}.shSearchResult b{display:block}.shSearchResult span{font-size:12px;color:var(--muted)}.shSearchEmpty{padding:28px;text-align:center;color:var(--muted)}@media(max-width:700px){#shSearchOpen{width:42px;height:42px;padding:0;font-size:0}#shSearchOpen:after{content:"⌕";font-size:22px}.shSearchModal{padding-top:70px}}';
  document.head.appendChild(style);
  const open=document.createElement('button');open.id='shSearchOpen';open.type='button';open.textContent='⌕ Хайх';
  const modal=document.createElement('div');modal.id='shSearchModal';modal.className='shSearchModal hidden';
  modal.innerHTML='<div class="shSearchCard"><div class="shSearchInput"><input id="shSearchQuery" autocomplete="off" placeholder="Хэсэг хайх…"><button class="shSearchClose" type="button">×</button></div><div id="shSearchResults" class="shSearchResults"></div></div>';
  document.body.appendChild(modal);
  function install(){const top=document.querySelector('.top > div:last-child');if(top&&!document.getElementById('shSearchOpen'))top.prepend(open)}
  function items(){
    const nav=[...document.querySelectorAll('#nav button')].map(b=>({label:b.dataset.shLabel||b.querySelector('.sh-nav-label')?.textContent?.trim()||b.textContent.trim(),button:b}));
    const extras=[['AI туслах',()=>document.getElementById('shAiButton')?.click()],['Мэдэгдэл',()=>document.querySelector('.shBell,.notificationBell')?.click()]];
    return [...nav.map(x=>({label:x.label,group:'Цэс',run:()=>x.button.click()})),...extras.map(x=>({label:x[0],group:'Хурдан үйлдэл',run:x[1]}))];
  }
  function draw(){
    const q=document.getElementById('shSearchQuery').value.trim().toLocaleLowerCase('mn'),all=items(),found=q?all.filter(x=>x.label.toLocaleLowerCase('mn').includes(q)):all;
    const out=document.getElementById('shSearchResults');
    out.innerHTML=found.length?found.map((x,i)=>'<button type="button" class="shSearchResult '+(i===0?'active':'')+'" data-i="'+i+'"><div><b>'+x.label+'</b><span>'+x.group+'</span></div><b>→</b></button>').join(''):'<div class="shSearchEmpty">Илэрц олдсонгүй.</div>';
    [...out.querySelectorAll('[data-i]')].forEach(b=>b.onclick=()=>{found[Number(b.dataset.i)]?.run();close()});
  }
  function show(){modal.classList.remove('hidden');const q=document.getElementById('shSearchQuery');q.value='';draw();setTimeout(()=>q.focus(),30)}
  function close(){modal.classList.add('hidden')}
  open.onclick=show;modal.querySelector('.shSearchClose').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
  modal.querySelector('input').oninput=draw;modal.querySelector('input').onkeydown=e=>{if(e.key==='Enter')modal.querySelector('.shSearchResult')?.click();if(e.key==='Escape')close()};
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea/i.test(e.target.tagName)){e.preventDefault();show()}if(e.key==='Escape')close()});
  new MutationObserver(install).observe(document.getElementById('app'),{attributes:true,attributeFilter:['class']});
  setInterval(install,2000);setTimeout(install,500);
})();