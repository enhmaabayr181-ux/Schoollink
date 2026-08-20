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
      $('parentHeroMeta').textContent='Owner/сургуулийн админ эцэг эхийн урилгыг сурагчтай холбож үүсгэнэ.';
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
