(() => {
  const style=document.createElement('style');
  style.textContent='#shPrintOpen{border:1px solid var(--line);background:#fff;color:#4b4178;border-radius:14px;padding:10px 13px;cursor:pointer;font-weight:800}@media(max-width:700px){#shPrintOpen{width:42px;height:42px;padding:0;font-size:0}#shPrintOpen:after{content:"⇩";font-size:20px}}@media print{body{background:#fff!important}.side,.top,.rolebar,#shAiButton,#shAiPanel,#shSearchModal,.shHelpModal,#shPrintOpen,#shSearchOpen,#shHelpOpen,.logout,.ghost,.btn,.shDailyNote button{display:none!important}.app{display:block!important}.main{padding:0!important;margin:0!important}.page{display:none!important}.page.active{display:block!important}.grid{display:block!important}.card,.shDaily,.shAlerts{break-inside:avoid;box-shadow:none!important;border:1px solid #ddd!important;margin-bottom:14px!important;background:#fff!important}.hero{color:#222!important;background:#fff!important}.hero *{color:#222!important}.shDailyNote{background:#f3f0ff!important;color:#222!important}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}';
  document.head.appendChild(style);
  const button=document.createElement('button');button.id='shPrintOpen';button.type='button';button.textContent='⇩ PDF';
  function install(){const top=document.querySelector('.top > div:last-child');if(top&&!document.getElementById('shPrintOpen'))top.prepend(button)}
  function print(){
    const old=document.title,heading=document.getElementById('title')?.textContent?.trim()||'SchoolHub';
    const date=new Date().toISOString().slice(0,10);document.title='SchoolHub - '+heading+' - '+date;
    window.print();setTimeout(()=>{document.title=old},500);
  }
  button.onclick=print;
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();print()}});
  setInterval(install,2200);setTimeout(install,500);
})();