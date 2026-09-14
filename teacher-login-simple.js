(() => {
  const style=document.createElement('style');
  style.textContent=`
    #authWrap .inviteHint,#authWrap .shAccessHelp{display:none!important}\n    #authWrap .inviteHint.shInviteOpen{display:block!important;margin-top:12px}
    #authWrap .authCard{max-width:480px!important}
    #authWrap .authActions{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
    #authWrap #login,#authWrap #signup{width:100%!important}
    #authWrap .shTeacherLoginNote{margin:14px 0 2px;padding:12px 14px;border-radius:15px;background:#f5f2ff;color:#655b87;font-size:12px;line-height:1.55}\n    #authWrap .shParentInviteToggle{width:100%;margin-top:10px}
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
      const note=document.createElement('div');note.className='shTeacherLoginNote';note.innerHTML='<b>Эцэг эх үү?</b>Багшаас авсан урилгын кодоор нэг удаа бүртгүүлнэ.';
      const toggle=document.createElement('button');toggle.type='button';toggle.className='ghost shParentInviteToggle';toggle.textContent='Эцэг эхийн урилгын код оруулах';toggle.onclick=()=>{const hint=card.querySelector('.inviteHint');if(!hint)return;const open=hint.classList.toggle('shInviteOpen');toggle.textContent=open?'Урилгын хэсгийг хаах':'Эцэг эхийн урилгын код оруулах';if(open)document.getElementById('authFullName')?.focus()};note.appendChild(toggle);document.getElementById('authStatus')?.before(note);
    }
  }
  simplify();setTimeout(simplify,800);

  // Load the complete school-management workspace without changing the existing app boot order.
  if(!document.querySelector('script[data-sh-admin-center]')){
    const adminScript=document.createElement('script');
    adminScript.src='/admin-center.js?v=01d69da';
    adminScript.dataset.shAdminCenter='1';
    document.body.appendChild(adminScript);
  }
})();