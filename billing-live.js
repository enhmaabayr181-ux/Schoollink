let shBillingReady=false;
const SH_BANK={bank:'Хаан банк',name:'Б.Энхмаа',account:'5301485964'};
const SH_SCHOOL_PLANS=[
  {key:'small',label:'Жижиг сургууль',limit:'10 хүртэл анги',monthly:99000,yearly:990000},
  {key:'medium',label:'Дунд сургууль',limit:'20 хүртэл анги',monthly:149000,yearly:1490000},
  {key:'large',label:'Том сургууль',limit:'Хязгааргүй анги',monthly:199000,yearly:1990000}
];
function shMoney(n){return new Intl.NumberFormat('mn-MN').format(Number(n||0))+'₮'}
function shPlanForClassCount(count){if(count<=10)return SH_SCHOOL_PLANS[0];if(count<=20)return SH_SCHOOL_PLANS[1];return SH_SCHOOL_PLANS[2]}
async function shSchoolBillingContext(){
  try{const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body:{action:'context'}});if(error)throw error;if(data?.error)throw new Error(data.error);return data||{}}catch{return {}}
}
async function shCopyBilling(value,label){try{await navigator.clipboard.writeText(value);alert(label+' хууллаа ✅')}catch{prompt(label+'-ээ хуулна уу:',value)}}

async function shRenderBilling(){
  if(!session?.user||membership?.role!=='admin')return;
  const section=$('admin');if(!section)return;
  const ctx=await shSchoolBillingContext();
  const classes=ctx.classes||[],schoolName=membership.schools?.name||ctx.school?.name||'Сургууль',schoolCode=membership.schools?.code||ctx.school?.code||'';
  const recommended=shPlanForClassCount(classes.length);
  const ref=`${schoolCode||schoolName}`;
  const cards=SH_SCHOOL_PLANS.map(p=>`<div class="notice shPlanCard ${p.key===recommended.key?'featured':''}"><div class="sectionTitle"><div><b>${p.label}</b><div class="muted">${p.limit}</div></div>${p.key===recommended.key?'<span class="pill">ТОХИРОМЖТОЙ</span>':''}</div><div class="shPlanPrice">${shMoney(p.monthly)} <small>/ сар</small></div><div class="muted">Жилээр: <b>${shMoney(p.yearly)}</b> · 2 сарын төлбөр хэмнэнэ</div></div>`).join('');
  section.innerHTML=`<div class="grid"><div class="card hero full"><span class="pill">ТӨЛБӨР</span><h3>💳 Нэг сургууль = нэг төлбөр</h3><p>${esc(schoolName)} · Багш, мэргэжлийн багш, удирдлага, эцэг эхээс тусдаа төлбөр авахгүй.</p></div>
  <div class="card narrow"><div class="sectionTitle"><h3>Дансны мэдээлэл</h3><span class="demoTag">${esc(SH_BANK.bank)}</span></div><div class="notice"><b>Данс эзэмшигч: ${esc(SH_BANK.name)}</b><div class="codeBox" style="font-size:22px;letter-spacing:1px">${SH_BANK.account}</div><button class="ghost" style="width:100%;margin-top:9px" onclick="shCopyBilling('${SH_BANK.account}','Дансны дугаар')">Дансны дугаар хуулах</button></div><label>Гүйлгээний утга</label><div class="notice"><b>${esc(ref)}</b><p>Сургуулийн нэр эсвэл SL кодоо бичнэ.</p><button class="ghost" style="width:100%" onclick="shCopyBilling('${String(ref).replaceAll("'","\\'")}','Гүйлгээний утга')">Гүйлгээний утга хуулах</button></div></div>
  <div class="card wide"><div class="sectionTitle"><h3>Сургуулийн багц</h3><span class="pill">${classes.length} анги</span></div><div class="shPlanGrid">${cards}</div><div class="notice" style="margin-top:12px"><b>Төлбөрийн дараалал</b><p>1. Ангийн тоондоо тохирох багцаа сонгоно. 2. Дээрх данс руу шилжүүлнэ. 3. Гүйлгээний утгад сургуулийн нэр эсвэл SL код бичнэ. 4. Төлбөр шалгагдсаны дараа сургуулийн эрх идэвхжинэ.</p></div></div>
  <div class="card full"><div class="sectionTitle"><h3>Хэн төлбөр төлөх вэ?</h3></div><div class="notice"><b>Зөвхөн сургууль</b><p>Удирдлага, ангийн багш, мэргэжлийн багш, эцэг эхийн account тус бүрээс төлбөр авахгүй. Сургуулийн багц идэвхтэй байхад бүх холбогдсон хэрэглэгч ажиллана.</p></div></div></div>`;
  $('title').textContent='Төлбөр';
}
window.shRenderBilling=shRenderBilling;
window.shCopyBilling=shCopyBilling;

function shBindBillingNav(){if(!membership||membership.role!=='admin'||!$('nav'))return;let b=$('shBillingNav');if(!b){b=document.createElement('button');b.id='shBillingNav';b.textContent='Төлбөр';$('nav').appendChild(b)}b.onclick=async()=>{[...$('nav').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));await shRenderBilling()}}

function shBillingInit(){if(shBillingReady)return;shBillingReady=true;const prev=setRole;setRole=function(role){prev(role);setTimeout(shBindBillingNav,80)};const obs=new MutationObserver(()=>setTimeout(shBindBillingNav,0));if($('nav'))obs.observe($('nav'),{childList:true});setInterval(shBindBillingNav,1600);setTimeout(shBindBillingNav,500);const style=document.createElement('style');style.textContent=`.shPlanGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.shPlanCard{margin:0}.shPlanCard.featured{outline:2px solid rgba(115,87,255,.25);background:#f7f4ff}.shPlanPrice{font-size:27px;font-weight:900;letter-spacing:-1px;margin:14px 0}.shPlanPrice small{font-size:13px;font-weight:700;color:var(--muted);letter-spacing:0}@media(max-width:900px){.shPlanGrid{grid-template-columns:1fr}.shPlanPrice{font-size:25px}}`;document.head.appendChild(style)}
setTimeout(shBillingInit,0);
