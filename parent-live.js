let parentData=null;

function parentStatusLabel(status){return ({present:'Ирсэн',absent:'Тасалсан',late:'Хоцорсон',excused:'Чөлөөтэй'})[status]||'Бүртгээгүй'}
function parentStatusClass(status){return status==='present'?'mint':status==='late'?'blue':status==='absent'?'rose':''}
function parentFmtDate(v){if(!v)return '';try{return new Date(v).toLocaleString('mn-MN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return String(v)}}

function renderParentShell(){
  const section=document.getElementById('parent');
  if(!section)return;
  section.innerHTML=`<div class="grid">
    <div class="card hero"><span class="pill">ЭЦЭГ ЭХ</span><h3 id="parentHeroTitle">Хүүхдийн мэдээлэл нэг дор.</h3><p id="parentHeroMeta">Бодит өгөгдөл ачаалж байна…</p></div>
    <div class="card quick"><div class="sectionTitle"><h3>Миний хүүхэд</h3><span class="demoTag">LIVE</span></div><div id="parentChildPickerWrap" class="hidden"><label style="margin-top:0">Хүүхэд сонгох</label><select id="parentChildPicker"></select></div><div class="quickGrid" style="margin-top:10px"><div class="quickItem mint"><small>Өнөөдрийн ирц</small><b id="parentAttendance">—</b></div><div class="quickItem blue"><small>Даалгавар</small><b id="parentAssignmentCount">0</b></div><div class="quickItem"><small>Shared ажиглалт</small><b id="parentObservationCount">0</b></div><div class="quickItem rose"><small>Сарын тайлан</small><b id="parentSummaryCount">0</b></div></div></div>
    <div class="card wide"><div class="sectionTitle"><h3>Өнөөдрийн timeline</h3><button class="ghost" onclick="loadParentDashboard()">↻ Шинэчлэх</button></div><div id="parentTimeline" class="empty">Мэдээлэл ачаалж байна…</div></div>
    <div class="card narrow"><div class="sectionTitle"><h3>Хүүхдийн мэдээлэл</h3></div><div id="parentChildCard" class="empty">Мэдээлэл ачаалж байна…</div></div>
    <div class="card wide"><div class="sectionTitle"><h3>Сүүлийн даалгаврууд</h3></div><div id="parentAssignments" class="empty">Даалгавар алга.</div></div>
    <div class="card narrow"><div class="sectionTitle"><h3>Багшийн shared ажиглалт</h3></div><div id="parentObservations" class="empty">Shared ажиглалт алга.</div></div>
    <div class="card full"><div class="sectionTitle"><h3>Сарын ахицын тайлан</h3></div><div id="parentMonthlySummary" class="empty">Хуваалцсан сарын тайлан алга.</div></div>
  </div>`;
}

async function loadParentDashboard(studentId=null){
  if(!session||!membership||membership.role!=='parent')return;
  renderParentShell();
  try{
    const {data:links,error:linkErr}=await sb.from('guardian_students')
      .select('student_id,relationship,verified,students(id,full_name,student_code,birth_date,class_id,classes(id,name,grade,section,academic_year))')
      .eq('guardian_user_id',session.user.id).eq('school_id',membership.school_id).eq('verified',true);
    if(linkErr)throw linkErr;
    const children=(links||[]).map(x=>x.students).filter(Boolean);
    if(!children.length){
      $('parentHeroTitle').textContent='Танд хүүхэд хараахан холбогдоогүй байна.';
      $('parentHeroMeta').textContent='Хүүхдийн ангийн багш эцэг эхийн урилгыг сурагчтай холбож үүсгэнэ.';
      $('parentTimeline').textContent='Хүүхэд холбогдоогүй.';$('parentChildCard').textContent='Хүүхэд холбогдоогүй.';return;
    }
    const child=children.find(c=>c.id===studentId)||children[0];
    parentData={children,child};
    if(children.length>1){$('parentChildPickerWrap').classList.remove('hidden');$('parentChildPicker').innerHTML=children.map(c=>`<option value="${c.id}" ${c.id===child.id?'selected':''}>${esc(c.full_name)}</option>`).join('');$('parentChildPicker').onchange=e=>loadParentDashboard(e.target.value)}
    const today=new Date().toISOString().slice(0,10),classId=child.class_id;
    const [attRes,assRes,obsRes,sumRes]=await Promise.all([
      sb.from('attendance').select('status,note,attendance_date,marked_at').eq('student_id',child.id).eq('attendance_date',today).maybeSingle(),
      classId?sb.from('assignments').select('id,subject,title,description,due_at,created_at').eq('class_id',classId).order('created_at',{ascending:false}).limit(8):Promise.resolve({data:[],error:null}),
      sb.from('student_observations').select('id,subject,category,status,note,next_step,observed_at,created_at').eq('student_id',child.id).eq('visibility','shared_with_parent').order('observed_at',{ascending:false}).limit(8),
      sb.from('observation_monthly_summaries').select('id,month_start,parent_summary,support_plan,stats,shared_with_parent,updated_at').eq('student_id',child.id).eq('shared_with_parent',true).order('month_start',{ascending:false}).limit(3)
    ]);
    const err=attRes.error||assRes.error||obsRes.error||sumRes.error;if(err)throw err;
    const attendance=attRes.data||null,assignments=assRes.data||[],observations=obsRes.data||[],summaries=sumRes.data||[];
    parentData={...parentData,attendance,assignments,observations,summaries};
    const cls=child.classes;
    $('parentHeroTitle').textContent=`${child.full_name} · Өнөөдрийн мэдээлэл`;
    $('parentHeroMeta').textContent=cls?`${cls.name}${cls.grade?' · '+cls.grade+'-р анги':''}${cls.academic_year?' · '+cls.academic_year:''}`:'Анги холбогдоогүй';
    $('parentAttendance').textContent=attendance?parentStatusLabel(attendance.status):'Бүртгээгүй';
    $('parentAssignmentCount').textContent=assignments.length;$('parentObservationCount').textContent=observations.length;$('parentSummaryCount').textContent=summaries.length;
    $('parentChildCard').className='notice';$('parentChildCard').innerHTML=`<b>${esc(child.full_name)}</b><p>${esc(child.student_code||'Сурагчийн кодгүй')}</p><p>${cls?esc(cls.name):'Анги холбогдоогүй'}</p>`;
    $('parentAssignments').className=assignments.length?'list':'empty';$('parentAssignments').innerHTML=assignments.length?assignments.map(a=>`<div class="row"><div><b>${esc(a.subject)} · ${esc(a.title)}</b><small>${a.due_at?' · Дуусах: '+parentFmtDate(a.due_at):''}</small></div></div>`).join(''):'Даалгавар алга.';
    $('parentObservations').className=observations.length?'list':'empty';$('parentObservations').innerHTML=observations.length?observations.map(o=>`<div class="notice"><b>${esc(o.subject)} · ${esc(o.note)}</b><p>${esc(o.observed_at||'')}${o.next_step?' · Дараагийн алхам: '+esc(o.next_step):''}</p></div>`).join(''):'Shared ажиглалт алга.';
    $('parentMonthlySummary').className=summaries.length?'list':'empty';$('parentMonthlySummary').innerHTML=summaries.length?summaries.map(s=>`<div class="notice"><b>${esc(s.month_start)} сарын тайлан</b><p>${esc(s.parent_summary||'')}</p>${s.support_plan?`<p><b>Дэмжлэг:</b> ${esc(s.support_plan)}</p>`:''}</div>`).join(''):'Хуваалцсан сарын тайлан алга.';
    const timeline=[];
    if(attendance)timeline.push({time:attendance.marked_at||today,title:`Ирц · ${parentStatusLabel(attendance.status)}`,body:attendance.note||''});
    observations.slice(0,4).forEach(o=>timeline.push({time:o.created_at||o.observed_at,title:`Ажиглалт · ${o.subject}`,body:o.note||''}));
    assignments.slice(0,4).forEach(a=>timeline.push({time:a.created_at,title:`Даалгавар · ${a.subject}`,body:a.title||''}));
    timeline.sort((a,b)=>new Date(b.time)-new Date(a.time));
    $('parentTimeline').className=timeline.length?'':'empty';$('parentTimeline').innerHTML=timeline.length?timeline.map(x=>`<div class="notice"><b>${parentFmtDate(x.time)} · ${esc(x.title)}</b>${x.body?`<p>${esc(x.body)}</p>`:''}</div>`).join(''):'Одоогоор timeline мэдээлэл алга.';
  }catch(e){$('parentTimeline').className='status show err';$('parentTimeline').textContent='Эцэг эхийн мэдээлэл: '+e.message}
}

const schoolLinkBaseSetRole=setRole;
setRole=function(role){schoolLinkBaseSetRole(role);if(role==='parent'&&membership)setTimeout(()=>loadParentDashboard(),0)};
if(typeof currentRole!=='undefined'&&currentRole==='parent'&&membership)setTimeout(()=>loadParentDashboard(),0);

// ===== Self-service School → Admin → Teacher → Student → Parent flow =====
let schoolWorkflowData=null;
async function schoolWorkflowCall(body){const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body});if(error)throw new Error(error.message||'School workflow алдаа');if(data?.error)throw new Error(data.error);return data}

function ensureSchoolSignupUI(){
  const actions=document.querySelector('#authWrap .authActions');
  if(actions&&!document.getElementById('schoolSignupOpen')){const b=document.createElement('button');b.id='schoolSignupOpen';b.className='btn secondary';b.textContent='🏫 Шинэ сургууль бүртгүүлэх';b.onclick=openSchoolSignup;actions.appendChild(b)}
  const join=document.querySelector('#joinWrap .joinCard');
  if(join&&!document.getElementById('joinCreateSchool')){const b=document.createElement('button');b.id='joinCreateSchool';b.className='btn secondary';b.style.cssText='width:100%;margin-top:9px';b.textContent='🏫 Сургуулиа өөрөө бүртгүүлэх';b.onclick=openSchoolSignup;join.insertBefore(b,document.getElementById('joinLogout'))}
  if(!document.getElementById('schoolSignupModal')){const d=document.createElement('div');d.id='schoolSignupModal';d.className='modal hidden';d.innerHTML=`<div class="modalCard" style="max-width:520px"><div class="modalTop"><div><div class="muted">SELF-SERVICE</div><h3>Шинэ сургууль бүртгүүлэх</h3></div><button class="close" onclick="closeSchoolSignup()">×</button></div><p class="muted">Сургууль өөрөө бүртгүүлнэ. Owner зөвхөн ашиглах эрхийг идэвхжүүлнэ.</p><label>Сургуулийн нэр</label><input id="ssSchoolName" placeholder="Жишээ: 12-р сургууль"><label>Админы нэр</label><input id="ssAdminName" placeholder="Овог нэр"><label>И-мэйл</label><input id="ssEmail" type="email"><label>Нууц үг</label><input id="ssPassword" type="password"><button class="btn primary" style="width:100%;margin-top:16px" onclick="submitSchoolSignup()">Сургуулиа бүртгүүлэх</button><div id="ssStatus" class="status"></div></div>`;document.body.appendChild(d)}
  const ownerCreate=[...document.querySelectorAll('#owner button')].find(x=>(x.getAttribute('onclick')||'').includes('openNewSchool'));if(ownerCreate)ownerCreate.classList.add('hidden');
}
function openSchoolSignup(){ensureSchoolSignupUI();$('schoolSignupModal').classList.remove('hidden');clearStatus($('ssStatus'));const e=$('email')?.value||'';if(e&&!$('ssEmail').value)$('ssEmail').value=e}
function closeSchoolSignup(){$('schoolSignupModal').classList.add('hidden')}
async function submitSchoolSignup(){try{clearStatus($('ssStatus'));const schoolName=$('ssSchoolName').value.trim(),fullName=$('ssAdminName').value.trim(),email=$('ssEmail').value.trim(),password=$('ssPassword').value;if(schoolName.length<2||fullName.length<2||!email||password.length<6)throw new Error('Бүх мэдээллээ зөв бөглөнө үү.');showStatus($('ssStatus'),'Бүртгэл үүсгэж байна…');let active=session;if(!active){const {data,error}=await sb.auth.signUp({email,password});if(error)throw error;active=data.session;if(!active)throw new Error('Account үүслээ. Нэвтэрсний дараа сургуулиа бүртгэнэ үү.');session=active}const data=await onboardingCall({action:'create_school',school_name:schoolName,full_name:fullName});showStatus($('ssStatus'),`Сургууль бүртгэгдлээ ✅ Код: ${data.school_code}\nOwner ашиглах эрх нээсний дараа багш нараа нэмнэ.`,'ok');setTimeout(()=>{closeSchoolSignup();resolveAccess()},900)}catch(e){showStatus($('ssStatus'),e.message,'err')}}

function subscriptionLabel(sub){if(!sub)return 'Эрх идэвхжээгүй';if(sub.status==='paused')return '⏸ Эрх хүлээгдэж байна';if(sub.status==='trialing')return '🟣 Trial';if(sub.status==='active')return '✅ Идэвхтэй';if(sub.status==='past_due')return '⚠️ Хугацаа дууссан';return sub.status||'Эрхгүй'}

async function loadAdminDashboard(){if(!session||!membership||membership.role!=='admin')return;const section=$('admin');if(!section)return;section.innerHTML=`<div class="grid"><div class="card hero"><span class="pill">СУРГУУЛИЙН АДМИН</span><h3 id="adminHero">Сургуулийн тохиргоо</h3><p id="adminMeta">Мэдээлэл ачаалж байна…</p></div><div class="card quick"><div class="sectionTitle"><h3>Ашиглах эрх</h3><span class="demoTag">LIVE</span></div><div id="adminAccess" class="notice">Шалгаж байна…</div></div><div id="adminWorkspace" class="card full"><div class="empty">Ачаалж байна…</div></div></div>`;try{const data=await schoolWorkflowCall({action:'context'});schoolWorkflowData=data;$('adminHero').textContent=data.school.name;$('adminMeta').textContent=`Сургуулийн код: ${data.school.code}`;$('adminAccess').innerHTML=`<b>${subscriptionLabel(data.subscription)}</b>${data.access_open?'':'<p>Owner эрхийг идэвхжүүлсний дараа сургуулийн тохиргоо нээгдэнэ.</p>'}`;if(!data.access_open){$('adminWorkspace').innerHTML=`<div class="empty"><b>🔒 SchoolLink ашиглах эрх идэвхжээгүй байна.</b><p>Та сургуулиа амжилттай бүртгэсэн. Owner зөвхөн ашиглах хугацааг нээсний дараа багш, ангиа нэмнэ.</p></div>`;return}renderAdminWorkspace(data)}catch(e){$('adminWorkspace').innerHTML=`<div class="status show err">${esc(e.message)}</div>`}}
function renderAdminWorkspace(data){const classes=data.classes||[],teachers=data.teachers||[];$('adminWorkspace').innerHTML=`<div class="grid" style="display:grid"><div class="formCard" style="grid-column:span 6"><h4>1. Анги үүсгэх</h4><label>Ангийн нэр</label><input id="adClassName" placeholder="Жишээ: 6А"><div class="formGrid"><div><label>Анги</label><input id="adGrade" type="number" min="1" max="12" placeholder="6"></div><div><label>Бүлэг/үсэг</label><input id="adSection" placeholder="А"></div></div><label>Хичээлийн жил</label><input id="adYear" value="2026-2027"><button class="btn primary" style="width:100%;margin-top:14px" onclick="adminCreateClass()">Анги үүсгэх</button><div id="adClassStatus" class="status"></div></div><div class="formCard" style="grid-column:span 6"><h4>2. Багш нэмэх</h4><p class="muted">Багшид хариуцах ангийг нь сонгоод урилгын код өгнө.</p><label>Анги</label><select id="adTeacherClass">${classes.length?classes.map(c=>`<option value="${c.id}" ${c.homeroom_teacher_id?'disabled':''}>${esc(c.name)}${c.homeroom_teacher_id?' · багштай':''}</option>`).join(''):'<option value="">Эхлээд анги үүсгэнэ үү</option>'}</select><button class="btn primary" style="width:100%;margin-top:14px" onclick="adminCreateTeacherInvite()">Багшийн урилгын код гаргах</button><div id="adTeacherStatus" class="status"></div><div id="adTeacherCode" class="codeBox hidden"></div></div><div class="formCard" style="grid-column:span 6"><h4>Ангиуд</h4><div class="${classes.length?'list':'empty'}">${classes.length?classes.map(c=>`<div class="row"><div><b>${esc(c.name)}</b><small>${c.grade?' · '+c.grade+'-р анги':''}</small></div><span class="pill">${c.homeroom_teacher_id?'Багштай':'Багшгүй'}</span></div>`).join(''):'Анги алга.'}</div></div><div class="formCard" style="grid-column:span 6"><h4>Багш нар</h4><div class="${teachers.length?'list':'empty'}">${teachers.length?teachers.map(t=>`<div class="row"><div><b>${esc(t.full_name)}</b><small>${t.class?' · '+esc(t.class.name):' · анги холбогдоогүй'}</small></div></div>`).join(''):'Багш алга.'}</div></div></div>`}
async function adminCreateClass(){try{const name=$('adClassName').value.trim();if(!name)throw new Error('Ангийн нэрээ оруулна уу.');showStatus($('adClassStatus'),'Үүсгэж байна…');await schoolWorkflowCall({action:'create_class',name,grade:$('adGrade').value,section:$('adSection').value,academic_year:$('adYear').value.trim()||'2026-2027'});showStatus($('adClassStatus'),'Анги үүслээ ✅','ok');setTimeout(loadAdminDashboard,300)}catch(e){showStatus($('adClassStatus'),e.message,'err')}}
async function adminCreateTeacherInvite(){try{const classId=$('adTeacherClass').value;if(!classId)throw new Error('Анги сонгоно уу.');showStatus($('adTeacherStatus'),'Код үүсгэж байна…');const d=await onboardingCall({action:'create_invite',role:'teacher',class_id:classId,expires_hours:168,max_uses:1});showStatus($('adTeacherStatus'),'Багшид энэ кодыг өгнө үү ✅','ok');$('adTeacherCode').textContent=d.code;$('adTeacherCode').classList.remove('hidden')}catch(e){showStatus($('adTeacherStatus'),e.message,'err')}}

async function renderTeacherManagement(){if(!session||!membership||membership.role!=='teacher')return;try{const data=await schoolWorkflowCall({action:'context'});schoolWorkflowData=data;let card=$('teacherManageCard');if(!card){card=document.createElement('div');card.id='teacherManageCard';card.className='card full';$('teacher').querySelector('.grid').appendChild(card)}if(!data.access_open){card.innerHTML='<div class="empty">🔒 Сургуулийн SchoolLink ашиглах эрх идэвхгүй байна.</div>';return}if(!data.class){card.innerHTML='<div class="empty">Танд анги хараахан холбогдоогүй байна.</div>';return}const students=data.students||[];card.innerHTML=`<div class="sectionTitle"><h3>3. Сурагч → 4. Эцэг эх</h3><span class="pill">${esc(data.class.name)}</span></div><div class="formGrid"><div><label>Сурагчийн нэр</label><input id="tcStudentName" placeholder="Б. Тэмүүлэн"></div><div><label>Сурагчийн код</label><input id="tcStudentCode" placeholder="ST-001"></div></div><button class="btn primary" style="margin-top:12px" onclick="teacherCreateStudent()">＋ Сурагч нэмэх</button><div id="tcStudentStatus" class="status"></div><div style="height:16px"></div><div class="${students.length?'list':'empty'}">${students.length?students.map(s=>`<div class="row"><div><b>${esc(s.full_name)}</b><small> · ${esc(s.student_code||'кодгүй')}</small></div><button class="ghost" onclick="teacherCreateParentInvite('${s.id}','${String(s.full_name).replace(/'/g,"&#39;")}')">Эцэг эх урих</button></div>`).join(''):'Сурагч алга.'}</div><div id="tcParentStatus" class="status"></div><div id="tcParentCode" class="codeBox hidden"></div>`}catch(e){console.error(e)}}
async function teacherCreateStudent(){try{const name=$('tcStudentName').value.trim();if(name.length<2)throw new Error('Сурагчийн нэрээ оруулна уу.');showStatus($('tcStudentStatus'),'Нэмж байна…');await schoolWorkflowCall({action:'create_student',class_id:schoolWorkflowData.class.id,full_name:name,student_code:$('tcStudentCode').value.trim()});showStatus($('tcStudentStatus'),'Сурагч нэмэгдлээ ✅','ok');await loadTeacherDashboard();setTimeout(renderTeacherManagement,250)}catch(e){showStatus($('tcStudentStatus'),e.message,'err')}}
async function teacherCreateParentInvite(studentId,studentName){try{showStatus($('tcParentStatus'),`${studentName} · эцэг эхийн код үүсгэж байна…`);const d=await onboardingCall({action:'create_invite',role:'parent',student_id:studentId,expires_hours:168,max_uses:2});showStatus($('tcParentStatus'),`${studentName}-ийн эцэг эхэд энэ кодыг өгнө үү ✅`,'ok');$('tcParentCode').textContent=d.code;$('tcParentCode').classList.remove('hidden')}catch(e){showStatus($('tcParentStatus'),e.message,'err')}}

async function ownerQuickAccess(schoolId,command){try{await ownerCall({action:'quick_subscription',school_id:schoolId,command});await loadOwner()}catch(e){alert(e.message)}}
const baseRenderOwnerData=renderOwnerData;
renderOwnerData=function(){const m=ownerData?.metrics||{};$('ownerMetrics').innerHTML=[['Сургууль',m.schools],['Хэрэглэгч',m.users],['Сурагч',m.students],['Багш',m.teachers],['Эцэг эх',m.parents],['Анги',m.classes]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]||0}</b></div>`).join('');const rows=ownerData?.schools||[];$('ownerSchools').className=rows.length?'':'empty';$('ownerSchools').innerHTML=rows.length?rows.map(s=>`<div class="ownerSchool"><div><h4>${esc(s.name)}</h4><div class="muted">${esc(s.code)} · ${s.counts?.teachers||0} багш · ${s.counts?.students||0} сурагч</div><div style="margin-top:8px"><span class="pill">${subscriptionLabel(s.subscription)}</span></div></div><div class="schoolActions"><button class="ghost" onclick="ownerQuickAccess('${s.id}','trial_7')">7 хоног</button><button class="ghost" onclick="ownerQuickAccess('${s.id}','renew_30')">30 хоног</button><button class="ghost" onclick="ownerQuickAccess('${s.id}','renew_365')">1 жил</button><button class="ghost" onclick="ownerQuickAccess('${s.id}','pause')">⏸</button></div></div>`).join(''):'Одоогоор сургууль алга байна.';ensureSchoolSignupUI()}

const roleBeforeSelfService=setRole;
setRole=function(role){roleBeforeSelfService(role);if(role==='admin'&&membership)setTimeout(loadAdminDashboard,0);if(role==='teacher'&&membership)setTimeout(renderTeacherManagement,150)};
ensureSchoolSignupUI();
if(currentRole==='admin'&&membership)setTimeout(loadAdminDashboard,0);
if(currentRole==='teacher'&&membership)setTimeout(renderTeacherManagement,150);
