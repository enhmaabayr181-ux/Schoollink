(() => {
  function simplify(){
    const roleButton=document.querySelector('.rolebar [data-role="admin"]');
    if(roleButton)roleButton.textContent='Сургуулийн самбар';
    const invite=[...document.querySelectorAll('#inviteRole option')].find(x=>x.value==='admin');
    if(invite)invite.textContent='Сургуулийн удирдах эрх';
    const meta=document.getElementById('profileMeta');
    if(meta?.textContent==='admin')meta.textContent='Сургуулийн удирдах эрх';
    document.querySelectorAll('*').forEach(el=>{
      if(el.children.length)return;
      if(el.textContent.trim()==='Админ')el.textContent='Сургуулийн удирдлага';
    });
  }
  const style=document.createElement('style');
  style.textContent='.shAccessHelp{margin-top:10px;padding:12px 14px;border-radius:16px;background:#f5f2ff;color:#574c89;font-size:13px;line-height:1.5}.shAccessHelp b{color:#332871}';
  document.head.appendChild(style);
  function addHelp(){
    const join=document.querySelector('#joinWrap .joinCard');if(join&&!join.querySelector('.shAccessHelp')){
      const h=document.createElement('div');h.className='shAccessHelp';h.innerHTML='<b>Тусдаа admin account шаардлагагүй.</b><br>Таны и-мэйлтэй холбогдсон сургууль болон эрхийг SchoolHub автоматаар нээнэ. Багш, эцэг эх зөвхөн урилгын кодоор нэгдэнэ.';join.querySelector('p')?.after(h);
    }
    const auth=document.querySelector('#authWrap .authCard');if(auth&&!auth.querySelector('.shAccessHelp')){
      const h=document.createElement('div');h.className='shAccessHelp';h.innerHTML='<b>Нэг л account ашиглана.</b> Нэвтэрсний дараа SchoolHub таны сургууль, багш эсвэл эцэг эхийн эрхийг автоматаар танина.';auth.querySelector('p')?.after(h);
    }
  }
  new MutationObserver(()=>{simplify();addHelp()}).observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{simplify();addHelp()},1800);setTimeout(()=>{simplify();addHelp()},300);
})();