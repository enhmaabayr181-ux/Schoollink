let slNotificationTimer=null;
let slNotificationRows=[];

function slNotificationIcon(type){return ({announcement:'📣',assignment:'📝',message:'💬',permission:'✅',observation:'🌱',summary:'📊'})[type]||'🔔'}
function slNotificationDate(v){if(!v)return '';try{return new Date(v).toLocaleString('mn-MN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return ''}}

function slEnsureNotificationUI(){
  const topActions=document.querySelector('.top > div:last-child');
  if(topActions&&!document.getElementById('slNotificationBtn')){
    const wrap=document.createElement('div');wrap.style.position='relative';
    wrap.innerHTML=`<button id="slNotificationBtn" class="logout" onclick="slToggleNotifications()" style="position:relative">🔔<span id="slNotificationBadge" class="hidden" style="position:absolute;right:-6px;top:-7px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;line-height:18px;font-weight:800"></span></button>`;
    topActions.insertBefore(wrap,topActions.firstChild);
  }
  if(!document.getElementById('slNotificationPanel')){
    const panel=document.createElement('div');panel.id='slNotificationPanel';panel.className='hidden';
    panel.style.cssText='position:fixed;right:18px;top:74px;width:min(390px,calc(100vw - 28px));max-height:70vh;overflow:auto;z-index:9999;background:rgba(255,255,255,.96);backdrop-filter:blur(18px);border:1px solid rgba(15,23,42,.09);border-radius:20px;box-shadow:0 22px 60px rgba(15,23,42,.18);padding:14px';
    panel.innerHTML=`<div class="sectionTitle"><div><small class="muted">SCHOOLLINK</small><h3 style="margin:2px 0">Мэдэгдэл</h3></div><button class="ghost" onclick="slMarkAllNotificationsRead()">Бүгдийг уншсан</button></div><div id="slNotificationList" class="empty">Мэдэгдэл ачаалж байна…</div>`;
    document.body.appendChild(panel);
  }
}

async function slLoadNotifications(){
  if(!session?.user)return;
  slEnsureNotificationUI();
  try{
    const {data,error}=await sb.from('notifications').select('id,type,title,body,link,read_at,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(40);
    if(error)throw error;
    slNotificationRows=data||[];
    const unread=slNotificationRows.filter(n=>!n.read_at).length;
    const badge=document.getElementById('slNotificationBadge');
    if(badge){badge.textContent=unread>99?'99+':String(unread);badge.classList.toggle('hidden',unread===0)}
    const list=document.getElementById('slNotificationList');if(!list)return;
    list.className=slNotificationRows.length?'list':'empty';
    list.innerHTML=slNotificationRows.length?slNotificationRows.map(n=>`<button class="notice" onclick="slOpenNotification('${n.id}')" style="display:block;width:100%;text-align:left;border:${n.read_at?'1px solid rgba(15,23,42,.07)':'1px solid rgba(124,58,237,.22)'};background:${n.read_at?'rgba(248,250,252,.7)':'rgba(245,243,255,.94)'};cursor:pointer;margin-bottom:8px"><div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:20px">${slNotificationIcon(n.type)}</span><div style="min-width:0;flex:1"><b>${esc(n.title)}</b>${n.body?`<p style="margin:5px 0">${esc(n.body)}</p>`:''}<small>${slNotificationDate(n.created_at)}${n.read_at?'':' · Шинэ'}</small></div></div></button>`).join(''):'Мэдэгдэл алга.';
  }catch(e){const list=document.getElementById('slNotificationList');if(list){list.className='status show err';list.textContent='Мэдэгдэл: '+e.message}}
}

window.slToggleNotifications=async()=>{slEnsureNotificationUI();const p=document.getElementById('slNotificationPanel');p.classList.toggle('hidden');if(!p.classList.contains('hidden'))await slLoadNotifications()};
window.slMarkAllNotificationsRead=async()=>{if(!session?.user)return;const unread=slNotificationRows.filter(n=>!n.read_at).map(n=>n.id);if(!unread.length)return;const {error}=await sb.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',session.user.id).in('id',unread);if(!error)await slLoadNotifications()};
window.slOpenNotification=async id=>{const n=slNotificationRows.find(x=>x.id===id);if(!n)return;if(!n.read_at)await sb.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',session.user.id);document.getElementById('slNotificationPanel')?.classList.add('hidden');await slLoadNotifications();const link=n.link||'';
  if(membership?.role==='teacher'){
    if(link.startsWith('chat:')&&typeof tpRenderView==='function')tpRenderView('Чат');
    else if(n.type==='permission'&&typeof tpRenderView==='function')tpRenderView('Зөвшөөрөл');
    else if(typeof tpRenderView==='function')tpRenderView('Мэдээлэл');
  }else if(membership?.role==='parent'){
    if(link.startsWith('chat:')&&typeof ppOpenChat==='function')ppOpenChat(link.split(':')[1]);
    else if(link==='parent:assignments')document.getElementById('parentAssignments')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:permissions')document.getElementById('parentPermissions')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:observations')document.getElementById('parentObservations')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:summaries')document.getElementById('parentMonthlySummary')?.scrollIntoView({behavior:'smooth',block:'start'});
    else document.getElementById('parentAnnouncements')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
};

function slStartNotificationPolling(){if(slNotificationTimer)clearInterval(slNotificationTimer);slNotificationTimer=setInterval(()=>{if(session?.user&&!document.hidden)slLoadNotifications()},20000)}

const slNotificationBaseSetRole=setRole;
setRole=function(role){slNotificationBaseSetRole(role);setTimeout(()=>{if(session?.user){slEnsureNotificationUI();slLoadNotifications();slStartNotificationPolling()}},150)};

document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session?.user)slLoadNotifications()});
setTimeout(()=>{if(session?.user){slEnsureNotificationUI();slLoadNotifications();slStartNotificationPolling()}},700);
