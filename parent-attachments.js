// SchoolHub assignment attachment experience
// Inline image previews for teacher/parent + teacher-owned attachment deletion.

function paFileIcon(mime=''){
  return mime.startsWith('image/')?'🖼️':mime.includes('pdf')?'📕':mime.includes('word')?'📘':mime.includes('sheet')||mime.includes('excel')?'📗':mime.includes('presentation')?'📙':mime.includes('text')?'📄':'📎';
}
function paFileSize(n){if(!n)return '';if(n<1024)return `${n} B`;if(n<1024*1024)return `${Math.round(n/102.4)/10} KB`;return `${Math.round(n/1024/102.4)/10} MB`}
function paEnc(v){return encodeURIComponent(String(v||''))}

async function paSignedUrl(path){
  const {data,error}=await sb.storage.from('assignment-files').createSignedUrl(path,3600);
  if(error)throw error;
  return data.signedUrl;
}
window.paOpenFile=async function(path){try{window.open(await paSignedUrl(path),'_blank','noopener')}catch(e){alert('Файл нээхэд алдаа гарлаа: '+(e.message||e))}};

function paEnsurePreviewModal(){
  if(document.getElementById('paPreviewModal'))return;
  const modal=document.createElement('div');modal.id='paPreviewModal';modal.className='modal hidden';
  modal.innerHTML=`<div class="modalCard paPreviewCard"><div class="modalTop"><div><div class="muted">ХАВСРАЛТ</div><h3 id="paPreviewTitle">Зураг</h3></div><button class="close" onclick="paClosePreview()">×</button></div><div class="paPreviewStage"><img id="paPreviewImage" alt="Хавсралтын зураг"></div></div>`;
  modal.addEventListener('click',e=>{if(e.target===modal)window.paClosePreview()});document.body.appendChild(modal);
}
window.paClosePreview=function(){document.getElementById('paPreviewModal')?.classList.add('hidden')};
window.paOpenImage=async function(path,name='Зураг'){
  try{paEnsurePreviewModal();const modal=document.getElementById('paPreviewModal'),img=document.getElementById('paPreviewImage');document.getElementById('paPreviewTitle').textContent=name||'Зураг';img.removeAttribute('src');modal.classList.remove('hidden');img.src=await paSignedUrl(path)}catch(e){paClosePreview();alert('Зураг нээхэд алдаа гарлаа: '+(e.message||e))}
};

async function paHydrateImages(root=document){
  const imgs=[...root.querySelectorAll('img[data-pa-img]:not([data-pa-ready])')];
  await Promise.all(imgs.map(async img=>{img.dataset.paReady='1';try{img.src=await paSignedUrl(decodeURIComponent(img.dataset.paImg||''))}catch{img.closest('.paImageTile')?.classList.add('paPreviewError')}}));
}

function paAttachmentHtml(f,{teacher=false}={}){
  const path=String(f.file_path||''),name=String(f.file_name||'Файл'),mime=String(f.mime_type||''),encPath=paEnc(path),encName=paEnc(name),size=paFileSize(f.file_size);
  if(mime.startsWith('image/')){
    return `<div class="paImageTile"><button class="paImageOpen" onclick="paOpenImage(decodeURIComponent('${encPath}'),decodeURIComponent('${encName}'))" title="Томоор үзэх"><img data-pa-img="${encPath}" alt="${esc(name)}"><span class="paImageShade">🔎 Томоор үзэх</span></button><div class="paAttachMeta"><div><b>🖼️ ${esc(name)}</b>${size?`<small>${size}</small>`:''}</div>${teacher?`<button class="paDelete" onclick="tpDeleteAttachment('${f.id}',decodeURIComponent('${encPath}'))">🗑 Устгах</button>`:''}</div></div>`;
  }
  return `<div class="paFileTile"><button class="paFileOpen" onclick="paOpenFile(decodeURIComponent('${encPath}'))"><span class="paFileIcon">${paFileIcon(mime)}</span><span><b>${esc(name)}</b><small>${size||'Нээж үзэх'}</small></span></button>${teacher?`<button class="paDelete" onclick="tpDeleteAttachment('${f.id}',decodeURIComponent('${encPath}'))">🗑</button>`:''}</div>`;
}

