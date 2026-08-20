let adminProReady=false,adminCtx=null;

function apFmt(v){if(!v)return '';try{return new Date(v).toLocaleString('mn-MN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return String(v)}}
function apStatusText(sub){if(!sub)return 'Эрх идэвхгүй';if(sub.status==='trialing')return `Trial · ${sub.trial_ends_at?apFmt(sub.trial_ends_at):''}`;if(sub.status==='active')return `Идэвхтэй · ${sub.plan||''}`;return sub.status||'—'}
async function apWorkflow(body){const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body});if(error)throw new Error(error.message||'School workflow алдаа');if(data?.error)throw new Error(data.error);return data}

async function loadAdminDashboard(){
 if(!session||!membership||membership.role!=='admin')return;
 try{
  const ctx=await apWorkflow({action:'context'});adminCtx=ctx;
  const schoolId=membership.school_id,classes=ctx.classes||[],teachers=ctx.teachers||[];
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const [{data:students,error:se},{data:attendance,error:ae},{data:announcements,error:ne},{data:assignments,error:ase}]=await Promise.all([
    sb.from('students').select('id,class_id,full_name,active').eq('school_id',schoolId).eq('active',true),
    sb.from('attendance').select('student_id,status,date').eq('school_id',schoolId).eq('date',today),
    sb.from('announcements').select('id,title,kind,created_at,class_id').eq('school_id',schoolId).order('created_at',{ascending:false}).limit(6),
    sb.from('assignments').select('id,title,subject,created_at,class_id,teacher_id').eq('school_id',schoolId).order('created_at',{ascending:false}).limit(6)
  ]);if(se||ae||ne||ase)throw se||ae||ne||ase;
  const present=(attendance||[]).filter(x=>x.status==='present').length,attention=(attendance||[]).filter(x=>x.status==='absent'||x.status==='late').length;
  const assigned=classes.filter(c=>c.homeroom_teacher_id).length;
  const teacherMap=new Map(teachers.map(t=>[t.user_id,t]));
  $('admin').innerHTML=`<div class="grid">
   <div class="card hero full"><span class="pill">УДИРДЛАГА</span><h3>${esc(ctx.school?.name||'Сургууль')}</h3><p>Багш, анги, сурагч, ирц болон сургуулийн идэвхийг нэг дороос удирдана.</p></div>
   <div class="card full"><div class="metricGrid"><div class="metric"><span>Анги</span><b>${classes.length}</b></div><div class="metric"><span>Багш</span><b>${teachers.length}</b></div><div class="metric"><span>Сурагч</span><b>${(students||[]).length}</b></div><div class="metric"><span>Ирсэн</span><b>${present}</b></div><div class="metric"><span>Анхаарах</span><b>${attention}</b></div><div class="metric"><span>Багштай анги</span><b>${assigned}/${classes.length}</b></div></div></div>
   <div class="card narrow"><div class="sectionTitle"><h3>SchoolLink эрх</h3><span class="demoTag">LIVE</span></div><div class="notice"><b>${esc(apStatusText(ctx.subscription))}</b><p>${ctx.access_open?'Систем ашиглах эрх нээлттэй ✅':'Owner эрх нээгээгүй байна 🔒'}</p></div></div>
   <div class="card wide"><div class="sectionTitle"><h3>Багшийн урилга</h3></div><label>Анги</label><select id="apInviteClass">${classes.length?classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(''):'<option value="">Эхлээд анги нэмнэ үү</option>'}</select><button class="btn primary" style="width:100%;margin-top:12px" onclick="apCreateTeacherInvite()">＋ Багшийн урилга үүсгэх</button><div id="apInviteStatus" class="status"></div><div id="apInviteCode" class="codeBox hidden"></div></div>
   <div class="card full"><div class="sectionTitle"><h3>Анги ба багш</h3><button class="ghost" onclick="loadAdminDashboard()">↻ Шинэчлэх</button></div>${classes.length?classes.map(c=>`<div class="ownerSchool"><div><h4>${esc(c.name)}</h4><div class="muted">${esc(c.academic_year||'')} ${c.grade?`· ${c.grade}-р анги`:''}</div></div><div class="schoolActions"><select onchange="apAssignTeacher('${c.id}',this.value)"><option value="">Багшгүй</option>${teachers.map(t=>`<option value="${t.user_id}" ${c.homeroom_teacher_id===t.user_id?'selected':''}>${esc(t.full_name||'Багш')}</option>`).join('')}</select></div></div>`).join(''):'<div class="empty">Анги алга.</div>'}</div>
   <div class="card wide"><div class="sectionTitle"><h3>Багш нар</h3></div>${teachers.length?teachers.map(t=>`<div class="row"><div><b>${esc(t.full_name||'Багш')}</b><small> · ${esc(t.class?.name||'Анги оноогоогүй')}</small></div><span class="pill">Идэвхтэй</span></div>`).join(''):'<div class="empty">Багш алга.</div>'}</div>
   <div class="card narrow"><div class="sectionTitle"><h3>Өнөөдрийн ирц</h3></div><div class="quickGrid"><div class="quickItem mint"><small>Ирсэн</small><b>${present}</b></div><div class="quickItem rose"><small>Хоцорсон/тасалсан</small><b>${attention}</b></div></div></div>
   <div class="card wide"><div class="sectionTitle"><h3>Сүүлийн мэдээлэл</h3></div>${announcements?.length?announcements.map(a=>`<div class="notice"><b>${esc(a.title)}</b><p>${esc(a.kind)} · ${apFmt(a.created_at)}</p></div>`).join(''):'<div class="empty">Мэдээлэл алга.</div>'}</div>
   <div class="card narrow"><div class="sectionTitle"><h3>Сүүлийн даалгавар</h3></div>${assignments?.length?assignments.map(a=>`<div class="notice"><b>${esc(a.subject)} · ${esc(a.title)}</b><p>${apFmt(a.created_at)}</p></div>`).join(''):'<div class="empty">Даалгавар алга.</div>'}</div>
  </div>`;
 }catch(e){$('admin').innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${esc(e.message)}</div></div></div>`}
}

window.apCreateTeacherInvite=async()=>{try{const classId=$('apInviteClass').value;if(!classId)throw new Error('Анги сонгоно уу.');showStatus($('apInviteStatus'),'Урилга үүсгэж байна…');const d=await onboardingCall({action:'create_invite',role:'teacher',class_id:classId,expires_hours:168,max_uses:1});showStatus($('apInviteStatus'),'Багшийн урилгын код бэлэн ✅','ok');$('apInviteCode').textContent=d.code;$('apInviteCode').classList.remove('hidden')}catch(e){showStatus($('apInviteStatus'),e.message,'err')}};

window.apAssignTeacher=async(classId,userId)=>{try{const value=userId||null;const {error}=await sb.from('classes').update({homeroom_teacher_id:value}).eq('id',classId).eq('school_id',membership.school_id);if(error)throw error;await loadAdminDashboard()}catch(e){alert('Багш оноох алдаа: '+e.message)}};

function apInit(){if(adminProReady)return;adminProReady=true;const prev=setRole;setRole=function(role){prev(role);if(role==='admin')setTimeout(loadAdminDashboard,0)};if(currentRole==='admin')setTimeout(loadAdminDashboard,0)}
setTimeout(apInit,0);
