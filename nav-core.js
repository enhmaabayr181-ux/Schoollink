// Lightweight navigation bindings for SchoolHub.
(function(){
  function activate(button){
    const nav=document.getElementById('nav');
    if(!nav)return;
    nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
  }
  function scrollToTarget(target){
    if(!target)return;
    target.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function cardByTitle(sectionId,title){
    const section=document.getElementById(sectionId);
    if(!section)return null;
    const heading=[...section.querySelectorAll('h3,h4')].find(x=>x.textContent.trim().includes(title));
    return heading?.closest('.card,.formCard,.ownerSchool')||heading||section;
  }
  async function handleParent(label,button){
    activate(button);
    if(typeof loadParentDashboard==='function'&&['Нүүр','Миний хүүхэд'].includes(label))await loadParentDashboard();
    const targets={
      'Нүүр':document.getElementById('parent'),
      'Миний хүүхэд':document.getElementById('parentChildCard'),
      'Мэдээлэл':document.getElementById('parentAnnouncements')||cardByTitle('parent','Сургуулийн мэдээлэл'),
      'Даалгавар':document.getElementById('parentAssignments'),
      'Багштай чат':document.getElementById('parentChatThreads')||cardByTitle('parent','Багштай чат'),
      'Ахиц / Portfolio':document.getElementById('parentMonthlySummary')||cardByTitle('parent','Сарын ахиц')
    };
    scrollToTarget(targets[label]||document.getElementById('parent'));
  }
  async function handleAdmin(label,button){
    activate(button);
    if(typeof loadAdminDashboard==='function'&&label==='Нүүр')await loadAdminDashboard();
    const titleMap={'Нүүр':'УДИРДЛАГА','Ангиуд':'Анги ба багш','Багш нар':'Багш нар','Сурагчид':'Сурагч','Мэдээлэл':'Багшийн ажлын агуулга','Тайлан':'Өнөөдрийн ирц'};
    scrollToTarget(cardByTitle('admin',titleMap[label]||label)||document.getElementById('admin'));
  }
  async function handleOwner(label,button){
    activate(button);
    if(label==='Dashboard'&&typeof loadOwner==='function')await loadOwner();
    const targets={
      'Dashboard':document.getElementById('owner'),
      'Сургуулиуд':document.getElementById('ownerSchools'),
      'Analytics':document.getElementById('ownerMetrics'),
      'Багц & төлбөр':document.getElementById('ownerMetrics')
    };
    scrollToTarget(targets[label]||document.getElementById('owner'));
  }
  function bind(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    [...nav.querySelectorAll('button')].forEach(button=>{
      if(currentRole==='teacher')return;
      if(button.dataset.shCoreNav==='1')return;
      button.dataset.shCoreNav='1';
      button.onclick=async()=>{
        const label=button.textContent.trim();
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
