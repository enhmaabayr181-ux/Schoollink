// SchoolHub auth input interaction hardening for mobile Safari/iOS.
(function(){
  const ids=['email','password','authFullName','authInviteCode','joinFullName','joinInviteCode'];
  function unlock(){
    for(const id of ids){
      const el=document.getElementById(id);if(!el)continue;
      el.disabled=false;
      el.readOnly=false;
      el.removeAttribute('inert');
      el.style.pointerEvents='auto';
      el.style.touchAction='manipulation';
      el.style.webkitUserSelect='text';
      el.style.userSelect='text';
      el.style.position='relative';
      el.style.zIndex='5';
    }
    const auth=document.getElementById('authWrap');
    const overlay=document.getElementById('shLaunchOverlay');
    const status=(document.getElementById('authStatus')?.textContent||'');
    const busy=/Нэвтэрч байна|Бүртгэл үүсгэж байна|эрхийг шалгаж байна/i.test(status);
    if(auth&&!auth.classList.contains('hidden')&&overlay&&!busy){
      overlay.classList.add('hidden');
      if(typeof window.shLaunchBusyCount==='number')window.shLaunchBusyCount=0;
    }
  }
  function focusInput(e){
    const el=e.currentTarget;
    if(el.disabled||el.readOnly){el.disabled=false;el.readOnly=false}
    try{el.focus({preventScroll:true})}catch{el.focus()}
  }
  function bind(){
    unlock();
    for(const id of ids){
      const el=document.getElementById(id);if(!el||el.dataset.shAuthFixed==='1')continue;
      el.dataset.shAuthFixed='1';
      el.addEventListener('touchend',focusInput,{passive:true});
      el.addEventListener('click',focusInput);
    }
  }
  const style=document.createElement('style');
  style.id='shAuthInputFixStyle';
  style.textContent=`
    #authWrap,#joinWrap{pointer-events:auto!important}
    #authWrap .authCard,#joinWrap .joinCard{position:relative;z-index:2;pointer-events:auto!important}
    #email,#password,#authFullName,#authInviteCode,#joinFullName,#joinInviteCode{
      pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:text!important;user-select:text!important;
      position:relative!important;z-index:5!important;opacity:1!important;-webkit-text-fill-color:currentColor!important;
    }
    #email:disabled,#password:disabled{opacity:1!important}
  `;
  if(!document.getElementById(style.id))document.head.appendChild(style);
  bind();
  window.addEventListener('pageshow',bind);
  window.addEventListener('focus',bind);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)bind()});
  new MutationObserver(()=>bind()).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','readonly','inert']});
  setInterval(unlock,1200);
})();