window.tpDeleteAttachment=async function(id,path){
  if(!confirm('Энэ хавсралтыг устгах уу?'))return;
  try{
    const {error:metaErr}=await sb.from('assignment_attachments').delete().eq('id',id).eq('uploader_user_id',session.user.id);
    if(metaErr)throw metaErr;
    const {error:fileErr}=await sb.storage.from('assignment-files').remove([path]);
    if(fileErr)console.warn('Attachment storage cleanup:',fileErr.message||fileErr);
    if(typeof teacherCurrentView!=='undefined'&&teacherCurrentView==='Даалгавар'&&typeof tpRenderAssignments==='function')await tpRenderAssignments();
    else if(typeof loadTeacherDashboard==='function')await loadTeacherDashboard();
  }catch(e){alert('Хавсралт устгахад алдаа гарлаа: '+(e.message||e))}
};

// Full teacher assignment view with richer attachments.
if(typeof tpRenderAssignments==='function'){
  tpRenderAssignments=async function(){
    const c=await tpContext();
    const {data:rows,error}=await sb.from('assignments').select('*').eq('school_id',membership.school_id).eq('class_id',c.class.id).eq('teacher_id',session.user.id).order('created_at',{ascending:false});
    if(error)throw error;
    const ids=(rows||[]).map(x=>x.id);
    const {data:atts,error:attErr}=ids.length?await sb.from('assignment_attachments').select('*').in('assignment_id',ids).order('created_at'):{data:[],error:null};
    if(attErr)throw attErr;
    const by=new Map();(atts||[]).forEach(a=>{if(!by.has(a.assignment_id))by.set(a.assignment_id,[]);by.get(a.assignment_id).push(a)});
    tpLayout('Даалгавар','Файл, зурагтай даалгавар үүсгэж эцэг эхэд хүргэнэ.',`<div class="card full"><div class="sectionTitle"><h3>Даалгаврууд</h3><button class="btn primary" onclick="openAssignmentModal()">＋ Шинэ даалгавар</button></div>${rows?.length?rows.map(a=>{const fs=by.get(a.id)||[];return `<div class="notice paAssignment"><b>${tpEsc(a.subject)} · ${tpEsc(a.title)}</b><p>${a.description?tpEsc(a.description)+' · ':''}${a.due_at?'Дуусах: '+tpFmt(a.due_at):'Хугацаагүй'}</p>${fs.length?`<div class="paAttachmentGrid">${fs.map(f=>paAttachmentHtml(f,{teacher:true})).join('')}</div>`:'<span class="muted">Хавсралтгүй</span>'}</div>`}).join(''):'<div class="empty">Даалгавар алга.</div>'}</div>`);
    await paHydrateImages(document.getElementById('teacher')||document);
  };
}

// Enhance recent teacher assignments on home dashboard without touching the base data loader.
const paBaseTeacherDashboard=typeof loadTeacherDashboard==='function'?loadTeacherDashboard:null;
if(paBaseTeacherDashboard){
  loadTeacherDashboard=async function(){
    await paBaseTeacherDashboard();
    try{
      if(!teacherData?.assignments?.length||!$('teacherAssignments'))return;
      const ids=teacherData.assignments.map(a=>a.id),{data:atts,error}=await sb.from('assignment_attachments').select('*').in('assignment_id',ids).order('created_at');if(error)throw error;
      const by=new Map();(atts||[]).forEach(a=>{if(!by.has(a.assignment_id))by.set(a.assignment_id,[]);by.get(a.assignment_id).push(a)});
      $('teacherAssignments').innerHTML=teacherData.assignments.map(a=>{const fs=by.get(a.id)||[];return `<div class="notice paAssignment"><b>${esc(a.subject)} · ${esc(a.title)}</b><p>${a.due_at?'Дуусах: '+tpFmt(a.due_at):'Хугацаагүй'}${a.description?' · '+esc(a.description):''}</p>${fs.length?`<div class="paAttachmentGrid compact">${fs.map(f=>paAttachmentHtml(f,{teacher:true})).join('')}</div>`:''}</div>`}).join('');
      await paHydrateImages($('teacherAssignments'));
    }catch(e){console.warn('Teacher attachment render',e)}
  };
}

