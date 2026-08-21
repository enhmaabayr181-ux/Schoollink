let shCalendarReady=false;

function shCalEsc(v){return typeof esc==='function'?esc(v):String(v??'')}
function shCalFmt(v){if(!v)return '';try{return new Intl.DateTimeFormat('mn-MN',{timeZone:'Asia/Ulaanbaatar',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}}
function shCalTypeIcon(t){return ({event:'📅',meeting:'👥',trip:'🚌',exam:'📝',holiday:'🎉',other:'📌'})[t]||'📅'}
function shCalTypeLabel(t){return ({event:'Арга хэмжээ',meeting:'Хурал',trip:'Аялал',exam:'Шалгалт',holiday:'Амралт / баяр',other:'Бусад'})[t]||'Арга хэмжээ'}
function shCalRsvpLabel(v){return v==='yes'?'✅ Оролцоно':v==='maybe'?'🤔 Магадгүй':v==='no'?'❌ Оролцохгүй':'Хариулаагүй'}

async function shCalClasses(){
  if(!membership)return [];
  if(membership.role==='teacher'){
    if(typeof tpContext==='function'){try{const c=await tpContext();return c?.class?[c.class]:[]}catch{return teacherData?.cls?[teacherData.cls]:[]}}
    return teacherData?.cls?[teacherData.cls]:[];
  }
  if(membership.role==='admin'){
    if(adminCtx?.classes?.length)return adminCtx.classes;
    const {data}=await sb.from('classes').select('id,name,grade,section').eq('school_id',membership.school_id).order('name');return data||[];
  }
  return [];
}

async function shRenderCalendar(){
  if(!session?.user||!membership)return;
  const section=$(membership.role==='teacher'?'teacher':membership.role==='parent'?'parent':'admin');if(!section)return;
  const now=new Date(),from=new Date(now.getTime()-30*86400000).toISOString(),to=new Date(now.getTime()+180*86400000).toISOString();
  const {data:events,error}=await sb.from('school_events').select('*').eq('school_id',membership.school_id).gte('starts_at',from).lte('starts_at',to).order('starts_at');
  if(error){section.innerHTML=`<div class="grid"><div class="card full"><div class="status show err">${shCalEsc(error.message)}</div></div></div>`;return}
  const ids=(events||[]).map(e=>e.id);
  let rsvps=[];if(ids.length){const {data}=await sb.from('event_rsvps').select('event_id,user_id,response,responded_at').in('event_id',ids);rsvps=data||[]}
  const own=new Map(rsvps.filter(r=>r.user_id===session.user.id).map(r=>[r.event_id,r.response]));
  const counts=new Map();for(const r of rsvps){if(!counts.has(r.event_id))counts.set(r.event_id,{yes:0,maybe:0,no:0});counts.get(r.event_id)[r.response]++}
  const classes=await shCalClasses(),staff=membership.role==='teacher'||membership.role==='admin';
  const upcoming=(events||[]).filter(e=>new Date(e.starts_at)>=new Date(now.getTime()-2*3600000));
  const past=(events||[]).filter(e=>new Date(e.starts_at)<new Date(now.getTime()-2*3600000)).slice(-8).reverse();
  const roleLabel=membership.role==='teacher'?'БАГШ':membership.role==='admin'?'УДИРДЛАГА':'ЭЦЭГ ЭХ';
  const classOptions=classes.map(c=>`<option value="${c.id}">${shCalEsc(c.name)}</option>`).join('');
  const createCard=staff?`<div class="card narrow"><h3>＋ Шинэ арга хэмжээ</h3><label>Төрөл</label><select id="shCalType"><option value="event">Арга хэмжээ</option><option value="meeting">Хурал</option><option value="trip">Аялал</option><option value="exam">Шалгалт</option><option value="holiday">Амралт / баяр</option><option value="other">Бусад</option></select><label>Гарчиг</label><input id="shCalTitle" placeholder="Жишээ: Эцэг эхийн хурал"><label>Тайлбар</label><textarea id="shCalDesc" class="tpTextarea" placeholder="Нэмэлт мэдээлэл"></textarea><label>Эхлэх</label><input id="shCalStart" type="datetime-local"><label>Дуусах</label><input id="shCalEnd" type="datetime-local"><label>Байршил</label><input id="shCalLocation" placeholder="Жишээ: Урлагийн заал">${membership.role==='admin'?`<label>Хэнд</label><select id="shCalAudience" onchange="shCalToggleClass()"><option value="school">Бүх сургууль</option><option value="class">Тодорхой анги</option></select><div id="shCalClassWrap" class="hidden"><label>Анги</label><select id="shCalClass">${classOptions}</select></div>`:`<input id="shCalAudience" type="hidden" value="class"><input id="shCalClass" type="hidden" value="${classes[0]?.id||''}">`}<label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input id="shCalRsvp" type="checkbox" checked style="width:auto"> RSVP авах</label><button class="btn primary tpFull" onclick="shCalSaveEvent()">Календарьт нэмэх</button><div id="shCalStatus" class="status"></div></div>`:'';
  const renderEvent=e=>{const c=counts.get(e.id)||{yes:0,maybe:0,no:0},mine=own.get(e.id),canDelete=staff&&(membership.role==='admin'||e.created_by===session.user.id);return `<div class="notice shCalEvent"><div class="sectionTitle"><div><b>${shCalTypeIcon(e.event_type)} ${shCalEsc(e.title)}</b><div class="muted" style="margin-top:4px">${shCalTypeLabel(e.event_type)} · ${e.audience==='school'?'Бүх сургууль':'Анги'}</div></div><span class="pill">${shCalFmt(e.starts_at)}</span></div>${e.description?`<p>${shCalEsc(e.description)}</p>`:''}<div class="muted">${e.location?'📍 '+shCalEsc(e.location)+' · ':''}${e.ends_at?'Дуусах: '+shCalFmt(e.ends_at):''}</div>${e.rsvp_enabled?(staff?`<div class="schoolActions" style="margin-top:10px"><span class="pill">✅ ${c.yes}</span><span class="pill">🤔 ${c.maybe}</span><span class="pill">❌ ${c.no}</span></div>`:`<div style="margin-top:10px"><div class="muted" style="margin-bottom:6px">Таны хариу: <b>${shCalRsvpLabel(mine)}</b></div><div class="schoolActions"><button class="ghost" onclick="shCalRsvp('${e.id}','yes')">✅ Оролцоно</button><button class="ghost" onclick="shCalRsvp('${e.id}','maybe')">🤔 Магадгүй</button><button class="ghost" onclick="shCalRsvp('${e.id}','no')">❌ Оролцохгүй</button></div></div>`):''}${canDelete?`<div style="margin-top:10px"><button class="ghost" onclick="shCalDelete('${e.id}')">🗑 Устгах</button></div>`:''}</div>`};
  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">${roleLabel}</span><h3>📅 SchoolHub Календарь</h3><p>Арга хэмжээ, хурал, аялал, шалгалт болон сургуулийн чухал өдрүүд.</p></div>${createCard}<div class="card ${staff?'wide':'full'}"><div class="sectionTitle"><h3>Удахгүй болох</h3><button class="ghost" onclick="shRenderCalendar()">↻ Шинэчлэх</button></div>${upcoming.length?upcoming.map(renderEvent).join(''):'<div class="empty">Ойрын арга хэмжээ алга.</div>'}</div>${past.length?`<div class="card full"><div class="sectionTitle"><h3>Өнгөрсөн</h3></div>${past.map(renderEvent).join('')}</div>`:''}</div>`;
  $('title').textContent='Календарь';
}
window.shRenderCalendar=shRenderCalendar;
window.shCalToggleClass=()=>{$('shCalClassWrap')?.classList.toggle('hidden',$('shCalAudience')?.value!=='class')};
window.shCalSaveEvent=async()=>{try{const title=$('shCalTitle').value.trim(),start=$('shCalStart').value;if(!title||!start)throw new Error('Гарчиг болон эхлэх цаг шаардлагатай.');const audience=$('shCalAudience').value,classId=audience==='class'?$('shCalClass').value:null;if(audience==='class'&&!classId)throw new Error('Анги сонгоно уу.');showStatus($('shCalStatus'),'Хадгалж байна…');const row={school_id:membership.school_id,class_id:classId||null,created_by:session.user.id,title,description:$('shCalDesc').value.trim()||null,event_type:$('shCalType').value,audience,starts_at:new Date(start).toISOString(),ends_at:$('shCalEnd').value?new Date($('shCalEnd').value).toISOString():null,location:$('shCalLocation').value.trim()||null,rsvp_enabled:$('shCalRsvp').checked};const {error}=await sb.from('school_events').insert(row);if(error)throw error;showStatus($('shCalStatus'),'Календарьт нэмэгдлээ ✅','ok');await shRenderCalendar()}catch(e){showStatus($('shCalStatus'),e.message,'err')}};
window.shCalRsvp=async(eventId,response)=>{try{const {error}=await sb.from('event_rsvps').upsert({event_id:eventId,user_id:session.user.id,response,responded_at:new Date().toISOString()},{onConflict:'event_id,user_id'});if(error)throw error;await shRenderCalendar()}catch(e){alert('RSVP алдаа: '+e.message)}};
window.shCalDelete=async eventId=>{if(!confirm('Энэ арга хэмжээг устгах уу?'))return;const {error}=await sb.from('school_events').delete().eq('id',eventId);if(error)return alert(error.message);await shRenderCalendar()};

function shBindCalendarNav(){
  if(!membership||!['teacher','parent','admin'].includes(membership.role)||!$('nav'))return;
  let b=$('shCalendarNav');if(!b){b=document.createElement('button');b.id='shCalendarNav';b.textContent='Календарь';$('nav').appendChild(b)}
  b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shRenderCalendar()};
}
function shCalendarInit(){if(shCalendarReady)return;shCalendarReady=true;const prev=setRole;setRole=function(role){prev(role);setTimeout(shBindCalendarNav,30)};const obs=new MutationObserver(()=>setTimeout(shBindCalendarNav,0));if($('nav'))obs.observe($('nav'),{childList:true});setInterval(shBindCalendarNav,1500);setTimeout(shBindCalendarNav,300)}
setTimeout(shCalendarInit,0);
