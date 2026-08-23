(() => {
  const style=document.createElement('style');
  style.textContent=`
    .shDaily{grid-column:1/-1;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(246,243,255,.94));border:1px solid rgba(116,87,255,.12);border-radius:28px;padding:20px;box-shadow:0 14px 38px rgba(74,56,160,.09);position:relative;overflow:hidden}
    .shDaily:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-70px;top:-90px;background:rgba(115,87,255,.09)}
    .shDailyTop{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.shDailyTop h3{margin:4px 0;font-size:21px}.shDailyDate{font-size:12px;color:var(--muted)}
    .shDailyGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.shDailyItem{background:#fff;border:1px solid var(--line);border-radius:20px;padding:14px;min-height:88px}.shDailyItem span{display:block;color:var(--muted);font-size:12px}.shDailyItem b{display:block;font-size:21px;margin-top:7px;color:#31276f}
    .shDailyNote{margin-top:12px;padding:12px 14px;border-radius:17px;background:linear-gradient(135deg,#6a4df4,#8d78ff);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px}.shDailyNote button{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.15);color:#fff;border-radius:12px;padding:8px 11px;font-weight:800;cursor:pointer}
    @media(max-width:700px){.shDaily{padding:16px;border-radius:24px}.shDailyGrid{grid-template-columns:1fr 1fr}.shDailyItem{min-height:80px;padding:12px}.shDailyNote{align-items:flex-start;flex-direction:column}.shDailyTop h3{font-size:19px}}
  `;
  document.head.appendChild(style);

  const text=id=>document.getElementById(id)?.textContent?.trim()||'—';
  const count=(selector,root=document)=>root.querySelectorAll(selector).length;
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const dateLabel=()=>{const d=new Date(),days=['Ням','Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба'];return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} · ${days[d.getDay()]}`;};

  function summary(role,section){
    if(role==='teacher')return {
      title:'Өнөөдрийн хураангуй',
      items:[['👥 Сурагч',text('teacherStudentCount')],['✅ Ирц',text('teacherAttendance')],['⚠️ Анхаарах',text('teacherAttentionCount')],['📝 Даалгавар',text('teacherAssignmentCount')]],
      note:'Ирцээ бүртгээд, өнөөдрийн даалгавар болон мэдээллээ шалгаарай.',jump:'Ирц'
    };
    if(role==='parent')return {
      title:'Хүүхдийн өнөөдрийн хураангуй',
      items:[['🎒 Хүүхэд',text('parentChildName')],['✅ Ирц',text('parentAttendance')],['📝 Даалгавар',String(count('#parentAssignments .row,#parentAssignments .notice',section))],['📣 Мэдээлэл',String(count('#parentAnnouncements .notice',section))]],
      note:'Шинэ мэдээлэл, даалгавар болон багшийн тэмдэглэлийг шалгаарай.',jump:'Мэдээлэл'
    };
    if(role==='admin')return {
      title:'Сургуулийн өнөөдрийн хураангуй',
      items:[['🏫 Анги',metric(section,'Анги')],['👩‍🏫 Багш',metric(section,'Багш')],['🧑‍🎓 Сурагч',metric(section,'Сурагч')],['⚠️ Анхаарах',metric(section,'Анхаарах')]],
      note:'Ирц болон сургуулийн анхаарах үзүүлэлтүүдийг хянаарай.',jump:'Тайлан'
    };
    return {
      title:'SchoolHub өнөөдрийн хураангуй',
      items:[['🏫 Сургууль',ownerMetric('Сургууль')],['👥 Хэрэглэгч',ownerMetric('Хэрэглэгч')],['🧑‍🎓 Сурагч',ownerMetric('Сурагч')],['👩‍🏫 Багш',ownerMetric('Багш')]],
      note:'Сургуулиудын идэвх, эрх болон төлбөрийн төлөвийг шалгаарай.',jump:'Сургуулиуд'
    };
  }
  function metric(section,label){
    const box=[...section.querySelectorAll('.metric')].find(x=>x.querySelector('span')?.textContent?.trim()===label);
    return box?.querySelector('b')?.textContent?.trim()||'0';
  }
  function ownerMetric(label){
    const box=[...document.querySelectorAll('#ownerMetrics .metric')].find(x=>x.querySelector('span')?.textContent?.trim()===label);
    return box?.querySelector('b')?.textContent?.trim()||'0';
  }
  function render(){
    const app=document.getElementById('app');
    if(!app||app.classList.contains('hidden'))return;
    const section=document.querySelector('.page.active');
    const grid=section?.querySelector(':scope > .grid');
    if(!section||!grid)return;
    const role=section.id,data=summary(role,section);
    let card=grid.querySelector(':scope > .shDaily');
    if(!card){card=document.createElement('div');card.className='shDaily';const hero=grid.querySelector(':scope > .hero');if(hero)hero.after(card);else grid.prepend(card)}
    const signature=JSON.stringify(data);
    if(card.dataset.signature===signature)return;
    card.dataset.signature=signature;
    card.innerHTML='<div class="shDailyTop"><div><div class="muted">ӨНӨӨДӨР</div><h3>'+safe(data.title)+'</h3></div><div class="shDailyDate">'+safe(dateLabel())+'</div></div><div class="shDailyGrid">'+data.items.map(x=>'<div class="shDailyItem"><span>'+safe(x[0])+'</span><b>'+safe(x[1])+'</b></div>').join('')+'</div><div class="shDailyNote"><span>'+safe(data.note)+'</span><button type="button" data-sh-daily-jump="'+safe(data.jump)+'">Нээх →</button></div>';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-sh-daily-jump]');
    if(!button)return;
    const label=button.dataset.shDailyJump;
    const target=[...document.querySelectorAll('#nav button')].find(x=>(x.dataset.shLabel||x.querySelector('.sh-nav-label')?.textContent?.trim()||x.textContent.trim())===label);
    target?.click();
  });
  setInterval(render,1800);
  setTimeout(render,350);
})();