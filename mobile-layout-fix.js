(() => {
  const style=document.createElement('style');
  style.id='shMobileEmergencyFix';
  style.textContent=`
  @media(max-width:900px){
    body.sh-modern{padding-bottom:112px!important}
    .sh-modern .app{padding:12px 12px 0!important;overflow:visible!important}
    .sh-modern .main{overflow:visible!important;min-width:0!important}
    .sh-modern .top{display:flex!important;flex-direction:column!important;gap:10px!important;position:relative!important;padding:4px 2px 14px!important;min-height:0!important}
    .sh-modern .sh-mobile-brand{order:1;min-height:44px;padding-right:190px}
    .sh-modern .top>div:not(.sh-mobile-brand):not(:last-child){order:3;width:100%!important;padding:0!important}
    .sh-modern .top>div:last-child{order:2;position:static!important;inset:auto!important;width:100%!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;margin:0!important}
    .sh-modern .top h2{margin:4px 0 0!important;padding:0!important;font-size:26px!important;line-height:1.12!important}
    .sh-modern .top>div:not(.sh-mobile-brand):not(:last-child) .muted{max-width:100%!important;margin-top:5px!important}
    .sh-modern .rolebar{order:5!important;flex:1 0 100%!important;width:100%!important;max-width:none!important;display:flex!important;overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap!important;padding:4px!important;scrollbar-width:none!important}
    .sh-modern .rolebar::-webkit-scrollbar{display:none}
    .sh-modern .rolebar button{flex:0 0 auto!important;min-height:38px!important;padding:8px 12px!important;font-size:11px!important;pointer-events:auto!important}
    .sh-modern #shPrintOpen,.sh-modern #shHelpOpen,.sh-modern #shSearchOpen,.sh-modern .logout{order:1!important;position:static!important;display:grid!important;place-items:center!important;flex:0 0 42px!important;width:42px!important;height:42px!important;min-width:42px!important;margin:0!important;z-index:auto!important;pointer-events:auto!important}
    .sh-modern .grid{position:relative!important;z-index:1!important}
    .sh-modern .side{display:block!important;position:fixed!important;left:10px!important;right:10px!important;bottom:max(10px,env(safe-area-inset-bottom))!important;top:auto!important;height:76px!important;z-index:10000!important;overflow:hidden!important;pointer-events:auto!important}
    .sh-modern .nav{display:flex!important;height:62px!important;overflow-x:auto!important;overflow-y:hidden!important;touch-action:pan-x!important;pointer-events:auto!important;-webkit-overflow-scrolling:touch!important}
    .sh-modern .nav button{position:relative!important;z-index:2!important;flex:0 0 82px!important;min-width:82px!important;height:60px!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
    #shAiButton{right:14px!important;bottom:102px!important;z-index:9000!important;max-width:150px!important}
    #shAiPanel{right:12px!important;bottom:158px!important;z-index:11000!important;height:min(500px,calc(100vh - 190px))!important}
  }
  @media(max-width:430px){
    .sh-modern .sh-mobile-brand{padding-right:145px!important;font-size:20px!important}
    .sh-modern .top h2{font-size:24px!important}
    .sh-modern #shPrintOpen,.sh-modern #shHelpOpen,.sh-modern #shSearchOpen,.sh-modern .logout{flex-basis:40px!important;width:40px!important;height:40px!important;min-width:40px!important}
    .sh-modern .sh-main-hero{padding:21px 38% 22px 18px!important}
    .sh-modern .sh-main-hero h3{font-size:27px!important}
  }`;
  document.head.appendChild(style);
  function repair(){
    const nav=document.getElementById('nav');
    if(nav){nav.style.pointerEvents='auto';[...nav.querySelectorAll('button')].forEach(b=>{b.style.pointerEvents='auto';b.disabled=false})}
    const side=document.querySelector('.side');if(side)side.style.pointerEvents='auto';
  }
  document.addEventListener('touchstart',e=>{const b=e.target.closest('#nav button');if(b)b.style.pointerEvents='auto'},{passive:true});
  setInterval(repair,2000);setTimeout(repair,300);
})();