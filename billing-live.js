let shBillingReady=false;
const SH_BANK={bank:'Хаан банк',name:'Б.Энхмаа',account:'5301485964'};
const SH_PLANS={monthly:{label:'1 сар',amount:49900},yearly:{label:'1 жил',amount:499000},launch_yearly:{label:'Нээлтийн жилийн үнэ',amount:399000}};
function shMoney(n){return new Intl.NumberFormat('mn-MN').format(Number(n||0))+'₮'}
async function shBillingCall(body){const {data,error}=await sb.functions.invoke('schoolhub-telegram',{body});if(error)throw new Error(error.message||'Төлбөрийн API алдаа');if(data?.error)throw new Error(data.error);return data}

async function shRenderBilling(){
  if(!session?.user||membership?.role!=='admin')return;
  const section=$('admin');if(!section)return;
  let payments=[];try{const r=await shBillingCall({action:'status',school_id:membership.school_id});payments=r.payments||[]}catch{}
  const schoolName=membership.schools?.name||'Сургууль',schoolCode=membership.schools?.code||'';
  const ref=`${schoolCode}-${String(session.user.email||'').toLowerCase()}`;
  const planCard=(key,p,featured=false)=>`<div class="notice shPlanCard ${featured?'featured':''}"><div class="sectionTitle"><div><b>${p.label}</b><div class="muted">SchoolHub сургуулийн эрх</div></div>${featured?'<span class="pill">ОНЦГОЙ</span>':''}</div><div class="shPlanPrice">${shMoney(p.amount)}</div><button class="btn primary tpFull" onclick="shPaymentDone('${key}')">Төлбөр хийсэн</button></div>`;
  const rows=payments.length?payments.map(p=>`<div class="row"><div><b>${SH_PLANS[p.subscription_plan]?.label||p.subscription_plan||'Багц'}</b><small> · ${shMoney(p.amount_mnt)} · ${new Date(p.created_at).toLocaleString('mn-MN')}</small></div><span class="pill">${p.status==='pending'?'Шалгаж байна':p.status==='paid'?'Баталгаажсан':p.status}</span></div>`).join(''):'<div class="empty">Төлбөрийн хүсэлт алга.</div>';
  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">ТӨЛБӨР</span><h3>💳 SchoolHub эрх сунгах</h3><p>${esc(schoolName)} · Дансаар төлөөд “Төлбөр хийсэн” товч дарна уу.</p></div>
  <div class="card narrow"><div class="sectionTitle"><h3>Дансны мэдээлэл</h3><span class="demoTag">BANK</span></div><div class="notice"><b>${SH_BANK.bank}</b><p>Данс эзэмшигч: ${SH_BANK.name}</p><div class="codeBox" style="font-size:22px;letter-spacing:1px">${SH_BANK.account}</div></div><label>Гүйлгээний утга</label><div class="notice"><b>${esc(ref)}</b><p>Сургуулийн код + бүртгэлтэй и-мэйл</p></div></div>
  <div class="card wide"><div class="sectionTitle"><h3>Багц сонгох</h3><span class="pill">Эцэг эх үнэгүй</span></div><div class="shPlanGrid">${planCard('monthly',SH_PLANS.monthly)}${planCard('yearly',SH_PLANS.yearly)}${planCard('launch_yearly',SH_PLANS.launch_yearly,true)}</div><div id="shPaymentStatus" class="status"></div></div>
  <div class="card full"><div class="sectionTitle"><h3>Сүүлийн хүсэлтүүд</h3><button class="ghost" onclick="shRenderBilling()">↻ Шинэчлэх</button></div>${rows}</div></div>`;
  $('title').textContent='Төлбөр';
}
window.shRenderBilling=shRenderBilling;
window.shPaymentDone=async plan=>{const status=$('shPaymentStatus');try{const p=SH_PLANS[plan];if(!p)throw new Error('Багц буруу байна.');if(!confirm(`${p.label} · ${shMoney(p.amount)} төлбөр хийсэн гэж мэдэгдэх үү?`))return;showStatus(status,'Төлбөрийн хүсэлт илгээж байна…');const d=await shBillingCall({action:'payment',school_id:membership.school_id,plan});showStatus(status,d.duplicate?'Энэ төлбөрийн хүсэлт аль хэдийн илгээгдсэн байна. Шалгаж байна ⏳':'Төлбөрийн хүсэлт илгээгдлээ ✅ Шалгасны дараа эрх идэвхжинэ.','ok');setTimeout(shRenderBilling,900)}catch(e){showStatus(status,e.message,'err')}};

function shBindBillingNav(){if(!membership||membership.role!=='admin'||!$('nav'))return;let b=$('shBillingNav');if(!b){b=document.createElement('button');b.id='shBillingNav';b.textContent='Төлбөр';$('nav').appendChild(b)}b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shRenderBilling()}}

// Notify owner after a successful self-service school registration.
if(typeof onboardingCall==='function'){
  const shBaseOnboardingCall=onboardingCall;
  onboardingCall=async function(body){const data=await shBaseOnboardingCall(body);if(body?.action==='create_school'&&data?.school_id){setTimeout(async()=>{try{await shBillingCall({action:'registration',school_id:data.school_id})}catch(e){console.warn('Telegram registration notice',e)}},200)}return data};
}
function shBillingInit(){if(shBillingReady)return;shBillingReady=true;const prev=setRole;setRole=function(role){prev(role);setTimeout(shBindBillingNav,80)};const obs=new MutationObserver(()=>setTimeout(shBindBillingNav,0));if($('nav'))obs.observe($('nav'),{childList:true});setInterval(shBindBillingNav,1600);setTimeout(shBindBillingNav,500);const style=document.createElement('style');style.textContent=`.shPlanGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.shPlanCard{margin:0}.shPlanCard.featured{outline:2px solid rgba(115,87,255,.25);background:#f7f4ff}.shPlanPrice{font-size:28px;font-weight:900;letter-spacing:-1px;margin:14px 0}@media(max-width:760px){.shPlanGrid{grid-template-columns:1fr}.shPlanPrice{font-size:26px}}`;document.head.appendChild(style)}
setTimeout(shBillingInit,0);
