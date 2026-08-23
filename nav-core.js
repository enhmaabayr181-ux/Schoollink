// Lightweight, crash-safe tab navigation for SchoolHub.
(function(){
  function activate(button){
    const nav=document.getElementById('nav');
    if(!nav)return;
    nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
  }
  function top(){
    const main=document.querySelector('.main');
    if(main?.scrollTo)main.scrollTo({top:0,behavior:'smooth'});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function cardByTitle(sectionId,title){
    const section=document.getElementById(sectionId);
    if(!section)return null;
    const heading=[...section.querySelectorAll('h3,h4')].find(x=>x.textContent.trim().includes(title));
    return heading?.closest('.card,.formCard,.ownerSchool')||null;
  }
  function showCards(sectionId,target,showAll=false){
    const section=document.getElementById(sectionId);
    if(!section)return;
    const cards=[...section.querySelectorAll(':scope > .grid > .card')];
    if(showAll||!target){
      cards.forEach(card=>card.classList.remove('hidden'));
    }else{
      const selected=target.closest?.('.card')||target;
      cards.forEach(card=>card.classList.toggle('hidden',card!==selected));
      selected?.classList?.remove('hidden');
    }
    top();
  }
  function parentTarget(label){
    return ({
      'Миний хүүхэд':document.getElementById('parentChildCard'),
      'Мэдээлэл':document.getElementById('parentAnnouncements')||cardByTitle('parent','Сургуулийн мэдээлэл'),
      'Даалгавар':document.getElementById('parentAssignments'),
      'Багштай чат':document.getElementById('parentChatThreads')||cardByTitle('parent','Багштай чат'),
      'Ахиц / Portfolio':document.getElementById('parentMonthlySummary')||cardByTitle('parent','Сарын ахиц')
    })[label]||null;
  }
  async function handleParent(label,button){
    activate(button);
    const section=document.getElementById('parent');
    if(section?.querySelectorAll('.card').length<=1&&typeof renderParentShell==='function')renderParentShell();
    if(typeof loadParentDashboard==='function'&&membership?.role==='parent'&&label==='Нүүр')await loadParentDashboard();
    showCards('parent',parentTarget(label),label==='Нүүр');
  }
  function renderAdminDemo(label){
    const section=document.getElementById('admin');
    if(!section)return null;
    const descriptions={
      'Ангиуд':'Сургуулийн ангиудын жагсаалт, багшийн холболт энд харагдана.',
      'Багш нар':'Багш нар болон хариуцсан ангийн мэдээлэл энд харагдана.',
      'Сурагчид':'Сурагчдын нэгдсэн мэдээлэл энд харагдана.',
      'Мэдээлэл':'Сургуулийн мэдээлэл болон багшийн хуваалцсан агуулга энд харагдана.',
      'Тайлан':'Ирц болон сургуулийн нэгдсэн тайлан энд харагдана.'
    };
    section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">УДИРДЛАГА</span><h3>${label}</h3><p>${descriptions[label]||'Сургуулийн удирдлагын нэгдсэн нүүр.'}</p></div><div class="card full"><div class="empty">Энэ хэсгийн бодит мэдээлэл сургуулийн админ эрхээр нэвтрэхэд ачаална.</div></div></div>`;
    return section.querySelector('.card');
  }
  async function handleAdmin(label,button){
    activate(button);
    if(membership?.role==='admin'&&typeof loadAdminDashboard==='function'&&label==='Нүүр')await loadAdminDashboard();
    if(!membership||membership.role!=='admin'){renderAdminDemo(label);top();return}
    const titleMap={'Ангиуд':'Анги ба багш','Багш нар':'Багш нар','Сурагчид':'Сурагч','Мэдээлэл':'Багшийн ажлын агуулга','Тайлан':'Өнөөдрийн ирц'};
    showCards('admin',cardByTitle('admin',titleMap[label]||label),label==='Нүүр');
  }
  async function handleOwner(label,button){
    activate(button);
    if(label==='Dashboard'&&typeof loadOwner==='function')await loadOwner();
    const targets={
      'Сургуулиуд':document.getElementById('ownerSchools'),
      'Analytics':document.getElementById('ownerMetrics'),
      'Багц & төлбөр':document.getElementById('ownerMetrics')
    };
    showCards('owner',targets[label]||null,label==='Dashboard');
  }
  function bind(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    [...nav.querySelectorAll('button')].forEach(button=>{
      if(currentRole==='teacher'||button.id==='shBillingNav')return;
      if(button.dataset.shCoreNav==='1')return;
      button.dataset.shCoreNav='1';
      button.onclick=async()=>{
        const label=button.dataset.shLabel||button.textContent.trim();
        if(currentRole==='parent')await handleParent(label,button);
        else if(currentRole==='admin')await handleAdmin(label,button);
        else if(currentRole==='owner')await handleOwner(label,button);
      };
    });
  }
  const previousSetRole=setRole;
  setRole=function(role){previousSetRole(role);setTimeout(bind,0)};
  const nav=document.getElementById('nav');
  if(nav)new MutationObserver(bind).observe(nav,{childList:true});
  setTimeout(bind,0);
})();
