/* SchoolHub complete admin center: teachers, multi-class assignments and students. */
(() => {
  const byId=id=>document.getElementById(id);
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let adminCenterCtx=null;

  const style=document.createElement('style');
  style.textContent=`
    .acGrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
    .acSpan4{grid-column:span 4}.acSpan6{grid-column:span 6}.acSpan8{grid-column:span 8}.acFull{grid-column:1/-1}
    .acClassChecks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
    .acCheck{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.72)}
    .acCheck input{width:20px;height:20px;flex:0 0 auto}.acCheck span{min-width:0}.acCheck small{display:block;color:var(--muted);margin-top:2px}
    .acStudentList{display:grid;gap:8px;max-height:430px;overflow:auto}.acHint{font-size:12px;color:var(--muted);line-height:1.55}
    @media(max-width:900px){.acSpan4,.acSpan6,.acSpan8,.acFull{grid-column:1/-1}.acGrid{grid-template-columns:1fr}.acClassChecks{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  async function acContext(){
    if(typeof apWorkflow==='function')return await apWorkflow({action:'context'});
    const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body:{action:'context'}});
    if(error)throw new Error(error.message||'Удирдлагын мэдээлэл авахад алдаа гарлаа.');
    if(data?.error)throw new Error(data.error);return data;
  }
  async function acLinks(schoolId){
    const {data,error}=await sb.from('teacher_classes').select('id,school_id,class_id,teacher_id,subject,active').eq('school_id',schoolId).eq('active',true);
    if(error)throw error;return data||[];
  }
  async function acStudents(schoolId){
    const {data,error}=await sb.from('students').select('id,class_id,full_name,student_code,birth_date,active').eq('school_id',schoolId).eq('active',true).order('full_name');
    if(error)throw error;return data||[];
  }

  async function render(){
    if(!window.session||!window.membership||membership.role!=='admin')return;
    const root=byId('admin');if(!root)return;
    try{
      const ctx=await acContext();adminCenterCtx=ctx;
      const schoolId=membership.school_id,classes=ctx.classes||[],teachers=ctx.teachers||[];
      const [links,students]=await Promise.all([acLinks(schoolId),acStudents(schoolId)]);
      const teacherName=id=>teachers.find(t=>t.user_id===id)?.full_name||'Багш';
      const className=id=>classes.find(c=>c.id===id)?.name||'Анги';
      const classOpts=classes.length?classes.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join(''):'<option value="">Анги алга</option>';
      const teacherOpts=teachers.map(t=>`<option value="${safe(t.user_id)}">${safe(t.full_name||'Багш')}</option>`).join('');
      const checks=classes.map(c=>`<label class="acCheck"><input type="checkbox" value="${safe(c.id)}" data-ac-class><span><b>${safe(c.name)}</b><small>${safe(c.academic_year||'')}${c.grade?' · '+safe(c.grade)+'-р анги':''}</small></span></label>`).join('');
      const linkRows=links.length?links.map(l=>`<div class="row"><div><b>${safe(teacherName(l.teacher_id))}</b><small> · ${safe(className(l.class_id))}${l.subject?' · '+safe(l.subject):''}</small></div><button class="ghost" onclick="acRemoveLink('${safe(l.id)}')">Хасах</button></div>`).join(''):'<div class="empty">Мэргэжлийн багшийн нэмэлт анги оноогоогүй.</div>';
      const studentRows=students.length?students.map(s=>`<div class="row"><div><b>${safe(s.full_name)}</b><small> · ${safe(className(s.class_id))}${s.student_code?' · '+safe(s.student_code):''}</small></div></div>`).join(''):'<div class="empty">Сурагч алга.</div>';

      root.innerHTML=`<div class="acGrid">
        <div class="card hero acFull"><span class="pill">УДИРДЛАГА</span><h3>${safe(ctx.school?.name||'Сургууль')}</h3><p>Багш, анги, сурагчийн тохиргоог нэг дороос удирдана.</p></div>

        <div class="card acSpan4"><div class="sectionTitle"><h3>Багш урих</h3><span class="pill">1</span></div>
          <label>Эхний анги</label><select id="acInviteClass">${classOpts}</select>
          <p class="acHint">Ангийн багш бол тухайн ангийг сонгоно. Мэргэжлийн багшийг эхлээд нэг ангитай урьж, дараа нь доорх хэсгээс бүх ордог ангид нь онооно.</p>
          <button class="btn primary" style="width:100%;margin-top:10px" onclick="acInviteTeacher()">＋ Багшийн урилга үүсгэх</button>
          <div id="acInviteStatus" class="status"></div><div id="acInviteCode" class="codeBox hidden"></div>
        </div>

        <div class="card acSpan8"><div class="sectionTitle"><h3>Ангийн багш оноох</h3><span class="pill">2</span></div>
          <p class="acHint">Анги бүр нэг үндсэн ангийн багштай байна.</p>
          ${classes.length?classes.map(c=>`<div class="ownerSchool"><div><h4>${safe(c.name)}</h4><div class="muted">${safe(c.academic_year||'')}</div></div><select onchange="acAssignHomeroom('${safe(c.id)}',this.value)"><option value="">Багшгүй</option>${teachers.map(t=>`<option value="${safe(t.user_id)}" ${c.homeroom_teacher_id===t.user_id?'selected':''}>${safe(t.full_name||'Багш')}</option>`).join('')}</select></div>`).join(''):'<div class="empty">Анги алга.</div>'}
        </div>

        <div class="card acSpan8"><div class="sectionTitle"><h3>Мэргэжлийн багш — олон анги</h3><span class="pill">3</span></div>
          <label>Багш</label><select id="acMultiTeacher"><option value="">Багш сонгох</option>${teacherOpts}</select>
          <label>Хичээл</label><input id="acSubject" placeholder="Жишээ: Англи хэл, Хөгжим, Биеийн тамир">
          <label>Орох ангиуд</label><div class="acClassChecks">${checks||'<div class="empty">Анги алга.</div>'}</div>
          <button class="btn primary" style="width:100%;margin-top:14px" onclick="acSaveSubjectTeacher()">Сонгосон ангиудад оноох</button><div id="acMultiStatus" class="status"></div>
        </div>
        <div class="card acSpan4"><div class="sectionTitle"><h3>Оноосон ангиуд</h3><span class="pill">${links.length}</span></div><div class="list">${linkRows}</div></div>

        <div class="card acSpan4"><div class="sectionTitle"><h3>Сурагч нэмэх</h3><span class="pill">4</span></div>
          <label>Анги</label><select id="acStudentClass">${classOpts}</select>
          <label>Сурагчийн нэр</label><input id="acStudentName" placeholder="Б. Тэмүүлэн">
          <label>Код</label><input id="acStudentCode" placeholder="ST-001">
          <label>Төрсөн огноо</label><input id="acStudentBirth" type="date">
          <button class="btn primary" style="width:100%;margin-top:14px" onclick="acAddStudent()">＋ Сурагч нэмэх</button><div id="acStudentStatus" class="status"></div>
        </div>
        <div class="card acSpan8"><div class="sectionTitle"><h3>Сурагчид</h3><button class="ghost" onclick="acRender()">↻ Шинэчлэх</button></div><div class="acStudentList">${studentRows}</div></div>
      </div>`;
      window.shDecorateHeroes?.(root);
    }catch(e){root.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${safe(e.message)}</div></div></div>`}
  }

  window.acRender=render;
  window.acInviteTeacher=async()=>{try{
    const classId=byId('acInviteClass')?.value;if(!classId)throw new Error('Эхлээд анги сонгоно уу.');
    showStatus(byId('acInviteStatus'),'Урилга үүсгэж байна…');
    const d=await onboardingCall({action:'create_invite',role:'teacher',class_id:classId,expires_hours:168,max_uses:1});
    showStatus(byId('acInviteStatus'),'Багшийн урилгын код бэлэн ✅','ok');byId('acInviteCode').textContent=d.code;byId('acInviteCode').classList.remove('hidden');
  }catch(e){showStatus(byId('acInviteStatus'),e.message,'err')}};

  window.acAssignHomeroom=async(classId,userId)=>{try{
    const {error}=await sb.from('classes').update({homeroom_teacher_id:userId||null}).eq('id',classId).eq('school_id',membership.school_id);if(error)throw error;await render();
  }catch(e){alert('Ангийн багш оноох алдаа: '+e.message)}};

  window.acSaveSubjectTeacher=async()=>{const status=byId('acMultiStatus');try{
    const teacherId=byId('acMultiTeacher')?.value,subject=byId('acSubject')?.value.trim();const classIds=[...document.querySelectorAll('[data-ac-class]:checked')].map(x=>x.value);
    if(!teacherId)throw new Error('Багш сонгоно уу.');if(!subject)throw new Error('Хичээлийн нэр оруулна уу.');if(!classIds.length)throw new Error('Доод тал нь нэг анги сонгоно уу.');
    showStatus(status,'Хадгалж байна…');const rows=classIds.map(class_id=>({school_id:membership.school_id,class_id,teacher_id:teacherId,subject,active:true}));
    const {error}=await sb.from('teacher_classes').upsert(rows,{onConflict:'school_id,class_id,teacher_id'});if(error)throw error;showStatus(status,'Мэргэжлийн багшийн ангиуд хадгалагдлаа ✅','ok');setTimeout(render,350);
  }catch(e){showStatus(status,e.message,'err')}};

  window.acRemoveLink=async id=>{try{const {error}=await sb.from('teacher_classes').delete().eq('id',id).eq('school_id',membership.school_id);if(error)throw error;await render()}catch(e){alert('Холбоос хасах алдаа: '+e.message)}};

  window.acAddStudent=async()=>{const status=byId('acStudentStatus');try{
    const classId=byId('acStudentClass')?.value,fullName=byId('acStudentName')?.value.trim();if(!classId||!fullName)throw new Error('Анги болон сурагчийн нэр шаардлагатай.');
    showStatus(status,'Сурагч нэмж байна…');
    const body={action:'create_student',class_id:classId,full_name:fullName,student_code:byId('acStudentCode')?.value.trim()||'',birth_date:byId('acStudentBirth')?.value||null};
    const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body});if(error)throw new Error(error.message||'Сурагч нэмэх алдаа');if(data?.error)throw new Error(data.error);
    showStatus(status,'Сурагч амжилттай нэмэгдлээ ✅','ok');byId('acStudentName').value='';byId('acStudentCode').value='';byId('acStudentBirth').value='';setTimeout(render,350);
  }catch(e){showStatus(status,e.message,'err')}};

  const previous=window.setRole;
  if(typeof previous==='function')window.setRole=role=>{previous(role);if(role==='admin')setTimeout(render,80)};
  setTimeout(()=>{if(window.currentRole==='admin'||window.membership?.role==='admin')render()},300);
})();