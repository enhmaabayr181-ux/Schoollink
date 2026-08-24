(() => {
  const style=document.createElement('style');
  style.textContent=`
  #shMobileMenu{display:none}
  @media(max-width:900px){
    #shMobileMenu{display:grid!important;place-items:center;width:42px;height:42px;min-width:42px;border:1px solid var(--line);background:#fff;color:#5d4bd3;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer;order:0}
    .sh-modern .top>div:last-child:not(.sh-actions-open)>#shPrintOpen,
    .sh-modern .top>div:last-child:not(.sh-actions-open)>#shHelpOpen,
    .sh-modern .top>div:last-child:not(.sh-actions-open)>#shSearchOpen,
    .sh-modern .top>div:last-child:not(.sh-actions-open)>.logout{display:none!important}
    .sh-modern .top>div:last-child{justify-content:flex-end!important}
    .sh-modern .top>div:last-child>.rolebar{order:10!important}
    .sh-modern .top>div:last-child.sh-actions-open>#shPrintOpen,
    .sh-modern .top>div:last-child.sh-actions-open>#shHelpOpen,
    .sh-modern .top>div:last-child.sh-actions-open>#shSearchOpen,
    .sh-modern .top>div:last-child.sh-actions-open>.logout{display:grid!important}
  }`;
  document.head.appendChild(style);
  function install(){
    const actions=document.querySelector('.top>div:last-child');if(!actions||document.getElementById('shMobileMenu'))return;
    const b=document.createElement('button');b.id='shMobileMenu';b.type='button';b.setAttribute('aria-label','Нэмэлт үйлдэл');b.textContent='⋯';
    b.onclick=e=>{e.stopPropagation();actions.classList.toggle('sh-actions-open');b.textContent=actions.classList.contains('sh-actions-open')?'×':'⋯'};
    actions.prepend(b);
  }
  document.addEventListener('click',e=>{
    const actions=document.querySelector('.top>div:last-child');if(!actions?.classList.contains('sh-actions-open'))return;
    if(!actions.contains(e.target)){actions.classList.remove('sh-actions-open');const b=document.getElementById('shMobileMenu');if(b)b.textContent='⋯'}
  });
  setTimeout(install,450);setInterval(install,2500);
})();