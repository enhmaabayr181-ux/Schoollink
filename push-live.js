const SCHOOL_LINK_VAPID_PUBLIC='BPIsnPXManDKIgUFR6P2EVVmxDhy5VytD8mSb18to4wM_B1j2u980tdHbjgBD9Y9mfkK10YmvkZUtmgb58tXrzY';
let slPushFlushTimer=null;
let slPushFlushing=false;

function slUrlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64),arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
  return arr;
}
function slPushIsIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function slPushStandalone(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function slPushSupported(){return 'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window}
function slPushConflict(error){return error?.code==='23505'||String(error?.message||'').toLowerCase().includes('duplicate')||String(error?.details||'').toLowerCase().includes('already exists')}

async function slSavePushSubscription(sub){
  if(!session?.user)throw new Error('Эхлээд нэвтэрнэ үү.');
  const j=sub.toJSON(),keys=j.keys||{};
  const row={user_id:session.user.id,endpoint:j.endpoint,p256dh:keys.p256dh,auth:keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString(),last_seen_at:new Date().toISOString()};
  const {error}=await sb.from('web_push_subscriptions').upsert(row,{onConflict:'endpoint'});
  if(error)throw error;
}

async function slEnsurePushSubscription(){
  if(!slPushSupported())throw new Error('Энэ browser push notification дэмжихгүй байна.');
  if(slPushIsIOS()&&!slPushStandalone())throw new Error('iPhone дээр эхлээд SchoolHub-ийг Home Screen-д суулгана. Дараа нь icon-оос нээгээд Push асаана уу.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error('Notification permission зөвшөөрөгдөөгүй байна.');
  const reg=await navigator.serviceWorker.ready;
  let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:slUrlBase64ToUint8Array(SCHOOL_LINK_VAPID_PUBLIC)});
  try{await slSavePushSubscription(sub)}catch(e){
    if(!slPushConflict(e))throw e;
    await sub.unsubscribe().catch(()=>{});
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:slUrlBase64ToUint8Array(SCHOOL_LINK_VAPID_PUBLIC)});
    await slSavePushSubscription(sub);
  }
  return sub;
}

function slEnsurePushButton(){
  const panel=document.getElementById('slNotificationPanel');
  if(!panel||document.getElementById('slPushEnableBtn'))return;
  const head=panel.querySelector('.sectionTitle');if(!head)return;
  const btn=document.createElement('button');btn.id='slPushEnableBtn';btn.className='ghost';btn.textContent='🔔 Push асаах';btn.onclick=slEnablePush;
  const off=document.createElement('button');off.id='slPushDisableBtn';off.className='ghost';off.textContent='Push унтраах';off.onclick=slDisablePush;off.style.display='none';
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center';
  const mark=[...head.children].find(x=>x.tagName==='BUTTON');if(mark){head.replaceChild(actions,mark);actions.appendChild(btn);actions.appendChild(off);actions.appendChild(mark)}else{actions.appendChild(btn);actions.appendChild(off);head.appendChild(actions)}
  slRefreshPushButton();
}

async function slRefreshPushButton(){
  const btn=document.getElementById('slPushEnableBtn'),off=document.getElementById('slPushDisableBtn');if(!btn)return;
  if(!slPushSupported()){btn.textContent='Push дэмжихгүй';btn.disabled=true;if(off)off.style.display='none';return}
  if(Notification.permission==='denied'){btn.textContent='Push хаалттай';btn.disabled=true;if(off)off.style.display='none';return}
  try{
    const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();
    const active=!!sub&&Notification.permission==='granted';
    btn.textContent=active?'🔔 Push идэвхтэй':'🔔 Push асаах';btn.disabled=active;
    if(off)off.style.display=active?'inline-flex':'none';
  }catch{btn.textContent='🔔 Push асаах';btn.disabled=false;if(off)off.style.display='none'}
}

window.slEnablePush=async()=>{
  const btn=document.getElementById('slPushEnableBtn');
  try{if(btn){btn.disabled=true;btn.textContent='Тохируулж байна…'}await slEnsurePushSubscription();await slRefreshPushButton();await slPushFlush()}catch(e){if(btn){btn.disabled=false;btn.textContent='🔔 Push асаах'}alert(e.message||'Push тохируулахад алдаа гарлаа.')}
};

