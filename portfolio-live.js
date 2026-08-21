let shPortfolioReady=false;

function shPfEsc(v){return typeof esc==='function'?esc(v):String(v??'')}
function shPfFmt(v){if(!v)return '';try{return new Intl.DateTimeFormat('mn-MN',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}}
function shPfCategoryLabel(v){return ({achievement:'🏆 Амжилт',work:'🎨 Бүтээл',photo:'📷 Зураг',progress:'🌱 Ахиц',other:'📌 Бусад'})[v]||'🌱 Ахиц'}
function shPfLocalInputNow(){
  try{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const m=Object.fromEntries(p.map(x=>[x.type,x.value]));return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}`}catch{return ''}
}
function shPfFileIcon(mime=''){return mime.startsWith('image/')?'🖼️':mime.includes('pdf')?'📕':mime.includes('word')?'📘':mime.includes('text')?'📄':'📎'}
function shPfSafePath(v){return String(v||'').replaceAll("'","\\'")}

async function shPfTeacherContext(){
  if(typeof tpContext==='function')return await tpContext();
  return {class:teacherData?.cls||null,students:teacherData?.students||[]};
}
async function shPfParentChild(){
  if(parentData?.child)return parentData.child;
  if(typeof loadParentDashboard==='function'){try{await loadParentDashboard()}catch{}}
  return parentData?.child||null;
}
async function shPfSignedUrl(path){const {data,error}=await sb.storage.from('portfolio-files').createSignedUrl(path,3600);if(error)throw error;return data.signedUrl}
window.shPfOpenFile=async path=>{try{const url=await shPfSignedUrl(path);window.open(url,'_blank','noopener')}catch(e){alert('Файл нээхэд алдаа гарлаа: '+e.message)}};
async function shPfHydrateImages(){
  const imgs=[...document.querySelectorAll('img[data-sh-pf-path]')];
  await Promise.all(imgs.map(async img=>{try{img.src=await shPfSignedUrl(img.dataset.shPfPath)}catch{img.closest('.shPfMedia')?.classList.add('hidden')}}));
}

async function shRenderPortfolio(){
  if(!session?.user||!membership)return;
  if(membership.role==='teacher')return shPfRenderTeacher();
  if(membership.role==='parent')return shPfRenderParent();
}
window.shRenderPortfolio=shRenderPortfolio;

async function shPfRenderTeacher(){
  const section=$('teacher');if(!section)return;
  try{
    const c=await shPfTeacherContext(),students=c.students||[];
    if(!c.class)throw new Error('Багшид анги оноогоогүй байна.');
    const {data:rows,error}=await sb.from('student_portfolio_items').select('*').eq('school_id',membership.school_id).eq('created_by',session.user.id).order('occurred_at',{ascending:false}).limit(100);if(error)throw error;
    const studentMap=new Map(students.map(s=>[s.id,s]));
    const studentOptions=students.map(s=>`<option value="${s.id}">${shPfEsc(s.full_name)}</option>`).join('');
    const cards=(rows||[]).map(r=>shPfTeacherCard(r,studentMap.get(r.student_id)?.full_name||'Сурагч')).join('');
    section.innerHTML=`<div class="grid">
      <div class="card hero full"><span class="pill">БАГШ</span><h3>🌱 Сурагчийн Portfolio</h3><p>Хүүхдийн бүтээл, зураг, ахиц, амжилтыг нэг timeline-д хадгална.</p></div>
      <div class="card narrow"><h3>＋ Шинэ portfolio</h3><label>Сурагч</label><select id="shPfStudent">${studentOptions||'<option value="">Сурагч алга</option>'}</select><label>Төрөл</label><select id="shPfCategory"><option value="progress">🌱 Ахиц</option><option value="achievement">🏆 Амжилт</option><option value="work">🎨 Бүтээл</option><option value="photo">📷 Зураг</option><option value="other">📌 Бусад</option></select><label>Гарчиг</label><input id="shPfTitle" placeholder="Жишээ: Өөрөө уншиж эхэллээ"><label>Тэмдэглэл</label><textarea id="shPfNote" class="tpTextarea" placeholder="Ахиц, ажигласан зүйл, тайлбар…"></textarea><label>Огноо</label><input id="shPfWhen" type="datetime-local" value="${shPfLocalInputNow()}"><label>Зураг / файл</label><input id="shPfFile" type="file" accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.txt"><div class="muted" style="font-size:12px;margin-top:5px">20MB хүртэл. Зураг, PDF, Word, TXT.</div><label class="shPfCheck"><input id="shPfParent" type="checkbox" style="width:auto"> Эцэг эхэд харуулах</label><button class="btn primary tpFull" onclick="shPfSave()">Portfolio-д нэмэх</button><div id="shPfStatus" class="status"></div></div>
      <div class="card wide"><div class="sectionTitle"><h3>Ахицын timeline</h3><span class="pill">${rows?.length||0}</span></div><div id="shPfTeacherList">${rows?.length?cards:'<div class="empty">Portfolio бичлэг алга.</div>'}</div></div>
    </div>`;
    $('title').textContent='Portfolio';
    setTimeout(shPfHydrateImages,0);
  }catch(e){section.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${shPfEsc(e.message)}</div></div></div>`}
}
function shPfTeacherCard(r,studentName){
  const image=r.file_path&&String(r.mime_type||'').startsWith('image/');
  return `<div class="notice shPfItem"><div class="sectionTitle"><div><b>${shPfEsc(studentName)} · ${shPfEsc(r.title)}</b><div class="muted" style="margin-top:4px">${shPfCategoryLabel(r.category)} · ${shPfFmt(r.occurred_at)}</div></div><span class="pill">${r.visible_to_parent?'👨‍👩‍👧 Эцэг эхэд':'🔒 Private'}</span></div>${r.note?`<p>${shPfEsc(r.note)}</p>`:''}${image?`<div class="shPfMedia"><img data-sh-pf-path="${shPfEsc(r.file_path)}" alt="${shPfEsc(r.title)}" onclick="shPfOpenFile('${shPfSafePath(r.file_path)}')"></div>`:r.file_path?`<button class="ghost shPfFile" onclick="shPfOpenFile('${shPfSafePath(r.file_path)}')">${shPfFileIcon(r.mime_type)} ${shPfEsc(r.file_name||'Файл')}</button>`:''}<div class="schoolActions" style="margin-top:10px"><button class="ghost" onclick="shPfToggleParent('${r.id}',${r.visible_to_parent?'false':'true'})">${r.visible_to_parent?'🔒 Эцэг эхээс нуух':'👨‍👩‍👧 Эцэг эхэд харуулах'}</button><button class="ghost" onclick="shPfDelete('${r.id}','${shPfSafePath(r.file_path||'')}')">🗑 Устгах</button></div></div>`
}
window.shPfSave=async()=>{
  const status=$('shPfStatus');
  try{
    const c=await shPfTeacherContext(),studentId=$('shPfStudent')?.value,title=$('shPfTitle')?.value.trim();
    if(!studentId)throw new Error('Сурагч сонгоно уу.');if(!title)throw new Error('Гарчиг оруулна уу.');
    showStatus(status,'Хадгалж байна…');
    const {data:item,error}=await sb.from('student_portfolio_items').insert({school_id:membership.school_id,class_id:c.class.id,student_id:studentId,created_by:session.user.id,title,note:$('shPfNote').value.trim()||null,category:$('shPfCategory').value,visible_to_parent:$('shPfParent').checked,occurred_at:$('shPfWhen').value?new Date($('shPfWhen').value).toISOString():new Date().toISOString()}).select('*').single();if(error)throw error;
    const file=$('shPfFile')?.files?.[0];
    if(file){
      if(file.size>20*1024*1024){await sb.from('student_portfolio_items').delete().eq('id',item.id);throw new Error('Файл 20MB-аас их байна.');}
      const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_'),path=`${membership.school_id}/${session.user.id}/${item.id}/${Date.now()}_${safe}`;
      const {error:ue}=await sb.storage.from('portfolio-files').upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});if(ue){await sb.from('student_portfolio_items').delete().eq('id',item.id);throw ue}
      const {error:me}=await sb.from('student_portfolio_items').update({file_path:path,file_name:file.name,mime_type:file.type||null,file_size:file.size,updated_at:new Date().toISOString()}).eq('id',item.id);if(me){await sb.storage.from('portfolio-files').remove([path]);await sb.from('student_portfolio_items').delete().eq('id',item.id);throw me}
    }
    showStatus(status,'Portfolio-д нэмэгдлээ ✅','ok');await shPfRenderTeacher();
  }catch(e){showStatus(status,e.message,'err')}
};
window.shPfToggleParent=async(id,visible)=>{try{const {error}=await sb.from('student_portfolio_items').update({visible_to_parent:!!visible,updated_at:new Date().toISOString()}).eq('id',id).eq('created_by',session.user.id);if(error)throw error;await shPfRenderTeacher()}catch(e){alert(e.message)}};
window.shPfDelete=async(id,path)=>{if(!confirm('Энэ portfolio бичлэгийг устгах уу?'))return;try{if(path)await sb.storage.from('portfolio-files').remove([path]);const {error}=await sb.from('student_portfolio_items').delete().eq('id',id).eq('created_by',session.user.id);if(error)throw error;await shPfRenderTeacher()}catch(e){alert(e.message)}};

