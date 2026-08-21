let shPfSharePatchTimer=null;
function shPfApplySharePatch(){
  if(typeof SH_SHARE_MODULES==='undefined'||typeof window.shAdminLoadSharedModule!=='function')return false;
  if(!SH_SHARE_MODULES.some(x=>x[0]==='portfolio'))SH_SHARE_MODULES.push(['portfolio','Portfolio']);
  if(window.__shPfAdminSharePatched)return true;
  window.__shPfAdminSharePatched=true;
  const base=window.shAdminLoadSharedModule;
  window.shAdminLoadSharedModule=async function(teacherId,module){
    if(module!=='portfolio')return base(teacherId,module);
    const out=document.getElementById('shAdminSharedRows');if(!out)return;
    try{
      out.className='empty';out.textContent='Ачаалж байна…';
      const {data:grant,error:ge}=await sb.from('teacher_admin_view_grants').select('can_view').eq('school_id',membership.school_id).eq('teacher_id',teacherId).eq('module','portfolio').maybeSingle();
      if(ge)throw ge;if(!grant?.can_view)throw new Error('Багш Portfolio харах эрхийг хаасан байна.');
      const {data:rows,error}=await sb.from('student_portfolio_items').select('id,title,note,category,occurred_at,file_path,file_name,mime_type,students(full_name)').eq('school_id',membership.school_id).eq('created_by',teacherId).order('occurred_at',{ascending:false}).limit(60);if(error)throw error;
      const html=(rows||[]).map(r=>`<div class="notice"><div class="sectionTitle"><b>${shShareEsc(r.students?.full_name||'Сурагч')} · ${shShareEsc(r.title)}</b><span class="pill">${typeof shPfCategoryLabel==='function'?shPfCategoryLabel(r.category):shShareEsc(r.category||'')}</span></div><p class="muted">${shShareFmt(r.occurred_at)}</p>${r.note?`<p>${shShareEsc(r.note)}</p>`:''}${r.file_path?`<button class="ghost" onclick="shPfOpenFile('${String(r.file_path).replaceAll("'","\\'")}')">📎 ${shShareEsc(r.file_name||'Файл')}</button>`:''}</div>`).join('');
      out.className=rows?.length?'list':'empty';out.innerHTML=rows?.length?`<div class="sectionTitle"><h3>Portfolio</h3><span class="pill">READ ONLY · ${rows.length}</span></div>${html}`:'Portfolio бичлэг одоогоор алга.';
    }catch(e){out.className='status show err';out.textContent=e.message}
  };
  return true;
}
function shPfStartSharePatch(){if(shPfApplySharePatch())return;clearInterval(shPfSharePatchTimer);shPfSharePatchTimer=setInterval(()=>{if(shPfApplySharePatch())clearInterval(shPfSharePatchTimer)},150)}
setTimeout(shPfStartSharePatch,0);
