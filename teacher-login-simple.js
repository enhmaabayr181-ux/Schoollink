(() => {
  const style=document.createElement('style');
  style.textContent=`
    #authWrap .inviteHint,#authWrap .shAccessHelp{display:none!important}
    #authWrap .authCard{max-width:480px!important}
    #authWrap .authActions{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
    #authWrap #login,#authWrap #signup{width:100%!important}
    #authWrap .shTeacherLoginNote{margin:14px 0 2px;padding:12px 14px;border-radius:15px;background:#f5f2ff;color:#655b87;font-size:12px;line-height:1.55}
    #authWrap .shTeacherLoginNote b{display:block;color:#35266f;font-size:13px;margin-bottom:3px}
    #authWrap .brand .logo{width:56px!important;height:56px!important;padding:0!important;overflow:hidden!important;background:transparent!important;border-radius:16px!important}
    #authWrap .brand .logo img{display:block;width:100%;height:100%;object-fit:contain}
  `;
  document.head.appendChild(style);
  function simplify(){
    const card=document.querySelector('#authWrap .authCard');if(!card)return;
    const logo=card.querySelector('.brand .logo');if(logo&&!logo.querySelector('img')){logo.textContent='';const img=document.createElement('img');img.src='/icons/schoolhub-192.svg';img.alt='SchoolHub';img.width=56;img.height=56;logo.appendChild(img)}
    const signup=document.getElementById('signup');if(signup&&signup.textContent!=='Багшаар бүртгүүлэх')signup.textContent='Багшаар бүртгүүлэх';
    const intro=card.querySelector(':scope > p.muted');if(intro&&intro.textContent!=='Багш и-мэйл, нууц үгээрээ нэвтэрнэ.')intro.textContent='Багш и-мэйл, нууц үгээрээ нэвтэрнэ.';
    [...card.querySelectorAll('button,a')].forEach(el=>{if(/Шинэ сургууль бүртгүүлэх/i.test(el.textContent))el.style.setProperty('display','none','important')});
    if(!card.querySelector('.shTeacherLoginNote')){
      const note=document.createElement('div');note.className='shTeacherLoginNote';note.innerHTML='<b>Эцэг эх үү?</b>Багшаас Gmail-д ирсэн урилгын холбоосоор шууд нэвтэрнэ.';
      document.getElementById('authStatus')?.before(note);
    }
  }
  simplify();setTimeout(simplify,800);
})();