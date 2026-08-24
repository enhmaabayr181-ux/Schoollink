(() => {
  let targetStudent=null;
  function ensureModal(){
    if(document.getElementById('shParentEmailModal'))return;
    const d=document.createElement('div');d.id='shParentEmailModal';d.className='modal hidden';
    d.innerHTML='<div class="modalCard" style="max-width:520px"><div class="modalTop"><div><div class="muted">ЭЦЭГ ЭХ ХОЛБОХ</div><h3 id="shParentEmailTitle">Gmail урилга</h3></div><button class="close" id="shParentEmailClose">×</button></div><p class="muted">Эцэг эхийн Gmail рүү нэг удаагийн нэвтрэх холбоос очно. Тэр холбоосоор ороход хүүхэд автоматаар холбогдоно.</p><label>Эцэг эхийн нэр</label><input id="shParentName" placeholder="Овог нэр"><label>Gmail хаяг</label><input id="shParentEmail" type="email" inputmode="email" placeholder="parent@gmail.com"><label>Хэн болох</label><select id="shParentRelation"><option value="mother">Ээж</option><option value="father">Аав</option><option value="guardian">Асран хамгаалагч</option></select><button class="btn primary" id="shSendParentEmail" style="width:100%;margin-top:16px">Gmail урилга илгээх</button><div id="shParentEmailStatus" class="status"></div></div>';
    document.body.appendChild(d);document.getElementById('shParentEmailClose').onclick=()=>d.classList.add('hidden');document.getElementById('shSendParentEmail').onclick=send;
  }
  window.teacherCreateParentInvite=function(studentId,studentName){
    ensureModal();targetStudent={id:studentId,name:studentName};document.getElementById('shParentEmailTitle').textContent=studentName+' · Эцэг эх холбох';document.getElementById('shParentName').value='';document.getElementById('shParentEmail').value='';const s=document.getElementById('shParentEmailStatus');s.textContent='';s.className='status';document.getElementById('shParentEmailModal').classList.remove('hidden');setTimeout(()=>document.getElementById('shParentEmail').focus(),50);
  };
  async function send(){
    const email=document.getElementById('shParentEmail').value.trim().toLowerCase(),name=document.getElementById('shParentName').value.trim(),relationship=document.getElementById('shParentRelation').value,status=document.getElementById('shParentEmailStatus'),button=document.getElementById('shSendParentEmail');
    try{if(!targetStudent)throw new Error('Сурагч сонгоно уу.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Gmail хаягаа зөв оруулна уу.');button.disabled=true;showStatus(status,'Gmail урилга илгээж байна…');const data=await schoolWorkflowCall({action:'invite_parent_by_email',student_id:targetStudent.id,email,parent_name:name,relationship});showStatus(status,data.email+' рүү урилга илгээгдлээ ✅ 24 цагийн дотор холбоосоо нээнэ.','ok');setTimeout(()=>document.getElementById('shParentEmailModal').classList.add('hidden'),1400)}catch(e){showStatus(status,e.message||'Урилга илгээхэд алдаа гарлаа.','err')}finally{button.disabled=false}
  }
  ensureModal();
})();