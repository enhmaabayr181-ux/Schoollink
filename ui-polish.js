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
    const role=document.querySelector('.page.active')?.id||document.querySelector('.rolebar button.active')?.dataset.role||'owner';
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
          const icon=document.createElement('img');
          icon.className='sh-hero-icon';
          icon.src=artFor(title);
          icon.alt='';
          icon.decoding='async';
          card.appendChild(icon);
        } else { const next=artFor(title); if(card.querySelector('.sh-hero-icon').getAttribute('src')!==next)card.querySelector('.sh-hero-icon').src=next; }
      } else if(!card.classList.contains('quick')){
        card.classList.add('sh-soft-card');
        const artTitle=title||card.textContent.trim().slice(0,80);
        let art=card.querySelector(':scope > .sh-card-art');
        if(!art){
          art=document.createElement('img');
          art.className='sh-card-art';
          art.alt='';
          art.decoding='async';
          card.appendChild(art);
        }
        const src=artFor(artTitle);
        if(art.getAttribute('src')!==src)art.src=src;
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
  const app=document.getElementById('app');
  const watch={subtree:true,childList:true,attributes:true,attributeFilter:['class']};
  let queued=false;
  const observer=new MutationObserver(()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      observer.disconnect();
      decorate();
      if(app)observer.observe(app,watch);
    });
  });
  if(app)observer.observe(app,watch);
  setTimeout(()=>{
    observer.disconnect();
    decorate();
    if(app)observer.observe(app,watch);
  },50);
})();