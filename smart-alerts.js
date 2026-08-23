(() => {
  const style=document.createElement('style');
  style.textContent=`
    .shAlerts{grid-column:1/-1;background:rgba(255,255,255,.96);border:1px solid rgba(116,87,255,.12);border-radius:28px;padding:20px;box-shadow:0 14px 38px rgba(74,56,160,.08)}
    .shAlertsHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.shAlertsHead h3{margin:0;font-size:20px}.shAlertBadge{background:#f0ecff;color:#6349e8;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800}
    .shAlertList{display:grid;gap:9px}.shAlert{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:18px;padding:12px 14px;background:#fff;cursor:pointer;text-align:left;width:100%;color:inherit}.shAlert:hover{border-color:#8b78fa;transform:translateY(-1px)}
    .shAlertIcon{width:40px;height:40px;display:grid;place-items:center;border-radius:14px;background:#f1edff;font-size:19px;flex:0 0 auto}.shAlert.warn .shAlertIcon{background:#fff1df}.shAlert.good .shAlertIcon{background:#e4faf3}.shAlertText{min-width:0;flex:1}.shAlertText b{display:block;font-size:14px}.shAlertText span{display:block;color:var(--muted);font-size:12px;margin-top:3px}.shAlertGo{color:#765ff2;font-weight:900}
    @media(max-width:700px){.shAlerts{padding:16px;border-radius:24px}.shAlert{padding:11px}.shAlertsHead h3{font-size:18px}}
  `;
  document.head.appendChild(style);
  const num=id=>Number((document.getElementById(id)?.textContent||'0').replace(/[^0-9]/g,''))||0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function alerts(role,section){
    if(role==='teacher'){
      const attention=num('teacherAttentionCount'),assignments=num('teacherAssignmentCount');
      return [
        attention?['warn','⚠️',attention+' сурагч анхаарах төлөвтэй','Хоцорсон болон тасалсан ирцийг шалгана.','Ирц']:['good','✓','Ирцийн ноцтой анхааруулга алга','Өнөөдрийн ирц хэвийн байна.','Ирц'],
        assignments?['','📝',assignments+' идэвхтэй даалгавар байна','Хугацаа болон гүйцэтгэлийг шалгана.','Даалгавар']:['','📝','Өнөөдрийн даалгавраа төлөвлөөрэй','Сурагчдад өгөх ажлаа нэмэх боломжтой.','Даалгавар']
      ];
    }
    if(role==='parent'){
      const assignments=section.querySelectorAll('#parentAssignments .row,#parentAssignments .notice').length;
      return [
        assignments?['warn','📝',assignments+' даалгавар шалгах хэрэгтэй','Хугацаа дуусахаас өмнө хүүхэдтэйгээ нягтлаарай.','Даалгавар']:['good','✓','Шинэ яаралтай даалгавар алга','Хүүхдийн мэдээлэл хэвийн байна.','Мэдээлэл'],
        ['','💬','Багштай холбоотой байгаарай','Шинэ зурвас, мэдээллийг нэг дор шалгана.','Багштай чат']
      ];
    }
    if(role==='admin')return [
      ['warn','📊','Өдрийн ирцийн тайланг шалгана уу','Ангиудын ирц болон хоцролтыг хянана.','Тайлан'],
      ['','👩‍🏫','Багш, ангийн мэдээллийг нягтлаарай','Өнөөдрийн сургалтын идэвхийг харна.','Багш']
    ];
    return [
      ['warn','💳','Сургуулиудын төлбөрийн төлөв','Trial болон сунгалтын хугацааг шалгана.','Багц & төлбөр'],
      ['','🏫','Сургуулийн идэвхийн хяналт','Хэрэглэгч, багш, сурагчийн өсөлтийг харна.','Analytics']
    ];
  }
  function render(){
    const app=document.getElementById('app');
    if(!app||app.classList.contains('hidden'))return;
    const section=document.querySelector('.page.active'),grid=section?.querySelector(':scope > .grid');
    if(!section||!grid)return;
    const data=alerts(section.id,section);
    let card=grid.querySelector(':scope > .shAlerts');
    if(!card){card=document.createElement('div');card.className='shAlerts';const daily=grid.querySelector(':scope > .shDaily');if(daily)daily.after(card);else grid.prepend(card)}
    const sig=JSON.stringify(data);if(card.dataset.signature===sig)return;card.dataset.signature=sig;
    card.innerHTML='<div class="shAlertsHead"><h3>🔔 Ухаалаг анхааруулга</h3><span class="shAlertBadge">'+data.length+' сануулга</span></div><div class="shAlertList">'+data.map(a=>'<button type="button" class="shAlert '+a[0]+'" data-sh-alert-jump="'+esc(a[4])+'"><span class="shAlertIcon">'+a[1]+'</span><span class="shAlertText"><b>'+esc(a[2])+'</b><span>'+esc(a[3])+'</span></span><span class="shAlertGo">›</span></button>').join('')+'</div>';
  }
  document.addEventListener('click',e=>{
    const alert=e.target.closest('[data-sh-alert-jump]');if(!alert)return;
    const label=alert.dataset.shAlertJump;
    const target=[...document.querySelectorAll('#nav button')].find(x=>(x.dataset.shLabel||x.querySelector('.sh-nav-label')?.textContent?.trim()||x.textContent.trim())===label);
    target?.click();
  });
  setInterval(render,1800);setTimeout(render,500);
})();