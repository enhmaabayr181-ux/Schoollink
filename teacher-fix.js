function shUlaanbaatarDate(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
window.shUlaanbaatarDate=shUlaanbaatarDate;

async function tpRenderAttendance(){
  const c=await tpContext(),date=shUlaanbaatarDate();
  const {data:attendance,error}=await sb.from('attendance').select('id,student_id,status,note,attendance_date').eq('school_id',membership.school_id).eq('class_id',c.class.id).eq('attendance_date',date);
  if(error)throw error;
  teacherData=teacherData||{};
  teacherData.schoolId=membership.school_id;teacherData.cls=c.class;teacherData.students=c.students||[];teacherData.attendance=attendance||[];
  const map=new Map((attendance||[]).map(a=>[a.student_id,a.status]));
  tpLayout('Ирц','Өнөөдрийн ирцийг хурдан бүртгэнэ.',`<div class="card full"><div class="sectionTitle"><h3>${tpEsc(c.class?.name||'Анги')}</h3><button class="btn primary" onclick="openAttendanceModal()">✓ Ирц бүртгэх</button></div>${c.students?.length?c.students.map(s=>`<div class="row"><b>${tpEsc(s.full_name)}</b><span class="pill">${({present:'Ирсэн',absent:'Тасалсан',late:'Хоцорсон',excused:'Чөлөөтэй'})[map.get(s.id)]||'Бүртгээгүй'}</span></div>`).join(''):'<div class="empty">Сурагч алга.</div>'}</div>`)
}

window.saveAttendance=async function(){
  try{
    if(!teacherData?.cls)throw new Error('Анги холбогдоогүй.');
    showStatus($('attendanceStatus'),'Хадгалж байна…');
    const date=shUlaanbaatarDate();
    const rows=[...document.querySelectorAll('[data-att-student]')].map(el=>({
      school_id:teacherData.schoolId,
      class_id:teacherData.cls.id,
      student_id:el.dataset.attStudent,
      attendance_date:date,
      status:el.value,
      marked_by:session.user.id,
      marked_at:new Date().toISOString()
    }));
    if(!rows.length)throw new Error('Хадгалах сурагч алга байна.');
    const {error}=await sb.from('attendance').upsert(rows,{onConflict:'student_id,attendance_date'});
    if(error)throw error;
    teacherData.attendance=rows;
    showStatus($('attendanceStatus'),'Ирц хадгалагдлаа ✅','ok');
    if(typeof teacherCurrentView!=='undefined'&&teacherCurrentView==='Ирц')await tpRenderAttendance();
    else await loadTeacherDashboard();
  }catch(e){showStatus($('attendanceStatus'),e.message,'err')}
};

window.saveAssignment=async function(){try{const subject=$('assignmentSubject').value.trim(),title=$('assignmentTitle').value.trim();if(!subject||!title)throw new Error('Хичээл болон гарчгаа оруулна уу.');if(!teacherData?.cls)await tpContext();showStatus($('assignmentStatus'),'Даалгавар хадгалж байна…');const {data:assignment,error}=await sb.from('assignments').insert({school_id:teacherData.schoolId,class_id:teacherData.cls.id,teacher_id:session.user.id,subject,title,description:$('assignmentDesc').value.trim()||null,due_at:$('assignmentDue').value?new Date($('assignmentDue').value).toISOString():null}).select('*').single();if(error)throw error;const files=[...($('assignmentFiles')?.files||[])];if(files.length){showStatus($('assignmentStatus'),`Даалгавар хадгалагдлаа. ${files.length} файл байршуулж байна…`);await tpUploadAssignmentFiles(assignment,files)}showStatus($('assignmentStatus'),'Даалгавар болон хавсралт амжилттай нэмэгдлээ ✅','ok');$('assignmentSubject').value='';$('assignmentTitle').value='';$('assignmentDesc').value='';$('assignmentDue').value='';if($('assignmentFiles'))$('assignmentFiles').value='';if(teacherCurrentView==='Даалгавар')await tpRenderAssignments();else if(teacherCurrentView==='Нүүр')await loadTeacherDashboard()}catch(e){showStatus($('assignmentStatus'),e.message,'err')}};
