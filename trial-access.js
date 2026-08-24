(() => {
  let lastKey='',checking=false;
  const style=document.createElement('style');
  style.textContent=`
    .shTrialBanner{position:sticky;top:8px;z-index:9000;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:12px 15px;border-radius:17px;background:#fff7dc;border:1px solid #f0d98a;color:#594a18;box-shadow:0 8px 24px rgba(72,55,8,.10)}
    .shTrialBanner.danger{background:#fff0f1;border-color:#ffc7cd;color:#7b2530}.shTrialBanner b{display:block}.shTrialBanner small{display:block;margin-top:3px;opacity:.8}.shTrialBanner button{flex:0 0 auto}
    .shAccessGate{position:fixed;inset:0;z-index:13000;background:rgba(30,23,65,.58);backdrop-filter:blur(10px);display:grid;place-items:center;padding:16px}.shAccessGate.hidden{display:none}
    .shAccessCard{width:min(560px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:28px;padding:22px;box-shadow:0 28px 90px rgba(20,12,60,.35)}.shAccessCard h2{margin:8px 0}.shAccessPlans{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.shAccessPlan{padding:15px;border:1px solid var(--line);border-radius:18px;background:#faf9ff}.shAccessPlan.featured{border:2px solid #765ff2;background:#f5f1ff}.shAccessPrice{font-size:27px;font-weight:900;color:#33247a;margin:9px 0}.shAccessBank{padding:14px;border-radius:17px;background:#f7f5ff;line-height:1.7}
    @media(max-width:620px){.shTrialBanner{align-items:flex-start}.shAccessPlans{grid-template-columns:1fr}.shAccessCard{padding:18px;border-radius:23px}.shAccessPrice{font-size:24px}}
  `;
  document.head.appendChild(style);
  const gate=document.createElement('div');gate.id='shAccessGate';gate.className='shAccessGate hidden';
  gate.innerHTML=`<div class="shAccessCard"><span class="pill">SCHOOLHUB ЭРХ</span><h2>Туршилтын хугацаа дууслаа</h2><p class="muted">SchoolHub-ийг үргэлжлүүлэн ашиглахын тулд багцаа сонгоод төлбөрийн хүсэлт илгээнэ үү.</p><div class="shAccessPlans"><div class="shAccessPlan"><b>Сарын эрх</b><div class="shAccessPrice">15,000₮</div><button class="btn primary tpFull" data-sh-pay="monthly">Төлбөр хийсэн</button></div><div class="shAccessPlan featured"><b>Жилийн эрх</b><div class="shAccessPrice">150,000₮</div><small>2 сарын төлбөр хэмнэнэ</small><button class="btn primary tpFull" data-sh-pay="yearly">Төлбөр хийсэн</button></div></div><div class="shAccessBank"><b>Хаан банк · Б.Энхмаа</b><br><b style="font-size:20px">5301485964</b><br><span class="muted">Гүйлгээний утга: сургуулийн код + бүртгэлтэй и-мэйл</span></div><div id="shPaymentStatus" class="status"></div><p class="muted" style="font-size:12px;margin-bottom:0">Хүсэлт баталгаажсаны дараа эрх нээгдэнэ.</p></div>`;
  document.body.appendChild(gate);
  gate.querySelectorAll('[data-sh-pay]').forEach(b=>b.onclick=()=>window.shPaymentDone?.(b.dataset.shPay));

  function pay(){window.shRenderBilling?.()}
  function putBanner(data){
    document.getElementById('shTrialBanner')?.remove();
    const sub=data.subscription||{},now=Date.now();
    const end=sub.status==='trialing'?sub.trial_ends_at:sub.status==='active'?sub.current_period_ends_at:null;
    const ms=end?new Date(end).getTime()-now:null;
    const isTrial=sub.status==='trialing';
    if(data.access_open&&ms!=null&&ms>0&&ms<=3*24*3600_000){
      const hours=Math.max(1,Math.ceil(ms/3600_000)),days=Math.ceil(hours/24);
      const banner=document.createElement('div');banner.id='shTrialBanner';banner.className='shTrialBanner '+(ms<=24*3600_000?'danger':'');
      banner.innerHTML=`<div><b>${isTrial?'Үнэгүй туршилт':'SchoolHub эрх'} дуусах гэж байна</b><small>${hours<=24?hours+' цаг':days+' хоног'} үлдлээ. Тасралтгүй ашиглахын тулд эрхээ сунгана уу.</small></div><button class="ghost" type="button">Төлбөр харах</button>`;
      banner.querySelector('button').onclick=pay;
      document.querySelector('.main')?.prepend(banner);
    }
    gate.classList.toggle('hidden',!!data.access_open);
  }
  async function check(){
    if(checking||!window.sb||!window.session?.user||!window.membership||!['teacher','admin'].includes(membership.role))return;
    checking=true;
    try{
      const {data,error}=await sb.functions.invoke('schoollink-school-workflow',{body:{action:'context'}});
      if(error)throw error;if(!data)return;
      const key=[data.access_open,data.subscription?.status,data.subscription?.trial_ends_at,data.subscription?.current_period_ends_at].join('|');
      if(key!==lastKey){lastKey=key;putBanner(data)}
    }catch(e){console.warn('SchoolHub access check',e)}finally{checking=false}
  }
  const observer=new MutationObserver(()=>setTimeout(check,80));observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(check,900);setInterval(check,60000);
})();