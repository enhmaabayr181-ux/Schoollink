(() => {
  const style=document.createElement('style');
  style.textContent=`
  #shMobileMenu{display:none}
  #shMobileActionsPanel{display:contents}
  @media(max-width:900px){
    #shMobileMenu{display:grid!important;place-items:center;width:42px;height:42px;min-width:42px;border:1px solid var(--line);background:#fff;color:#5d4bd3;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer;order:0}
    .sh-modern .top>div:last-child{justify-content:flex-end!important}
    .sh-modern .top>div:last-child>.rolebar{order:10!important}
    #shMobileActionsPanel{display:none;position:absolute;right:2px;top:54px;z-index:11020;padding:8px;background:rgba(255,255,255,.98);border:1px solid var(--line);border-radius:18px;box-shadow:0 16px 40px rgba(37,25,90,.18);gap:7px;align-items:center}
    .sh-actions-open #shMobileActionsPanel{display:flex!important}
    #shMobileActionsPanel>#shPrintOpen,#shMobileActionsPanel>#shHelpOpen,#shMobileActionsPanel>#shSearchOpen,#shMobileActionsPanel>.logout{position:static!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;width:42px!important;height:42px!important;min-width:42px!important;margin:0!important;padding:0!important;font-size:0!important;border:1px solid var(--line)!important;border-radius:13px!important;background:#fff!important;color:#5d4bd3!important;cursor:pointer!important}
    #shMobileActionsPanel>#shPrintOpen:after{content:"⇩";font-size:20px}
    #shMobileActionsPanel>#shSearchOpen:after{content:"⌕";font-size:21px}
    #shMobileActionsPanel>#shHelpOpen:after{content:"?";font-size:19px;font-weight:900}
    #shMobileActionsPanel>.logout:after{content:"↪";font-size:20px;font-weight:900}
  }`;
  document.head.appendChild(style);

  function install(){
    const actions=document.querySelector('.top>div:last-child');if(!actions)return;
    let menu=document.getElementById('shMobileMenu');
    if(!menu){
      menu=document.createElement('button');menu.id='shMobileMenu';menu.type='button';menu.setAttribute('aria-label','Нэмэлт үйлдэл');menu.textContent='⋯';
      menu.onclick=e=>{e.stopPropagation();actions.classList.toggle('sh-actions-open');menu.textContent=actions.classList.contains('sh-actions-open')?'×':'⋯'};
      actions.prepend(menu);
    }
    let panel=document.getElementById('shMobileActionsPanel');
    if(!panel){panel=document.createElement('div');panel.id='shMobileActionsPanel';panel.setAttribute('aria-label','Нэмэлт үйлдлүүд');menu.after(panel)}
    ['shPrintOpen','shSearchOpen','shHelpOpen'].forEach(id=>{const el=document.getElementById(id);if(el&&el.parentElement!==panel)panel.appendChild(el)});
    const logout=actions.querySelector(':scope>.logout');if(logout&&logout.parentElement!==panel)panel.appendChild(logout);
  }
  document.addEventListener('click',e=>{
    const actions=document.querySelector('.top>div:last-child');if(!actions?.classList.contains('sh-actions-open'))return;
    if(!document.getElementById('shMobileActionsPanel')?.contains(e.target)&&e.target.id!=='shMobileMenu'){
      actions.classList.remove('sh-actions-open');const b=document.getElementById('shMobileMenu');if(b)b.textContent='⋯'
    }
  });
  setTimeout(install,450);setInterval(install,1200);
})();