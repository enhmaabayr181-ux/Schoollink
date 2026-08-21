let shTeacherSharingReady=false;
const SH_SHARE_MODULES=[
  ['announcements','Мэдээлэл'],['assignments','Даалгавар'],['attendance','Ирц'],['observations','Ажиглалт'],
  ['summaries','Сарын тайлан'],['calendar','Календарь'],['polls','Санал асуулга'],['permissions','Зөвшөөрөл']
];
function shShareEsc(v){return typeof esc==='function'?esc(v):String(v??'')}
function shShareFmt(v){if(!v)return '';try{return new Intl.DateTimeFormat('mn-MN',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}}
function shShareLabel(key){return SH_SHARE_MODULES.find(x=>x[0]===key)?.[1]||key}

async function shTeacherRenderSharing(){
  if(!session?.user||membership?.role!=='teacher')return;
  const section=$('teacher');if(!section)return;
  const {data:rows,error}=await sb.from('teacher_admin_view_grants').select('module,can_view').eq('school_id',membership.school_id).eq('teacher_id',session.user.id);
  if(error)throw error;
  const enabled=new Set((rows||[]).filter(x=>x.can_view).map(x=>x.module));
  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">БАГШ</span><h3>👁 Удирдлагад харах эрх</h3><p>Таны багшийн хэсгийг та өөрөө удирдана. Удирдлага зөвхөн таны зөвшөөрсөн төрлийн мэдээллийг харах боломжтой.</p></div><div class="card full"><div class="sectionTitle"><h3>Хуваалцах мэдээллээ сонгох</h3><span class="pill">READ ONLY</span></div><div class="shShareGrid">${SH_SHARE_MODULES.map(([key,label])=>`<label class="shShareToggle"><div><b>${shShareEsc(label)}</b><small>${enabled.has(key)?'Удирдлага харж болно':'Зөвхөн танд'}</small></div><input type="checkbox" data-sh-share="${key}" ${enabled.has(key)?'checked':''} onchange="shTeacherSetGrant('${key}',this.checked)"></label>`).join('')}</div><div id="shShareStatus" class="status"></div><div class="notice" style="margin-top:14px"><b>🔒 Чат хуваалцахгүй</b><p>Багш–эцэг эхийн private чат энэ тохиргоонд орохгүй. Удирдлага мессежийг засах, устгах, унших эрхгүй.</p></div></div></div>`;
  $('title').textContent='Харах эрх';
}
window.shTeacherRenderSharing=shTeacherRenderSharing;
window.shTeacherSetGrant=async(module,canView)=>{
  try{
    showStatus($('shShareStatus'),'Хадгалж байна…');
    const {error}=await sb.from('teacher_admin_view_grants').upsert({school_id:membership.school_id,teacher_id:session.user.id,module,can_view:!!canView,updated_at:new Date().toISOString()},{onConflict:'school_id,teacher_id,module'});
    if(error)throw error;
    showStatus($('shShareStatus'),canView?`${shShareLabel(module)} · удирдлагад харах эрх нээгдлээ ✅`:`${shShareLabel(module)} · харах эрх хаагдлаа 🔒`,'ok');
    setTimeout(shTeacherRenderSharing,450);
  }catch(e){showStatus($('shShareStatus'),e.message,'err')}
};

async function shAdminTeacherContext(){
  if(adminCtx?.teachers)return adminCtx;
  if(typeof apWorkflow==='function'){try{adminCtx=await apWorkflow({action:'context'});return adminCtx}catch{}}
  return {teachers:[]};
}
async function shAdminRenderShared(){
  if(!session?.user||membership?.role!=='admin')return;
  const section=$('admin');if(!section)return;
  const [{data:grants,error},ctx]=await Promise.all([
    sb.from('teacher_admin_view_grants').select('teacher_id,module,can_view,updated_at').eq('school_id',membership.school_id).eq('can_view',true),
    shAdminTeacherContext()
  ]);
  if(error)throw error;
  const teacherMap=new Map((ctx.teachers||[]).map(t=>[t.user_id,t]));
  const grouped=new Map();for(const g of grants||[]){if(!grouped.has(g.teacher_id))grouped.set(g.teacher_id,[]);grouped.get(g.teacher_id).push(g.module)}
  const teachers=[...grouped.keys()].map(id=>({id,name:teacherMap.get(id)?.full_name||'Багш',className:teacherMap.get(id)?.class?.name||'',modules:grouped.get(id)}));
  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">УДИРДЛАГА</span><h3>👁 Багшийн хуваалцсан мэдээлэл</h3><p>Энд зөвхөн багш өөрөө харах эрх нээсэн мэдээлэл харагдана. Засах, устгах боломжгүй.</p></div><div class="card narrow"><h3>Багш сонгох</h3>${teachers.length?teachers.map(t=>`<button class="mini actionMini tpFull" onclick="shAdminPickTeacher('${t.id}')"><b>${shShareEsc(t.name)}</b>${t.className?`<small> · ${shShareEsc(t.className)}</small>`:''}<div class="muted" style="margin-top:5px">${t.modules.map(shShareLabel).join(' · ')}</div></button>`).join(''):'<div class="empty">Одоогоор багш харах эрх нээгээгүй байна.</div>'}</div><div class="card wide" id="shAdminSharedDetail"><div class="empty">Багш сонгоно уу.</div></div></div>`;
  $('title').textContent='Багшийн хуваалцсан';
}
window.shAdminRenderShared=shAdminRenderShared;
window.shAdminPickTeacher=async teacherId=>{
  try{
    const detail=$('shAdminSharedDetail');if(!detail)return;
    detail.innerHTML='<div class="empty">Ачаалж байна…</div>';
    const [{data:grants,error},ctx]=await Promise.all([
      sb.from('teacher_admin_view_grants').select('module').eq('school_id',membership.school_id).eq('teacher_id',teacherId).eq('can_view',true),
      shAdminTeacherContext()
    ]);if(error)throw error;
    const t=(ctx.teachers||[]).find(x=>x.user_id===teacherId),mods=(grants||[]).map(x=>x.module);
    detail.innerHTML=`<div class="sectionTitle"><div><h3>${shShareEsc(t?.full_name||'Багш')}</h3><div class="muted">${shShareEsc(t?.class?.name||'')}</div></div><span class="pill">READ ONLY</span></div><div class="schoolActions" style="margin:12px 0">${mods.map(m=>`<button class="ghost" onclick="shAdminLoadSharedModule('${teacherId}','${m}')">${shShareEsc(shShareLabel(m))}</button>`).join('')}</div><div id="shAdminSharedRows" class="empty">Харах мэдээллийн төрлөө сонгоно уу.</div>`;
  }catch(e){$('shAdminSharedDetail').innerHTML=`<div class="status show err">${shShareEsc(e.message)}</div>`}
};

async function shAdminLoadSharedModule(teacherId,module){
  const out=$('shAdminSharedRows');if(!out)return;
  try{
    out.className='empty';out.textContent='Ачаалж байна…';
    const {data:grant,error:ge}=await sb.from('teacher_admin_view_grants').select('can_view').eq('school_id',membership.school_id).eq('teacher_id',teacherId).eq('module',module).maybeSingle();
    if(ge)throw ge;if(!grant?.can_view)throw new Error('Багш энэ мэдээллийн харах эрхийг хаасан байна.');
    let q,rows=[];
    if(module==='announcements')q=sb.from('announcements').select('title,body,kind,published_at,created_at').eq('school_id',membership.school_id).eq('author_id',teacherId).order('created_at',{ascending:false}).limit(30);
    if(module==='assignments')q=sb.from('assignments').select('subject,title,description,due_at,created_at').eq('school_id',membership.school_id).eq('teacher_id',teacherId).order('created_at',{ascending:false}).limit(30);
    if(module==='attendance')q=sb.from('attendance').select('attendance_date,status,note,marked_at,students(full_name)').eq('school_id',membership.school_id).eq('marked_by',teacherId).order('attendance_date',{ascending:false}).limit(80);
    if(module==='observations')q=sb.from('student_observations').select('subject,category,status,note,next_step,observed_at,students(full_name)').eq('school_id',membership.school_id).eq('created_by',teacherId).order('observed_at',{ascending:false}).limit(50);
    if(module==='summaries')q=sb.from('observation_monthly_summaries').select('month_start,summary_text,support_plan,updated_at,students(full_name)').eq('school_id',membership.school_id).eq('generated_by',teacherId).order('month_start',{ascending:false}).limit(30);
    if(module==='calendar')q=sb.from('school_events').select('title,description,event_type,starts_at,location,created_at').eq('school_id',membership.school_id).eq('created_by',teacherId).order('starts_at',{ascending:false}).limit(30);
    if(module==='polls')q=sb.from('school_polls').select('title,description,closes_at,created_at').eq('school_id',membership.school_id).eq('created_by',teacherId).order('created_at',{ascending:false}).limit(30);
    if(module==='permissions')q=sb.from('permissions').select('title,description,due_at,created_at').eq('school_id',membership.school_id).eq('created_by',teacherId).order('created_at',{ascending:false}).limit(30);
    if(!q)throw new Error('Модуль олдсонгүй.');const res=await q;if(res.error)throw res.error;rows=res.data||[];
    const html=rows.map(r=>{
      let title='',meta='',body='';
      if(module==='announcements'){title=r.title;meta=`${r.kind||''} · ${shShareFmt(r.published_at||r.created_at)}`;body=r.body||''}
      if(module==='assignments'){title=`${r.subject||''} · ${r.title||''}`;meta=r.due_at?'Хугацаа: '+shShareFmt(r.due_at):shShareFmt(r.created_at);body=r.description||''}
      if(module==='attendance'){title=`${r.students?.full_name||'Сурагч'} · ${r.status||''}`;meta=r.attendance_date||'';body=r.note||''}
      if(module==='observations'){title=`${r.students?.full_name||'Сурагч'} · ${r.subject||''}`;meta=`${r.category||''} · ${r.status||''} · ${shShareFmt(r.observed_at)}`;body=`${r.note||''}${r.next_step?' · Дараагийн алхам: '+r.next_step:''}`}
      if(module==='summaries'){title=`${r.students?.full_name||'Сурагч'} · ${r.month_start||''}`;meta=shShareFmt(r.updated_at);body=`${r.summary_text||''}${r.support_plan?' · Дэмжлэг: '+r.support_plan:''}`}
      if(module==='calendar'){title=r.title;meta=`${r.event_type||''} · ${shShareFmt(r.starts_at)}${r.location?' · '+r.location:''}`;body=r.description||''}
      if(module==='polls'){title=r.title;meta=r.closes_at?'Хаагдах: '+shShareFmt(r.closes_at):shShareFmt(r.created_at);body=r.description||''}
      if(module==='permissions'){title=r.title;meta=r.due_at?'Хугацаа: '+shShareFmt(r.due_at):shShareFmt(r.created_at);body=r.description||''}
      return `<div class="notice"><b>${shShareEsc(title)}</b><p class="muted">${shShareEsc(meta)}</p>${body?`<p>${shShareEsc(body)}</p>`:''}</div>`;
    }).join('');
    out.className=rows.length?'list':'empty';out.innerHTML=rows.length?`<div class="sectionTitle"><h3>${shShareEsc(shShareLabel(module))}</h3><span class="pill">${rows.length} бичлэг</span></div>${html}`:'Хуваалцсан мэдээлэл одоогоор алга.';
  }catch(e){out.className='status show err';out.textContent=e.message}
}
window.shAdminLoadSharedModule=shAdminLoadSharedModule;

function shBindTeacherSharingNav(){
  if(!$('nav')||!membership)return;
  if(membership.role==='teacher'){
    let b=$('shTeacherShareNav');if(!b){b=document.createElement('button');b.id='shTeacherShareNav';b.textContent='Харах эрх';$('nav').appendChild(b)}
    b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shTeacherRenderSharing()};
  }
  if(membership.role==='admin'){
    let b=$('shAdminSharedNav');if(!b){b=document.createElement('button');b.id='shAdminSharedNav';b.textContent='Багшийн хуваалцсан';$('nav').appendChild(b)}
    b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shAdminRenderShared()};
  }
}
function shTeacherSharingInit(){if(shTeacherSharingReady)return;shTeacherSharingReady=true;const prev=setRole;setRole=function(role){prev(role);setTimeout(shBindTeacherSharingNav,80)};const obs=new MutationObserver(()=>setTimeout(shBindTeacherSharingNav,0));if($('nav'))obs.observe($('nav'),{childList:true});setInterval(shBindTeacherSharingNav,1600);const style=document.createElement('style');style.textContent=`.shShareGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.shShareToggle{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px;border:1px solid var(--line);border-radius:16px;background:#fff}.shShareToggle small{display:block;color:var(--muted);margin-top:4px}.shShareToggle input{width:22px;height:22px}@media(max-width:700px){.shShareGrid{grid-template-columns:1fr}}`;document.head.appendChild(style);setTimeout(shBindTeacherSharingNav,500)}
setTimeout(shTeacherSharingInit,0);
