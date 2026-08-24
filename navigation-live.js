(() => {
  const nav=document.getElementById('nav');
  if(!nav||nav.dataset.shLiveNavigation==='1')return;
  nav.dataset.shLiveNavigation='1';

  const cleanLabel=button=>button.dataset.shLabel||button.querySelector('.sh-nav-label')?.textContent?.trim()||button.textContent.trim();
  const activeRole=()=>document.querySelector('.page.active')?.id||document.querySelector('.rolebar button.active')?.dataset.role||'owner';
  const activate=button=>nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
  const scrollTop=()=>window.scrollTo({top:0,behavior:'auto'});
  const focusSection=(section,label,target)=>{
    const home=label==='Нүүр'||label==='Dashboard';
    section?.classList.toggle('sh-subview',!home);
    if(home){scrollTop();return}
    requestAnimationFrame(()=>{(target||section)?.scrollIntoView({behavior:'auto',block:'start'})});
  };
  const focusStyle=document.createElement('style');focusStyle.textContent='.page.sh-subview>.grid>.hero,.page.sh-subview>.grid>.shDaily,.page.sh-subview>.grid>.shAlerts{display:none!important}.page.sh-subview>.grid>*{scroll-margin-top:10px}';document.head.appendChild(focusStyle);

  function showCard(sectionId,label){
    const section=document.getElementById(sectionId);
    if(!section)return;
    const maps={
      parent:{'Миний хүүхэд':'parentChildCard','Мэдээлэл':'parentAnnouncements','Даалгавар':'parentAssignments','Багштай чат':'parentChatThreads','Ахиц / Portfolio':'parentMonthlySummary'},
      owner:{'Сургуулиуд':'ownerSchools','Analytics':'ownerMetrics','Багц & төлбөр':'shBillingPanel'}
    };
    const id=maps[sectionId]?.[label];
    const items=[...section.querySelectorAll(':scope > .grid > *')];
    if(label==='Нүүр'||label==='Dashboard'){items.forEach(c=>c.classList.remove('hidden'));focusSection(section,label);return}
    let target=id?document.getElementById(id)?.closest('.card'):null;
    if(!target){
      const keyMap={'Ангиуд':'Анги','Багш нар':'Багш','Сурагчид':'Сурагч','Тайлан':'Тайлан','Мэдээлэл':'Мэдээлэл'};
      const key=keyMap[label]||label;
      const h=[...section.querySelectorAll('h3,h4')].find(x=>x.textContent.includes(key));
      target=h?.closest('.card')||null;
    }
    if(target){items.forEach(c=>c.classList.toggle('hidden',c!==target));target.classList.remove('hidden')}
    focusSection(section,label,target);
  }

  function renderPreview(role,label){
    const section=document.getElementById(role);
    if(!section)return;
    const copy={
      teacher:{
        'Нүүр':['Багшийн нүүр','Өнөөдрийн хичээл, анги болон хийх ажлуудаа нэг дороос удирдана.'],
        'Мэдээлэл':['Мэдээлэл','Ангидаа мэдээлэл, сануулга, зарлал нийтэлнэ.'],
        'Даалгавар':['Даалгавар','Даалгавар үүсгэж, хүлээлгэн өгөх хугацааг удирдана.'],
        'Ирц':['Ирц','Сурагчдын ирцийг бүртгэж, өдрийн тайлан харна.'],
        'Чат':['Чат','Эцэг эх, сурагчидтай аюулгүй харилцана.'],
        'Манай анги':['Манай анги','Сурагчдын жагсаалт болон ангийн мэдээллийг харна.'],
        'Зөвшөөрөл':['Зөвшөөрөл','Эцэг эхээс зөвшөөрөл хүсэж, хариуг хянана.'],
        'Ажлын сан':['Ажлын сан','Хичээлийн материал, төлөвлөгөө, файлаа хадгална.'],
        'Ажиглалт':['Ажиглалт','Сурагчдын ахиц хөгжлийн тэмдэглэл хөтөлнө.'],
        'Сарын тайлан':['Сарын тайлан','Ангийн сарын үр дүн, ирц, ахицыг нэгтгэнэ.']
      },
      parent:{
        'Нүүр':['Эцэг эхийн нүүр','Хүүхдийнхээ мэдээллийг нэг дороос хянаарай.'],
        'Миний хүүхэд':['Миний хүүхэд','Ирц, анги болон өдөр тутмын мэдээллийг харна.'],
        'Мэдээлэл':['Мэдээлэл','Сургуулийн зарлал, багшийн сануулгыг уншина.'],
        'Даалгавар':['Даалгавар','Хүүхдийн даалгавар, хугацааг хянана.'],
        'Багштай чат':['Багштай чат','Багштай шууд холбогдож мэдээлэл солилцоно.'],
        'Ахиц / Portfolio':['Ахиц / Portfolio','Хүүхдийн бүтээл болон хөгжлийн ахицыг харна.']
      },
      admin:{
        'Нүүр':['Удирдлагын нүүр','Сургуулийн нэгдсэн үзүүлэлтийг хянана.'],
        'Ангиуд':['Ангиуд','Анги, бүлэг болон багшийн холболтыг удирдана.'],
        'Багш нар':['Багш нар','Багшийн бүртгэл болон хариуцсан ангийг харна.'],
        'Сурагчид':['Сурагчид','Сурагчдын нэгдсэн бүртгэлийг удирдана.'],
        'Мэдээлэл':['Мэдээлэл','Сургуулийн зарлал, мэдээллийг нийтэлнэ.'],
        'Тайлан':['Тайлан','Ирц болон сургуулийн нэгдсэн тайланг харна.']
      }
    };
    const data=copy[role]?.[label]||[label,'Энэ хэсгийн мэдээлэл энд харагдана.'];
    section.innerHTML='<div class="grid"><div class="card hero full"><span class="pill">'+(role==='teacher'?'БАГШ':role==='parent'?'ЭЦЭГ ЭХ':'УДИРДЛАГА')+'</span><h3>'+data[0]+'</h3><p>'+data[1]+'</p></div><div class="card full"><div class="sectionTitle"><h3>'+data[0]+'</h3><span class="demoTag">DEMO</span></div><div class="empty">Жинхэнэ '+(role==='teacher'?'багш':role==='parent'?'эцэг эх':'сургуулийн админ')+' account-аар нэвтрэхэд бодит мэдээлэл ачаална.</div></div></div>';
    scrollTop();
  }

  nav.addEventListener('click',async event=>{
    const button=event.target.closest('button');
    if(!button||!nav.contains(button))return;
    const label=cleanLabel(button),role=activeRole();
    activate(button);
    const rolebar=document.querySelector('.rolebar');
    const ownerPreview=role!=='owner'&&rolebar&&getComputedStyle(rolebar).display!=='none';
    if(ownerPreview){
      event.preventDefault();
      event.stopImmediatePropagation();
      renderPreview(role,label);
      return;
    }
    try{
      if(role==='teacher'){
        if(label==='Календарь'&&typeof window.shRenderCalendar==='function')await window.shRenderCalendar();
        else if(label==='Санал асуулга'&&typeof window.shRenderPolls==='function')await window.shRenderPolls();
        else if(typeof window.tpRenderView==='function')await window.tpRenderView(label);
        focusSection(document.getElementById('teacher'),label,document.querySelector('#teacher>.grid>*:not(.hero)'));
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