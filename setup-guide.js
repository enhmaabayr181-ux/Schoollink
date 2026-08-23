(() => {
  const style=document.createElement('style');
  style.textContent='#shHelpOpen{border:1px solid var(--line);background:#fff;color:#4b4178;border-radius:14px;padding:10px 13px;cursor:pointer;font-weight:800}.shHelpModal{position:fixed;inset:0;z-index:11950;background:rgba(24,18,55,.35);backdrop-filter:blur(6px);display:grid;place-items:center;padding:14px}.shHelpModal.hidden{display:none}.shHelpCard{width:min(520px,100%);max-height:85vh;overflow:auto;background:#fff;border-radius:26px;padding:20px;box-shadow:0 24px 80px rgba(30,20,75,.25)}.shHelpTop{display:flex;justify-content:space-between;gap:12px;align-items:start}.shHelpTop h3{margin:4px 0}.shHelpClose{border:0;background:#f3efff;width:38px;height:38px;border-radius:12px;font-size:22px;cursor:pointer}.shHelpSteps{display:grid;gap:10px;margin-top:16px}.shHelpStep{display:flex;gap:12px;padding:13px;border:1px solid var(--line);border-radius:18px}.shHelpNum{width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;background:#7058ef;color:#fff;font-weight:900}.shHelpStep b{display:block}.shHelpStep span{display:block;color:var(--muted);font-size:12px;margin-top:4px}@media(max-width:700px){#shHelpOpen{width:42px;height:42px;padding:0;font-size:0}#shHelpOpen:after{content:"?";font-size:20px}}';
  document.head.appendChild(style);
  const button=document.createElement('button');button.id='shHelpOpen';button.type='button';button.textContent='? Тусламж';
  const modal=document.createElement('div');modal.className='shHelpModal hidden';modal.innerHTML='<div class="shHelpCard"><div class="shHelpTop"><div><div class="muted">ЭХЛЭХ ЗААВАР</div><h3 id="shHelpTitle">SchoolHub ашиглах</h3></div><button class="shHelpClose">×</button></div><p id="shHelpIntro" class="muted"></p><div id="shHelpSteps" class="shHelpSteps"></div><button id="shHelpDone" class="btn primary" style="width:100%;margin-top:16px">Ойлголоо</button></div>';
  document.body.appendChild(modal);
  const guides={
    owner:{title:'Owner эхлэх дараалал',intro:'Бүх сургуулийн системийг нэг газраас хянана.',steps:[['Сургууль','Шинэ сургуулийг бүртгэж, ашиглах эрхийг нээнэ.'],['Хэрэглэгч','Сургуулийн удирдах эрхийг тухайн хүнд холбоно.'],['Төлбөр','Багц, хугацаа болон төлбөрийн төлөвийг хянана.'],['Analytics','Сургуулиудын нийт идэвх, өсөлтийг харна.']]},
    admin:{title:'Сургуулийн самбар эхлэх дараалал',intro:'Тусдаа admin account сонгохгүй; таны эрх автоматаар танигдана.',steps:[['Анги','Хичээлийн ангиудаа үүсгэнэ.'],['Багш','Багшийг ангитай холбосон урилгын код гаргана.'],['Сурагч','Сурагчдын мэдээллийг нэмнэ.'],['Өдөр тутам','Ирц, мэдээлэл, тайлангаа хянана.']]},
    teacher:{title:'Багш эхлэх дараалал',intro:'Өнөөдрийн ангийн ажлыг нэг урсгалаар удирдана.',steps:[['Манай анги','Сурагчдын жагсаалт зөв эсэхийг шалгана.'],['Ирц','Өдрийн ирцийг бүртгэж хадгална.'],['Даалгавар','Хичээлийн даалгавар, хугацааг оруулна.'],['Мэдээлэл','Эцэг эхэд зарлал, ажиглалт хүргэнэ.']]},
    parent:{title:'Эцэг эх эхлэх дараалал',intro:'Хүүхдийн мэдээлэл, багшийн холбоог нэг дор ашиглана.',steps:[['Миний хүүхэд','Холбогдсон хүүхдийн мэдээллийг шалгана.'],['Даалгавар','Хугацаатай ажлуудыг нягтална.'],['Мэдээлэл','Сургуулийн шинэ зарлалтай танилцана.'],['Хөгжлийн түүх','Ирц, ажиглалт, ахицын түүхийг харна.']]}
  };
  function current(){return document.querySelector('.page.active')?.id||'owner'}
  function show(){
    const g=guides[current()]||guides.owner;
    document.getElementById('shHelpTitle').textContent=g.title;document.getElementById('shHelpIntro').textContent=g.intro;
    document.getElementById('shHelpSteps').innerHTML=g.steps.map((x,i)=>'<div class="shHelpStep"><span class="shHelpNum">'+(i+1)+'</span><div><b>'+x[0]+'</b><span>'+x[1]+'</span></div></div>').join('');
    modal.classList.remove('hidden');
  }
  function close(){modal.classList.add('hidden')}
  function install(){const top=document.querySelector('.top > div:last-child');if(top&&!document.getElementById('shHelpOpen'))top.prepend(button)}
  button.onclick=show;modal.querySelector('.shHelpClose').onclick=close;document.getElementById('shHelpDone').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
  setInterval(install,2200);setTimeout(install,450);
})();