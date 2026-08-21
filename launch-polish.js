// SchoolHub final launch polish: auth feedback, safe logout, local-date attendance, mobile nav and network states.
let shLaunchBusyCount=0;

function shEnsureLaunchOverlay(){
  if(document.getElementById('shLaunchOverlay'))return document.getElementById('shLaunchOverlay');
  const el=document.createElement('div');el.id='shLaunchOverlay';el.className='shLaunchOverlay hidden';
  el.innerHTML='<div class="shLaunchLoader"><img src="/icons/schoolhub-192.svg" alt="SchoolHub"><div><b>SchoolHub</b><span id="shLaunchOverlayText">Ачаалж байна…</span></div><i></i></div>';
  document.body.appendChild(el);return el;
}
function shLaunchBusy(text='Ачаалж байна…'){
  shLaunchBusyCount++;const el=shEnsureLaunchOverlay();const t=document.getElementById('shLaunchOverlayText');if(t)t.textContent=text;el.classList.remove('hidden');
}
function shLaunchDone(){
  shLaunchBusyCount=Math.max(0,shLaunchBusyCount-1);if(shLaunchBusyCount===0)shEnsureLaunchOverlay().classList.add('hidden');
}
window.shLaunchBusy=shLaunchBusy;window.shLaunchDone=shLaunchDone;

function shLocalDate(){
  if(typeof shToday==='function')return shToday();
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>p.find(x=>x.type===t)?.value||'';return `${g('year')}-${g('month')}-${g('day')}`;
}

// The base attendance save used UTC date. Keep the same write model but always use Ulaanbaatar's calendar date.
window.saveAttendance=async function(){
  try{
    if(!teacherData?.cls)throw new Error('Анги холбогдоогүй.');
    showStatus($('attendanceStatus'),'Хадгалж байна…');
    const date=shLocalDate(),existing=new Map((teacherData.attendance||[]).map(a=>[a.student_id,a.id]));
    for(const el of document.querySelectorAll('[data-att-student]')){
      const row={school_id:teacherData.schoolId,class_id:teacherData.cls.id,student_id:el.dataset.attStudent,attendance_date:date,status:el.value,marked_by:session.user.id,marked_at:new Date().toISOString()},id=existing.get(row.student_id);
      const {error}=id?await sb.from('attendance').update(row).eq('id',id):await sb.from('attendance').insert(row);if(error)throw error;
    }
    showStatus($('attendanceStatus'),'Ирц хадгалагдлаа ✅','ok');await loadTeacherDashboard();
  }catch(e){showStatus($('attendanceStatus'),e.message,'err')}
};

function shFillPendingInvite(){
  try{
    if(!$('joinWrap')||$('joinWrap').classList.contains('hidden'))return;
    const p=typeof readPendingInvite==='function'?readPendingInvite():JSON.parse(localStorage.getItem('schoollink_pending_invite')||'null');
    if(!p)return;
    if($('joinInviteCode')&&!$('joinInviteCode').value)$('joinInviteCode').value=p.code||'';
    if($('joinFullName')&&!$('joinFullName').value)$('joinFullName').value=p.fullName||'';
  }catch{}
}

function shSetButtonBusy(btn,busy,label){
  if(!btn)return;if(!btn.dataset.shOriginal)btn.dataset.shOriginal=btn.textContent;
  btn.disabled=!!busy;btn.classList.toggle('shBusy',!!busy);btn.textContent=busy?label:(btn.dataset.shOriginal||btn.textContent);
}
function shWatchAuthStatus(){
  const sync=()=>{
    const a=$('authStatus')?.textContent||'',j=$('joinStatus')?.textContent||'';
    const loginBusy=/Нэвтэрч байна|Бүртгэл үүсгэж байна/.test(a),joinBusy=/холбож байна|нэгдэж байна/i.test(j);
    shSetButtonBusy($('login'),loginBusy,'Түр хүлээнэ үү…');shSetButtonBusy($('signup'),loginBusy,'Түр хүлээнэ үү…');shSetButtonBusy($('joinBtn'),joinBusy,'Холбож байна…');
  };
  const obs=new MutationObserver(()=>{sync();shFillPendingInvite()});
  [$('authStatus'),$('joinStatus'),$('authWrap'),$('joinWrap'),$('app')].filter(Boolean).forEach(el=>obs.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}));sync();
}

function shHookResolveAccess(){
  if(typeof window.resolveAccess!=='function'||window.resolveAccess.__shLaunchWrapped)return;
  const base=window.resolveAccess;
  const wrapped=async function(){shLaunchBusy('Таны эрхийг шалгаж байна…');try{return await base()}finally{shLaunchDone();setTimeout(()=>{shFillPendingInvite();shCenterActiveNav()},80)}};
  wrapped.__shLaunchWrapped=true;window.resolveAccess=wrapped;
}