window.slDisablePush=async()=>{
  if(!slPushSupported())return;
  const off=document.getElementById('slPushDisableBtn');
  try{
    if(off){off.disabled=true;off.textContent='Унтрааж байна…'}
    const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();
    if(sub){
      if(session?.user){const {error}=await sb.from('web_push_subscriptions').delete().eq('user_id',session.user.id).eq('endpoint',sub.endpoint);if(error)throw error}
      await sub.unsubscribe();
    }
    await slRefreshPushButton();
  }catch(e){alert(e.message||'Push унтраахад алдаа гарлаа.')}finally{if(off){off.disabled=false;off.textContent='Push унтраах'}}
};

async function slPushFlush(){
  if(slPushFlushing||!session?.user||!membership||document.hidden)return;
  slPushFlushing=true;
  try{await sb.functions.invoke('schoollink-push',{body:{action:'flush'}})}catch(e){console.warn('Push flush',e?.message||e)}finally{slPushFlushing=false}
}
function slStartPushFlush(){if(slPushFlushTimer)clearInterval(slPushFlushTimer);slPushFlushTimer=setInterval(slPushFlush,12000)}

function slRoutePushLink(link){
  if(!link||!membership)return false;
  if(membership.role==='teacher'){
    if(link.startsWith('chat:')&&typeof tpRenderView==='function')tpRenderView('Чат');
    else if(link==='parent:permissions'&&typeof tpRenderView==='function')tpRenderView('Зөвшөөрөл');
    else if(link==='parent:assignments'&&typeof tpRenderView==='function')tpRenderView('Даалгавар');
    else if(link==='parent:observations'&&typeof tpRenderView==='function')tpRenderView('Ажиглалт');
    else if(link==='parent:summaries'&&typeof tpRenderView==='function')tpRenderView('Сарын тайлан');
    else if(link==='parent:polls'&&typeof shRenderPolls==='function')shRenderPolls();
    else if(link==='parent:calendar'&&typeof shRenderCalendar==='function')shRenderCalendar();
    else if(typeof tpRenderView==='function')tpRenderView('Мэдээлэл');
    return true;
  }
  if(membership.role==='parent'){
    if(link.startsWith('chat:')&&typeof ppOpenChat==='function')ppOpenChat(link.split(':')[1]);
    else if(link==='parent:polls'&&typeof shRenderPolls==='function')shRenderPolls();
    else if(link==='parent:calendar'&&typeof shRenderCalendar==='function')shRenderCalendar();
    else if(link==='parent:portfolio'&&typeof shRenderPortfolio==='function')shRenderPortfolio();
    else if(link==='parent:assignments')document.getElementById('parentAssignments')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:permissions')document.getElementById('parentPermissions')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:observations')document.getElementById('parentObservations')?.scrollIntoView({behavior:'smooth',block:'start'});
    else if(link==='parent:summaries')document.getElementById('parentMonthlySummary')?.scrollIntoView({behavior:'smooth',block:'start'});
    else document.getElementById('parentAnnouncements')?.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }
  return false;
}
function slStorePushLink(link){if(link)localStorage.setItem('schoollink_push_link',link)}
function slTryPendingPush(){const link=localStorage.getItem('schoollink_push_link')||'';if(link&&slRoutePushLink(link))localStorage.removeItem('schoollink_push_link')}
function slReadPushQuery(){
  try{
    const url=new URL(location.href),link=url.searchParams.get('push');
    if(!link)return;
    slStorePushLink(link);url.searchParams.delete('push');history.replaceState({},'',url.pathname+url.search+url.hash);
  }catch(e){console.warn('Push deep link',e)}
}

if('serviceWorker'in navigator){
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='schoollink-push-open'){slStorePushLink(event.data.link||'');setTimeout(slTryPendingPush,300)}});
}

if(typeof slEnsureNotificationUI==='function'){
  const base=slEnsureNotificationUI;
  slEnsureNotificationUI=function(){base();setTimeout(slEnsurePushButton,0)};
}

slReadPushQuery();
setInterval(slTryPendingPush,1200);
setTimeout(()=>{slEnsurePushButton();slRefreshPushButton();slStartPushFlush();slPushFlush();slTryPendingPush()},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){slPushFlush();slTryPendingPush()}});