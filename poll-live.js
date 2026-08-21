let shPollReady=false;

function shPollEsc(v){return typeof esc==='function'?esc(v):String(v??'')}
function shPollFmt(v){if(!v)return '';try{return new Intl.DateTimeFormat('mn-MN',{timeZone:'Asia/Ulaanbaatar',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}}

async function shPollClasses(){
  if(!membership)return [];
  if(typeof shCalClasses==='function')return await shCalClasses();
  if(membership.role==='teacher')return teacherData?.cls?[teacherData.cls]:[];
  if(membership.role==='admin'){
    const {data}=await sb.from('classes').select('id,name,grade,section').eq('school_id',membership.school_id).order('name');return data||[];
  }
  return [];
}

async function shRenderPolls(){
  if(!session?.user||!membership)return;
  const role=membership.role,section=$(role==='teacher'?'teacher':role==='parent'?'parent':'admin');if(!section)return;
  const staff=role==='teacher'||role==='admin';
  const {data:polls,error}=await sb.from('school_polls').select('*').eq('school_id',membership.school_id).order('created_at',{ascending:false}).limit(50);
  if(error){section.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${shPollEsc(error.message)}</div></div></div>`;return}
  const pollIds=(polls||[]).map(p=>p.id);
  let options=[],ownVotes=[],resultRows=[];
  if(pollIds.length){
    const [oRes,vRes,rRes]=await Promise.all([
      sb.from('poll_options').select('id,poll_id,label,position').in('poll_id',pollIds).order('position'),
      sb.from('poll_votes').select('poll_id,option_id,user_id').eq('user_id',session.user.id).in('poll_id',pollIds),
      sb.rpc('schoolhub_poll_results',{p_poll_ids:pollIds})
    ]);
    if(oRes.error)throw oRes.error;if(vRes.error)throw vRes.error;
    options=oRes.data||[];ownVotes=vRes.data||[];resultRows=rRes.data||[];
  }
  const byOptions=new Map();for(const o of options){if(!byOptions.has(o.poll_id))byOptions.set(o.poll_id,[]);byOptions.get(o.poll_id).push(o)}
  const own=new Map(ownVotes.map(v=>[v.poll_id,v.option_id]));
  const counts=new Map();for(const r of resultRows){if(!counts.has(r.poll_id))counts.set(r.poll_id,new Map());counts.get(r.poll_id).set(r.option_id,Number(r.vote_count)||0)}
  const classes=await shPollClasses();
  const classOptions=classes.map(c=>`<option value="${c.id}">${shPollEsc(c.name)}</option>`).join('');
  const roleLabel=role==='teacher'?'БАГШ':role==='admin'?'УДИРДЛАГА':'ЭЦЭГ ЭХ';
  const createCard=staff?`<div class="card narrow"><h3>＋ Шинэ санал асуулга</h3><label>Асуулт / гарчиг</label><input id="shPollTitle" placeholder="Жишээ: Эцэг эхийн хурлыг хэдэн цагт хийх вэ?"><label>Тайлбар</label><textarea id="shPollDesc" class="tpTextarea" placeholder="Нэмэлт тайлбар"></textarea><label>Сонголтууд</label><textarea id="shPollOptions" class="tpTextarea" placeholder="18:00&#10;18:30&#10;19:00"></textarea><div class="muted" style="font-size:12px;margin-top:5px">Сонголт бүрийг шинэ мөрөнд бичнэ. Доод тал нь 2 сонголт.</div>${role==='admin'?`<label>Хэнд</label><select id="shPollAudience" onchange="shPollToggleClass()"><option value="school">Бүх сургууль</option><option value="class">Тодорхой анги</option></select><div id="shPollClassWrap" class="hidden"><label>Анги</label><select id="shPollClass">${classOptions}</select></div>`:`<input id="shPollAudience" type="hidden" value="class"><input id="shPollClass" type="hidden" value="${classes[0]?.id||''}">`}<label>Хаагдах хугацаа</label><input id="shPollClose" type="datetime-local"><label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input id="shPollChange" type="checkbox" checked style="width:auto"> Саналаа өөрчлөх боломжтой</label><label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input id="shPollResults" type="checkbox" checked style="width:auto"> Үр дүнг оролцогчдод харуулах</label><button class="btn primary tpFull" onclick="shPollSave()">Санал асуулга үүсгэх</button><div id="shPollStatus" class="status"></div></div>`:'';

  const now=Date.now();
  const renderPoll=p=>{const opts=byOptions.get(p.id)||[],mine=own.get(p.id)||'',closed=p.closes_at&&new Date(p.closes_at).getTime()<=now,cm=counts.get(p.id)||new Map(),total=[...cm.values()].reduce((a,b)=>a+b,0),canDelete=staff&&(role==='admin'||p.created_by===session.user.id);return `<div class="notice shPollCard"><div class="sectionTitle"><div><b>📊 ${shPollEsc(p.title)}</b><div class="muted" style="margin-top:4px">${p.audience==='school'?'Бүх сургууль':'Анги'} · ${closed?'Хаагдсан':'Идэвхтэй'}</div></div>${p.closes_at?`<span class="pill">${shPollFmt(p.closes_at)}</span>`:''}</div>${p.description?`<p>${shPollEsc(p.description)}</p>`:''}<div class="shPollOptions">${opts.map(o=>{const n=cm.get(o.id)||0,pct=total?Math.round(n*100/total):0,selected=mine===o.id;return `<button class="shPollOption ${selected?'selected':''}" ${closed||(!p.allow_change&&mine)?'disabled':''} onclick="shPollVote('${p.id}','${o.id}')"><span>${selected?'✓ ':''}${shPollEsc(o.label)}</span>${p.show_results?`<b>${pct}%</b>`:''}</button>${p.show_results?`<div class="shPollBar"><i style="width:${pct}%"></i></div>`:''}`}).join('')}</div>${p.show_results?`<div class="muted" style="margin-top:8px">Нийт ${total} санал</div>`:''}${mine?`<div class="pill" style="margin-top:8px">Таны санал бүртгэгдсэн ✅</div>`:''}${canDelete?`<div style="margin-top:10px"><button class="ghost" onclick="shPollDelete('${p.id}')">🗑 Устгах</button></div>`:''}</div>`};

  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">${roleLabel}</span><h3>📊 Санал асуулга</h3><p>Сургууль, ангийн санал хүсэлт болон хурдан poll-ийг нэг дор.</p></div>${createCard}<div class="card ${staff?'wide':'full'}"><div class="sectionTitle"><h3>Санал асуулгууд</h3><button class="ghost" onclick="shRenderPolls()">↻ Шинэчлэх</button></div>${polls?.length?polls.map(renderPoll).join(''):'<div class="empty">Одоогоор санал асуулга алга.</div>'}</div></div>`;
  $('title').textContent='Санал асуулга';
}
window.shRenderPolls=shRenderPolls;
window.shPollToggleClass=()=>{$('shPollClassWrap')?.classList.toggle('hidden',$('shPollAudience')?.value!=='class')};
window.shPollSave=async()=>{try{const title=$('shPollTitle').value.trim(),raw=$('shPollOptions').value.split(/\n+/).map(x=>x.trim()).filter(Boolean),unique=[...new Set(raw)];if(title.length<2)throw new Error('Асуулт / гарчгаа оруулна уу.');if(unique.length<2)throw new Error('Доод тал нь 2 өөр сонголт оруулна уу.');const audience=$('shPollAudience').value,classId=audience==='class'?$('shPollClass').value:null;if(audience==='class'&&!classId)throw new Error('Анги сонгоно уу.');showStatus($('shPollStatus'),'Үүсгэж байна…');const {data:poll,error}=await sb.from('school_polls').insert({school_id:membership.school_id,class_id:classId||null,created_by:session.user.id,title,description:$('shPollDesc').value.trim()||null,audience,allow_change:$('shPollChange').checked,show_results:$('shPollResults').checked,closes_at:$('shPollClose').value?new Date($('shPollClose').value).toISOString():null}).select('id').single();if(error)throw error;const rows=unique.map((label,i)=>({poll_id:poll.id,label,position:i}));const {error:oe}=await sb.from('poll_options').insert(rows);if(oe){await sb.from('school_polls').delete().eq('id',poll.id);throw oe}showStatus($('shPollStatus'),'Санал асуулга үүслээ ✅','ok');await shRenderPolls()}catch(e){showStatus($('shPollStatus'),e.message,'err')}};
window.shPollVote=async(pollId,optionId)=>{try{const existing=await sb.from('poll_votes').select('id').eq('poll_id',pollId).eq('user_id',session.user.id).maybeSingle();if(existing.error)throw existing.error;if(existing.data){const {error}=await sb.from('poll_votes').update({option_id:optionId,updated_at:new Date().toISOString()}).eq('id',existing.data.id);if(error)throw error}else{const {error}=await sb.from('poll_votes').insert({poll_id:pollId,option_id:optionId,user_id:session.user.id});if(error)throw error}await shRenderPolls()}catch(e){alert('Санал өгөхөд алдаа гарлаа: '+e.message)}};
window.shPollDelete=async pollId=>{if(!confirm('Энэ санал асуулгыг устгах уу?'))return;const {error}=await sb.from('school_polls').delete().eq('id',pollId);if(error)return alert(error.message);await shRenderPolls()};

function shBindPollNav(){
  if(!membership||!['teacher','parent','admin'].includes(membership.role)||!$('nav'))return;
  let b=$('shPollNav');if(!b){b=document.createElement('button');b.id='shPollNav';b.textContent='Санал асуулга';$('nav').appendChild(b)}
  b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shRenderPolls()};
}
function shPollInit(){if(shPollReady)return;shPollReady=true;const prev=setRole;setRole=function(role){prev(role);setTimeout(shBindPollNav,50)};const obs=new MutationObserver(()=>setTimeout(shBindPollNav,0));if($('nav'))obs.observe($('nav'),{childList:true});setInterval(shBindPollNav,1500);setTimeout(shBindPollNav,400);const style=document.createElement('style');style.textContent=`.shPollOptions{display:grid;gap:7px;margin-top:12px}.shPollOption{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;border:1px solid var(--line);background:#fff;border-radius:14px;padding:11px 12px;font:inherit;cursor:pointer}.shPollOption.selected{outline:2px solid #7c6cff;background:#f5f2ff}.shPollOption:disabled{cursor:default;opacity:.78}.shPollBar{height:5px;background:#eeeaf8;border-radius:99px;overflow:hidden;margin:-3px 3px 3px}.shPollBar i{display:block;height:100%;background:linear-gradient(90deg,#6d5dfc,#9d8cff);border-radius:99px}`;document.head.appendChild(style)}
setTimeout(shPollInit,0);
