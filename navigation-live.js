(() => {
  const nav=document.getElementById('nav');
  if(!nav||nav.dataset.shLiveNavigation==='1')return;
  nav.dataset.shLiveNavigation='1';

  const cleanLabel=button=>button.dataset.shLabel||button.querySelector('.sh-nav-label')?.textContent?.trim()||button.textContent.trim();
  const activeRole=()=>document.querySelector('.page.active')?.id||document.querySelector('.rolebar button.active')?.dataset.role||'owner';
  const activate=button=>nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
  const scrollTop=()=>window.scrollTo({top:0,behavior:'smooth'});

  function showCard(sectionId,label){
    const section=document.getElementById(sectionId);
    if(!section)return;
    const maps={
      parent:{'Миний хүүхэд':'parentChildCard','Мэдээлэл':'parentAnnouncements','Даалгавар':'parentAssignments','Багштай чат':'parentChatThreads','Ахиц / Portfolio':'parentMonthlySummary'},
      owner:{'Сургуулиуд':'ownerSchools','Analytics':'ownerMetrics','Багц & төлбөр':'shBillingPanel'}
    };
    const id=maps[sectionId]?.[label];
    const cards=[...section.querySelectorAll(':scope > .grid > .card')];
    if(label==='Нүүр'||label==='Dashboard'){cards.forEach(c=>c.classList.remove('hidden'));scrollTop();return}
    let target=id?document.getElementById(id)?.closest('.card'):null;
    if(!target){
      const keyMap={'Ангиуд':'Анги','Багш нар':'Багш','Сурагчид':'Сурагч','Тайлан':'Тайлан','Мэдээлэл':'Мэдээлэл'};
      const key=keyMap[label]||label;
      const h=[...section.querySelectorAll('h3,h4')].find(x=>x.textContent.includes(key));
      target=h?.closest('.card')||null;
    }
    if(target){cards.forEach(c=>c.classList.toggle('hidden',c!==target));target.classList.remove('hidden')}
    scrollTop();
  }

  nav.addEventListener('click',async event=>{
    const button=event.target.closest('button');
    if(!button||!nav.contains(button))return;
    const label=cleanLabel(button),role=activeRole();
    activate(button);
    try{
      if(role==='teacher'){
        if(label==='Календарь'&&typeof window.shRenderCalendar==='function')await window.shRenderCalendar();
        else if(label==='Санал асуулга'&&typeof window.shRenderPolls==='function')await window.shRenderPolls();
        else if(typeof window.tpRenderView==='function')await window.tpRenderView(label);
      }else if(role==='parent'){
        if(label==='Календарь'&&typeof window.shRenderCalendar==='function')await window.shRenderCalendar();
        else if(label==='Санал асуулга'&&typeof window.shRenderPolls==='function')await window.shRenderPolls();
        else showCard('parent',label);
      }else if(role==='admin'){
        if(label==='Календарь'&&typeof window.shRenderCalendar==='function')await window.shRenderCalendar();
        else if(label==='Санал асуулга'&&typeof window.shRenderPolls==='function')await window.shRenderPolls();
        else showCard('admin',label);
      }else showCard('owner',label);
    }catch(error){
      console.error('SchoolHub navigation',error);
    }
  },true);
})();