/* SchoolHub multi-class teacher + admin workspace. */
(() => {
  const byId=id=>document.getElementById(id);
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const style=document.createElement('style');
  style.textContent=`
    .teacherClassBar{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin-top:18px;padding:12px;border-radius:18px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18)}
    .teacherClassBar .field{min-width:220px;flex:1}.teacherClassBar label{color:rgba(255,255,255,.82);margin:0 0 6px}.teacherClassBar select{background:rgba(255,255,255,.96);height:46px}
    .teacherClassBar .classMeta{font-size:12px;color:rgba(255,255,255,.76);padding:0 2px 4px}.teacherRoleChip{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.18);font-size:11px;font-weight:850}
    .shClassCheckGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:8px}.shClassCheck{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.72);cursor:pointer}
    .shClassCheck input{width:20px;height:20px;flex:0 0 auto}.shClassCheck span{display:flex;flex-direction:column;min-width:0}.shClassCheck small{color:var(--muted);margin-top:2px}
    @media(max-width:600px){.teacherClassBar{align-items:stretch}.teacherClassBar .field{min-width:100%}.shClassCheckGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function ensureTeacherPicker(){
    const hero=byId('teacherHeroTitle')?.closest('.hero');
    if(!hero||byId('teacherClassSelect'))return;
    hero.insertAdjacentHTML('beforeend',`<div class="teacherClassBar"><div class="field"><label for="teacherClassSelect">Одоо ажиллах анги</label><select id="teacherClassSelect"><option value="">Анги ачаалж байна…</option></select></div><div><span id="teacherRoleChip" class="teacherRoleChip">👩‍🏫 Багш</span><div id="teacherClassMeta" class="classMeta">Нэг бүртгэлээр олон ангид ажиллана</div></div></div>`);
    byId('teacherClassSelect').addEventListener('change',event=>{
      const id=event.target.value;
      window.shSelectedTeacherClassId=id;
      if(id)localStorage.setItem('schoolhub.teacherClassId',id);
      window.loadTeacherDashboard?.();
    });
  }

  window.shRenderTeacherClassPicker=(classes=[],selected=null)=>{
    ensureTeacherPicker();
    const select=byId('teacherClassSelect');
    if(!select)return;
    if(!classes.length){
      select.innerHTML='<option value="">Анги холбогдоогүй</option>';
      if(byId('teacherClassMeta'))byId('teacherClassMeta').textContent='Удирдлагаас анги холбох шаардлагатай';
      return;
    }
    select.innerHTML=classes.map(cls=>`<option value="${safe(cls.id)}" ${selected?.id===cls.id?'selected':''}>${safe(cls.name)} · ${cls.teacher_kind==='subject'?'Мэргэжлийн багш':'Ангийн багш'}${cls.subject?' · '+safe(cls.subject):''}</option>`).join('');
    if(byId('teacherRoleChip'))byId('teacherRoleChip').textContent='👩‍🏫 '+(selected?.teacher_kind==='subject'?'Мэргэжлийн багш':'Ангийн багш');
    if(byId('teacherClassMeta'))byId('teacherClassMeta').textContent=classes.length>1?'Ангиа эндээс шууд солино':'Таны холбогдсон анги';
  };
  ensureTeacherPicker();

  async function loadLinks(schoolId){
    const {data,error}=await sb.from('teacher_classes').select('id,school_id,class_id,teacher_id,subject,active').eq('school_id',schoolId).eq('active',true);
    if(error)throw error;
    return data||[];
  }

  async function loadAdminMulticlass(){
    if(!window.session||!window.membership||membership.role!=='admin'||typeof window.apWorkflow!=='function')return;
    try{
      const ctx=await apWorkflow({action:'context'});
      const schoolId=membership.school_id,classes=ctx.classes||[],teachers=ctx.teachers||[],links=await loadLinks(schoolId);
      const teacherName=id=>teachers.find(t=>t.user_id===id)?.full_name||'Багш';
      const className=id=>classes.find(c=>c.id===id)?.name||'Анги';
      const teacherOptions=teachers.map(t=>`<option value="${safe(t.user_id)}">${safe(t.full_name||'Багш')}</option>`).join('');
      const checks=classes.map(c=>`<label class="shClassCheck"><input type="checkbox" value="${safe(c.id)}" data-sh-multi-class><span><b>${safe(c.name)}</b><small>${safe(c.academic_year||'')}${c.grade?' · '+safe(c.grade)+'-р анги':''}</small></span></label>`).join('');
      const rows=links.length?links.map(link=>`<div class="row"><div><b>${safe(teacherName(link.teacher_id))}</b><small> · ${safe(className(link.class_id))}${link.subject?' · '+safe(link.subject):''}</small></div><button class="ghost" onclick="shRemoveTeacherClass('${safe(link.id)}')">Хасах</button></div>`).join(''):'<div class="empty">Мэргэжлийн багшийн нэмэлт анги оноогоогүй.</div>';
      const admin=byId('admin');
      if(!admin)return;
      admin.innerHTML=`<div class="grid">
        <div class="card hero full"><span class="pill">УДИРДЛАГА</span><h3>${safe(ctx.school?.name||'Сургууль')}</h3><p>Ангийн болон мэргэжлийн багшийн хариуцах ангиудыг удирдана.</p></div>
        <div class="card full"><div class="sectionTitle"><h3>Ангийн багш оноох</h3><button class="ghost" onclick="shLoadAdminMulticlass()">↻ Шинэчлэх</button></div><p class="muted">Анги бүр нэг үндсэн ангийн багштай байна.</p>${classes.length?classes.map(c=>`<div class="ownerSchool"><div><h4>${safe(c.name)}</h4><div class="muted">${safe(c.academic_year||'')}</div></div><select onchange="shAssignHomeroom('${safe(c.id)}',this.value)"><option value="">Багшгүй</option>${teachers.map(t=>`<option value="${safe(t.user_id)}" ${c.homeroom_teacher_id===t.user_id?'selected':''}>${safe(t.full_name||'Багш')}</option>`).join('')}</select></div>`).join(''):'<div class="empty">Анги алга.</div>'}</div>
        <div class="card wide"><div class="sectionTitle"><h3>Мэргэжлийн багшийг олон ангид оноох</h3><span class="pill">ШИНЭ</span></div><label>Багш</label><select id="shMultiTeacher"><option value="">Багш сонгох</option>${teacherOptions}</select><label>Хичээл</label><input id="shMultiSubject" placeholder="Жишээ: Англи хэл"><label>Хариуцах ангиуд</label><div class="shClassCheckGrid">${checks||'<div class="empty">Анги алга.</div>'}</div><button class="btn primary" style="width:100%;margin-top:14px" onclick="shSaveTeacherClasses()">Сонгосон ангиудад оноох</button><div id="shMultiStatus" class="status"></div></div>
        <div class="card narrow"><div class="notice"><b>Яаж ажиллах вэ?</b><p>Мэргэжлийн багш нэг account-аар энд оноосон ангиудаа сольж ажиллана.</p></div></div>
        <div class="card full"><div class="sectionTitle"><h3>Мэргэжлийн багшийн ангиуд</h3><span class="pill">${links.length} холбоос</span></div><div class="list">${rows}</div></div>
      </div>`;
      window.shDecorateHeroes?.(admin);
    }catch(error){
      const admin=byId('admin');
      if(admin)admin.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${safe(error.message)}</div></div></div>`;
    }
  }

  window.shLoadAdminMulticlass=loadAdminMulticlass;
  window.shAssignHomeroom=async(classId,userId)=>{
    try{
      const {error}=await sb.from('classes').update({homeroom_teacher_id:userId||null}).eq('id',classId).eq('school_id',membership.school_id);
      if(error)throw error;
      await loadAdminMulticlass();
    }catch(error){alert('Ангийн багш оноох алдаа: '+error.message)}
  };
  window.shSaveTeacherClasses=async()=>{
    const status=byId('shMultiStatus');
    try{
      const teacherId=byId('shMultiTeacher')?.value,subject=byId('shMultiSubject')?.value.trim()||null;
      const classIds=[...document.querySelectorAll('[data-sh-multi-class]:checked')].map(input=>input.value);
      if(!teacherId)throw new Error('Багш сонгоно уу.');
      if(!classIds.length)throw new Error('Доод тал нь нэг анги сонгоно уу.');
      showStatus(status,'Хадгалж байна…');
      const rows=classIds.map(class_id=>({school_id:membership.school_id,class_id,teacher_id:teacherId,subject,active:true}));
      const {error}=await sb.from('teacher_classes').upsert(rows,{onConflict:'school_id,class_id,teacher_id'});
      if(error)throw error;
      showStatus(status,'Олон ангийн эрх хадгалагдлаа ✅','ok');
      await loadAdminMulticlass();
    }catch(error){showStatus(status,error.message,'err')}
  };
  window.shRemoveTeacherClass=async id=>{
    try{
      const {error}=await sb.from('teacher_classes').delete().eq('id',id).eq('school_id',membership.school_id);
      if(error)throw error;
      await loadAdminMulticlass();
    }catch(error){alert('Холбоос хасах алдаа: '+error.message)}
  };

  const priorSetRole=window.setRole;
  if(typeof priorSetRole==='function')window.setRole=role=>{priorSetRole(role);if(role==='admin')setTimeout(loadAdminMulticlass,40);if(role==='teacher')setTimeout(ensureTeacherPicker,40)};
})();