(() => {
  const style=document.createElement('style');
  style.textContent='.shPayCopy{margin-left:8px}.shPaySteps{display:grid;gap:8px;margin-top:14px;padding:14px;border-radius:18px;background:#f6f3ff}.shPaySteps span{font-size:13px;color:var(--muted)}.shPayStatusCard{margin-top:12px;border-left:4px solid #765ff2}@media(max-width:700px){.shPayCopy{width:100%;margin:8px 0 0}.shPaySteps{padding:12px}}';
  document.head.appendChild(style);
  async function copy(value,label){
    try{await navigator.clipboard.writeText(value);const s=document.getElementById('shPaymentStatus');if(s){s.textContent=label+' хууллаа ✅';s.className='status ok'}}
    catch{prompt(label+'-ээ хуулна уу:',value)}
  }
  function enhance(){
    const section=document.getElementById('admin');if(!section||!section.querySelector('.shPlanGrid'))return;
    const boxes=[...section.querySelectorAll('.codeBox,.notice')];
    const account=boxes.find(x=>x.textContent.includes('5301485964'));
    const reference=boxes.find(x=>x.querySelector('b')&&x.textContent.includes('@'));
    [[account,'5301485964','Дансны дугаар'],[reference,reference?.querySelector('b')?.textContent?.trim(),'Гүйлгээний утга']].forEach(([box,value,label])=>{
      if(!box||!value||box.querySelector('.shPayCopy'))return;
      const b=document.createElement('button');b.type='button';b.className='ghost shPayCopy';b.textContent='Хуулах';
      b.onclick=()=>copy(value,label);box.appendChild(b);
    });
    const narrow=section.querySelector('.card.narrow');
    if(narrow&&!narrow.querySelector('.shPaySteps')){
      const steps=document.createElement('div');steps.className='shPaySteps';
      steps.innerHTML='<b>Төлөх дараалал</b><span>1. Багцаа сонгоно</span><span>2. Дансаар шилжүүлнэ</span><span>3. “Төлбөр хийсэн” товч дарна</span><span>4. Баталгаажсаны дараа эрх сунгагдана</span>';
      narrow.appendChild(steps);
    }
    const status=document.getElementById('shPaymentStatus');
    if(status&&!status.nextElementSibling?.classList.contains('shPayStatusCard')){
      const tip=document.createElement('div');tip.className='notice shPayStatusCard';
      tip.innerHTML='<b>Төлбөр хэрхэн баталгаажих вэ?</b><p>Хүсэлт илгээсний дараа “Шалгаж байна” төлөвтэй болно. Баталгаажмагц сургуулийн эрх автоматаар сунгагдана.</p>';
      status.after(tip);
    }
  }
  new MutationObserver(()=>setTimeout(enhance,50)).observe(document.body,{childList:true,subtree:true});
  setInterval(enhance,1600);setTimeout(enhance,600);
})();