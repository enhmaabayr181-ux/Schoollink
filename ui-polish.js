(() => {
  const featureMap = [
    ['Мэдээлэл','📣'],['Даалгавар','📝'],['Ирц','✅'],['Чат','💬'],
    ['Календарь','📅'],['Санал асуулга','📊'],['Зөвшөөрөл','☑️'],
    ['Ажиглалт','🔎'],['Portfolio','🖼️'],['Сарын тайлан','📈'],
    ['Ажлын сан','📁'],['Манай анги','👥'],['Миний хүүхэд','🎒'],
    ['Анги','🏫'],['Багш','👩‍🏫'],['Сурагч','🧑‍🎓'],['Тайлан','📊']
  ];
  const roleText = {
    teacher:['Сайн байна уу, Багш аа! 👋','Өнөөдрийн хичээл, сурагчдын мэдээллээ хялбар удирдаарай.'],
    parent:['Сайн байна уу! 👋','Хүүхдийнхээ өдөр тутмын мэдээллийг нэг дороос хараарай.'],
    admin:['Сайн байна уу, Удирдлага аа! 👋','Сургуулийн үйл ажиллагаагаа хялбар удирдаарай.'],
    owner:['Сайн байна уу! 👋','SchoolHub-ийн сургуулиудаа нэг дороос удирдаарай.']
  };

  function iconFor(text=''){
    return featureMap.find(([key])=>text.includes(key))?.[1] || '✦';
  }
  function decorate(){
    const app=document.getElementById('app');
    if(!app||app.classList.contains('hidden'))return;
    document.body.classList.add('sh-modern');
    const top=document.querySelector('.top');
    if(top&&!top.querySelector('.sh-mobile-brand')){
      const brand=document.createElement('div');
      brand.className='sh-mobile-brand';
      brand.innerHTML='<span class="sh-brand-mark">S</span><b>SchoolHub</b>';
      top.prepend(brand);
    }
    const role=window.currentRole||'owner';
    const heading=top?.querySelector(':scope > div:not(.sh-mobile-brand) h2');
    const eyebrow=top?.querySelector(':scope > div:not(.sh-mobile-brand) .muted');
    if(heading&&roleText[role]){
      heading.textContent=roleText[role][0];
      if(eyebrow)eyebrow.textContent=roleText[role][1];
    }
    const section=document.getElementById(role);
    if(!section)return;
    section.querySelectorAll('.card').forEach(card=>{
      const title=card.querySelector('h3,h4')?.textContent?.trim()||'';
      if(card.classList.contains('hero')){
        card.classList.add('sh-main-hero');
        if(!card.querySelector('.sh-hero-icon')){
          const icon=document.createElement('div');
          icon.className='sh-hero-icon';
          icon.textContent=iconFor(title);
          card.appendChild(icon);
        } else card.querySelector('.sh-hero-icon').textContent=iconFor(title);
      } else if(title && !card.classList.contains('quick')){
        card.classList.add('sh-soft-card');
      }
    });
    const nav=document.getElementById('nav');
    nav?.querySelectorAll('button').forEach(btn=>{
      if(btn.querySelector('.sh-nav-icon'))return;
      const label=btn.textContent.trim();
      btn.textContent='';
      const icon=document.createElement('span'); icon.className='sh-nav-icon'; icon.textContent=iconFor(label==='Нүүр'?'Dashboard':label);
      const text=document.createElement('span'); text.className='sh-nav-label'; text.textContent=label;
      btn.append(icon,text);
    });
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(decorate));
  const app=document.getElementById('app');
  if(app)observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setTimeout(decorate,50);
})();