// Parent assignment rendering with inline image previews.
async function paDecorateAssignments(){
  try{
    if(!parentData?.assignments?.length||!$('parentAssignments'))return;
    const ids=parentData.assignments.map(a=>a.id),{data:atts,error}=await sb.from('assignment_attachments').select('*').in('assignment_id',ids).order('created_at');if(error)throw error;
    const by=new Map();(atts||[]).forEach(a=>{if(!by.has(a.assignment_id))by.set(a.assignment_id,[]);by.get(a.assignment_id).push(a)});
    $('parentAssignments').className=parentData.assignments.length?'list':'empty';
    $('parentAssignments').innerHTML=parentData.assignments.map(a=>{const fs=by.get(a.id)||[];return `<div class="notice paAssignment"><b>${esc(a.subject)} · ${esc(a.title)}</b><p>${a.due_at?'Дуусах: '+parentFmtDate(a.due_at):''}${a.description?' · '+esc(a.description):''}</p>${fs.length?`<div class="paAttachmentGrid">${fs.map(f=>paAttachmentHtml(f)).join('')}</div>`:''}</div>`}).join('');
    await paHydrateImages($('parentAssignments'));
  }catch(e){console.warn('Parent attachment render',e)}
}
const paBaseLoadParent=typeof loadParentDashboard==='function'?loadParentDashboard:null;
if(paBaseLoadParent){loadParentDashboard=async function(studentId=null){await paBaseLoadParent(studentId);await paDecorateAssignments()}}
setTimeout(()=>{if(typeof currentRole!=='undefined'&&currentRole==='parent'&&membership)paDecorateAssignments()},300);

(function paAddStyles(){
  const style=document.createElement('style');style.id='paAttachmentStyles';style.textContent=`
  .paAttachmentGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px}.paAttachmentGrid.compact{grid-template-columns:repeat(auto-fit,minmax(150px,220px))}
  .paImageTile,.paFileTile{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff}.paImageOpen{display:block;width:100%;padding:0;border:0;background:#f5f3ff;cursor:pointer;position:relative}.paImageOpen img{display:block;width:100%;height:140px;object-fit:cover}.paImageShade{position:absolute;right:8px;bottom:8px;background:rgba(25,20,45,.72);color:#fff;border-radius:999px;padding:5px 8px;font-size:11px}.paAttachMeta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px}.paAttachMeta b{display:block;font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.paAttachMeta small,.paFileOpen small{display:block;color:var(--muted);margin-top:3px}.paDelete{border:0;background:#fff0f1;color:#a32c39;border-radius:10px;padding:7px 9px;cursor:pointer;flex:none}.paFileTile{display:flex;align-items:center;padding:8px}.paFileOpen{border:0;background:transparent;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;min-width:0;flex:1;padding:3px}.paFileOpen b{display:block;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.paFileIcon{font-size:28px}.paPreviewCard{max-width:min(900px,94vw)}.paPreviewStage{background:#111;border-radius:18px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:240px;max-height:72vh}.paPreviewStage img{max-width:100%;max-height:72vh;object-fit:contain}.paPreviewError{opacity:.55}
  @media(max-width:600px){.paAttachmentGrid,.paAttachmentGrid.compact{grid-template-columns:1fr 1fr}.paImageOpen img{height:120px}.paFileOpen b{max-width:115px}}
  `;document.head.appendChild(style);
})();
