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
    .shOwnerAdminInvite{background:#f1edff!important;color:#6247ee!important;border-color:rgba(115,87,255,.12)!important}
    .shOwnerAdminHint{margin-top:9px;padding:10px 12px;border-radius:14px;background:#f8f6ff;color:#655b87;font-size:12px;line-height:1.45}
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

  function installOwnerAdminInviteFlow(){
    if(window.shOwnerAdminInviteReady||typeof renderOwnerData!=='function')return;
    window.shOwnerAdminInviteReady=true;

    renderOwnerData=function(){
      const m=ownerData?.metrics||{};
      $('ownerMetrics').innerHTML=[['Сургууль',m.schools],['Хэрэглэгч',m.users],['Сурагч',m.students],['Багш',m.teachers],['Эцэг эх',m.parents],['Анги',m.classes]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]||0}</b></div>`).join('');
      const rows=ownerData?.schools||[];
      $('ownerSchools').className=rows.length?'':'empty';
      $('ownerSchools').innerHTML=rows.length?rows.map(s=>`<div class="ownerSchool"><div><h4>${esc(s.name)}</h4><div class="muted">${esc(s.code)} · ${s.counts?.classes||0} анги · ${s.counts?.students||0} сурагч · ${s.counts?.teachers||0} багш</div><div class="shOwnerAdminHint">Удирдлагын эрх нь зөвхөн энэ сургуульд үйлчилнэ.</div></div><div class="schoolActions"><span class="pill">${esc(s.subscription?.plan||'trial')} / ${esc(s.subscription?.status||'setup')}</span><button class="ghost" onclick="openSchool('${s.id}')">⚙ Тохируулах</button><button class="ghost shOwnerAdminInvite" onclick="shOpenAdminInvite('${s.id}')">👤 Удирдлага урих</button></div></div>`).join(''):'Одоогоор сургууль алга байна.';
    };
    window.renderOwnerData=renderOwnerData;

    window.shOpenAdminInvite=async schoolId=>{
      await openSchool(schoolId);
      const inviteTab=[...document.querySelectorAll('.tabs button')].find(b=>b.dataset.setup==='invite');
      if(inviteTab)inviteTab.click();
      const role=document.getElementById('inviteRole');
      if(role){role.value='admin';if(typeof updateInviteFields==='function')updateInviteFields()}
      const pane=document.getElementById('setup-invite');
      const card=pane?.querySelector('.formCard');
      if(card){
        const h=card.querySelector('h4');if(h)h.textContent='👤 Сургуулийн удирдлага урих';
        if(!card.querySelector('.shAdminInviteExplain')){
          const note=document.createElement('div');note.className='notice shAdminInviteExplain';note.style.marginBottom='12px';note.innerHTML='<b>Хэнд өгөх вэ?</b><p>Тухайн сургуулийн захирал, сургалтын менежер, нийгмийн ажилтан эсвэл систем хариуцсан ажилтанд өгнө. Тэр хэрэглэгч зөвхөн энэ сургуулийн багш, анги, сурагчийг удирдана.</p>';card.insertBefore(note,card.firstChild);
        }
        const btn=card.querySelector('.btn.primary');if(btn)btn.textContent='Удирдлагын урилгын код үүсгэх';
      }
    };

    if(typeof accessMode!=='undefined'&&accessMode==='owner'&&typeof ownerData!=='undefined'&&ownerData)renderOwnerData();
  }

  setTimeout(installOwnerAdminInviteFlow,150);
  setTimeout(installOwnerAdminInviteFlow,1000);
})();