function shHookLogout(id){
  const b=$(id);if(!b||b.dataset.shLogoutWrapped==='1')return;b.dataset.shLogoutWrapped='1';
  const old=b.onclick;
  b.onclick=async e=>{
    e?.preventDefault?.();if(b.disabled)return;b.disabled=true;const txt=b.textContent;b.textContent='Гарч байна…';shLaunchBusy('Системээс гарч байна…');
    try{clearPendingInvite?.();const {error}=await sb.auth.signOut();if(error)throw error;location.reload()}catch(err){shLaunchDone();b.disabled=false;b.textContent=txt;alert('Гарахад алдаа гарлаа: '+(err.message||err))}
  };
  b.dataset.shOldLogout=old?'1':'0';
}

function shCenterActiveNav(){
  if(window.innerWidth>900)return;const nav=$('nav'),active=nav?.querySelector('button.active');if(!nav||!active)return;
  try{active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}catch{}
}
function shBindMobileNavPolish(){
  const nav=$('nav');if(!nav||nav.dataset.shLaunchNav==='1')return;nav.dataset.shLaunchNav='1';
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;setTimeout(shCenterActiveNav,40)});
  const obs=new MutationObserver(()=>setTimeout(shCenterActiveNav,30));obs.observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}

function shEnsureNetworkBanner(){
  if(document.getElementById('shNetworkBanner'))return;const b=document.createElement('div');b.id='shNetworkBanner';b.className='shNetworkBanner hidden';b.textContent='📡 Интернэт холболт тасарсан байна. Зарим үйлдэл түр ажиллахгүй.';document.body.appendChild(b);
  const sync=()=>b.classList.toggle('hidden',navigator.onLine);window.addEventListener('online',sync);window.addEventListener('offline',sync);sync();
}

function shEnterShortcuts(){
  const email=$('email'),password=$('password'),join=$('joinInviteCode');
  [email,password].filter(Boolean).forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('login')?.disabled)$('login')?.click()}));
  join?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('joinBtn')?.disabled)$('joinBtn')?.click()});
}

(function shLaunchInit(){
  shEnsureLaunchOverlay();shEnsureNetworkBanner();shWatchAuthStatus();shHookResolveAccess();shHookLogout('logout');shHookLogout('joinLogout');shBindMobileNavPolish();shFillPendingInvite();shEnterShortcuts();
  const globalObs=new MutationObserver(()=>{shHookResolveAccess();shHookLogout('logout');shHookLogout('joinLogout');shBindMobileNavPolish();shFillPendingInvite()});
  globalObs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(shCenterActiveNav,80));
  setTimeout(()=>{
    const nothingVisible=$('authWrap')?.classList.contains('hidden')&&$('joinWrap')?.classList.contains('hidden')&&$('app')?.classList.contains('hidden');
    if(nothingVisible){shLaunchBusy('SchoolHub нээгдэж байна…');setTimeout(()=>{shLaunchBusyCount=1;shLaunchDone()},3500)}
    shCenterActiveNav();
  },120);

  const style=document.createElement('style');style.id='shLaunchPolishStyles';style.textContent=`
  .shLaunchOverlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(247,247,252,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .shLaunchLoader{min-width:230px;display:flex;align-items:center;gap:13px;padding:17px 19px;border:1px solid rgba(255,255,255,.9);border-radius:24px;background:rgba(255,255,255,.9);box-shadow:0 24px 70px rgba(43,35,90,.14);position:relative;overflow:hidden}.shLaunchLoader img{width:44px;height:44px;border-radius:13px}.shLaunchLoader b,.shLaunchLoader span{display:block}.shLaunchLoader b{font-size:16px}.shLaunchLoader span{font-size:12px;color:var(--muted);margin-top:3px}.shLaunchLoader i{position:absolute;left:0;bottom:0;height:3px;width:42%;background:linear-gradient(90deg,var(--v),var(--v2));border-radius:99px;animation:shLoadMove 1.1s ease-in-out infinite}@keyframes shLoadMove{0%{transform:translateX(-110%)}100%{transform:translateX(340%)}}
  button.shBusy{opacity:.72;cursor:wait}.shNetworkBanner{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:1100;max-width:min(560px,calc(100vw - 24px));padding:10px 14px;border-radius:14px;background:#24252d;color:#fff;font-size:12px;font-weight:750;box-shadow:0 12px 34px rgba(0,0,0,.18)}
  @media(max-width:900px){.side:after{content:'';position:absolute;right:0;top:0;bottom:0;width:28px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.78));pointer-events:none;z-index:3}.nav{padding-right:18px}.nav button{min-width:82px}.nav button.active{transform:translateY(-1px)}.top{padding-bottom:8px}.main{min-width:0}.shLaunchLoader{min-width:210px}.shNetworkBanner{top:8px}}
  `;document.head.appendChild(style);
})();