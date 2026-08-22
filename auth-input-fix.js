// SchoolHub mobile Safari auth input fix.
// Keep native input behavior intact: no synthetic touch/click focus handlers.
(function(){
  const ids=['email','password','authFullName','authInviteCode','joinFullName','joinInviteCode'];

  function unlock(){
    for(const id of ids){
      const el=document.getElementById(id);
      if(!el)continue;
      el.disabled=false;
      el.readOnly=false;
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
      el.removeAttribute('inert');
      el.style.pointerEvents='auto';
      el.style.touchAction='auto';
      el.style.webkitUserSelect='text';
      el.style.userSelect='text';
      el.style.position='relative';
      el.style.zIndex='20';
      el.style.opacity='1';
    }

    const auth=document.getElementById('authWrap');
    const overlay=document.getElementById('shLaunchOverlay');
    if(auth && !auth.classList.contains('hidden') && overlay){
      overlay.classList.add('hidden');
    }
  }

  if(!document.getElementById('shAuthInputFixStyle')){
    const style=document.createElement('style');
    style.id='shAuthInputFixStyle';
    style.textContent=`
      #authWrap,#joinWrap{pointer-events:auto!important;position:relative!important;z-index:1!important}
      #authWrap .authCard,#joinWrap .joinCard{position:relative!important;z-index:2!important;pointer-events:auto!important}
      #email,#password,#authFullName,#authInviteCode,#joinFullName,#joinInviteCode{
        pointer-events:auto!important;
        touch-action:auto!important;
        -webkit-user-select:text!important;
        user-select:text!important;
        position:relative!important;
        z-index:20!important;
        opacity:1!important;
        font-size:16px!important;
        -webkit-text-fill-color:#171821!important;
        caret-color:#171821!important;
      }
    `;
    document.head.appendChild(style);
  }

  unlock();
  window.addEventListener('pageshow',unlock);
  window.addEventListener('focus',unlock);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)unlock()});
  setTimeout(unlock,100);
  setTimeout(unlock,500);
  setTimeout(unlock,1500);
})();