async function shPfRenderParent(){
  const section=$('parent');if(!section)return;
  try{
    const child=await shPfParentChild();if(!child)throw new Error('Хүүхдийн мэдээлэл олдсонгүй.');
    const {data:rows,error}=await sb.from('student_portfolio_items').select('*').eq('school_id',membership.school_id).eq('student_id',child.id).eq('visible_to_parent',true).order('occurred_at',{ascending:false}).limit(100);if(error)throw error;
    const cards=(rows||[]).map(r=>{const image=r.file_path&&String(r.mime_type||'').startsWith('image/');return `<div class="shPfTimelineItem"><div class="shPfDot"></div><div class="notice"><div class="sectionTitle"><b>${shPfEsc(r.title)}</b><span class="pill">${shPfCategoryLabel(r.category)}</span></div><div class="muted">${shPfFmt(r.occurred_at)}</div>${r.note?`<p>${shPfEsc(r.note)}</p>`:''}${image?`<div class="shPfMedia"><img data-sh-pf-path="${shPfEsc(r.file_path)}" alt="${shPfEsc(r.title)}" onclick="shPfOpenFile('${shPfSafePath(r.file_path)}')"></div>`:r.file_path?`<button class="ghost shPfFile" onclick="shPfOpenFile('${shPfSafePath(r.file_path)}')">${shPfFileIcon(r.mime_type)} ${shPfEsc(r.file_name||'Файл')}</button>`:''}</div></div>`}).join('');
    section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">ЭЦЭГ ЭХ</span><h3>🌱 ${shPfEsc(child.full_name)} · Ахицын түүх</h3><p>Багшийн тантай хуваалцсан бүтээл, зураг, амжилт, ахиц нэг дор.</p></div><div class="card full"><div class="sectionTitle"><h3>Portfolio timeline</h3><span class="pill">${rows?.length||0}</span></div><div class="shPfTimeline">${rows?.length?cards:'<div class="empty">Багш одоогоор portfolio бичлэг хуваалцаагүй байна.</div>'}</div></div></div>`;
    $('title').textContent='Portfolio';setTimeout(shPfHydrateImages,0);
  }catch(e){section.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${shPfEsc(e.message)}</div></div></div>`}
}

function shPfBindNav(){
  if(!$('nav')||!membership||!['teacher','parent'].includes(membership.role))return;
  let b=$('shPortfolioNav');if(!b){b=document.createElement('button');b.id='shPortfolioNav';b.textContent='Portfolio';$('nav').appendChild(b)}
  b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shRenderPortfolio()};
}
function shPortfolioInit(){
  if(shPortfolioReady)return;shPortfolioReady=true;
  const prev=setRole;setRole=function(role){prev(role);setTimeout(shPfBindNav,70)};
  const obs=new MutationObserver(()=>setTimeout(shPfBindNav,0));if($('nav'))obs.observe($('nav'),{childList:true});
  setInterval(shPfBindNav,1600);setTimeout(shPfBindNav,500);
  const style=document.createElement('style');style.textContent=`.shPfCheck{display:flex;gap:8px;align-items:center;margin-top:12px}.shPfItem{margin-bottom:12px}.shPfMedia{margin-top:10px;border-radius:16px;overflow:hidden;background:#f3f2f8;max-height:320px}.shPfMedia img{display:block;width:100%;max-height:320px;object-fit:cover;cursor:pointer}.shPfFile{margin-top:10px}.shPfTimeline{position:relative;padding-left:20px}.shPfTimeline:before{content:'';position:absolute;left:6px;top:8px;bottom:8px;width:2px;background:#e5e2f3}.shPfTimelineItem{position:relative;margin-bottom:14px}.shPfDot{position:absolute;left:-20px;top:19px;width:14px;height:14px;border-radius:50%;background:#6d5dfc;border:3px solid #fff;box-shadow:0 0 0 1px #d7d2f5}.shPfTimelineItem .notice{margin:0}`;document.head.appendChild(style);
}
setTimeout(shPortfolioInit,0);
