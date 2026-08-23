(() => {
  const style=document.createElement('style');
  style.textContent='.shReportActions{display:flex;gap:9px;flex-wrap:wrap}.shReportOutput{min-height:180px;white-space:pre-wrap;line-height:1.65;background:#fbfaff;border:1px solid #e4defe;border-radius:20px;padding:18px;margin-top:14px}.shReportOutput.loading{color:var(--muted)}.shReportMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.shReportMeta div{padding:13px;border-radius:16px;background:#f5f2ff}.shReportMeta b,.shReportMeta span{display:block}.shReportMeta span{font-size:12px;color:var(--muted);margin-bottom:5px}@media(max-width:700px){.shReportMeta{grid-template-columns:1fr}.shReportActions .btn{width:100%}}';
  document.head.appendChild(style);
  let reportText='';
  const get=id=>document.getElementById(id)?.textContent?.trim()||'—';
  function role(){return document.querySelector('.page.active')?.id||'teacher'}
  function context(){
    const r=role();
    if(r==='teacher')return {label:'Багш',student:get('teacherStudentCount'),attendance:get('teacherAttendance'),attention:get('teacherAttentionCount'),assignments:get('teacherAssignmentCount')};
    if(r==='admin')return {label:'Сургуулийн удирдлага',student:'Сургуулийн сурагчид',attendance:'Нэгдсэн ирц',attention:'Анхаарах үзүүлэлт',assignments:'Сургалтын ажил'};
    return {label:'SchoolHub Owner',student:get('ownerMetrics'),attendance:'Нэгдсэн хяналт',attention:'Сургуулиуд',assignments:'Системийн идэвх'};
  }
  function render(){
    const r=role(),section=document.getElementById(r),c=context();if(!section)return;
    section.innerHTML='<div class="grid"><div class="card hero full"><span class="pill">AI ТАЙЛАН</span><h3>✦ Ухаалаг тайлан үүсгэх</h3><p>Өгөгдлийг ойлгомжтой Монгол тайлан, зөвлөмж болгон боловсруулна.</p></div><div class="card full"><div class="shReportMeta"><div><span>Хэрэглэгч</span><b>'+c.label+'</b></div><div><span>Сурагч / хамрах хүрээ</span><b>'+c.student+'</b></div><div><span>Ирц</span><b>'+c.attendance+'</b></div></div><div class="shReportActions" style="margin-top:14px"><button class="btn primary" id="shDailyReport">Өнөөдрийн тайлан</button><button class="btn secondary" id="shMonthlyReport">Сарын тайлан</button><button class="ghost" id="shCopyReport">Тайлан хуулах</button></div><div id="shReportStatus" class="status"></div><div id="shReportOutput" class="shReportOutput">Тайлангийн төрлөө сонгоно уу.</div></div></div>';
    document.getElementById('title').textContent='AI тайлан';
    document.getElementById('shDailyReport').onclick=()=>generate('өнөөдрийн');
    document.getElementById('shMonthlyReport').onclick=()=>generate('сарын');
    document.getElementById('shCopyReport').onclick=copy;
  }
  async function generate(period){
    const out=document.getElementById('shReportOutput'),status=document.getElementById('shReportStatus'),c=context();
    out.classList.add('loading');out.textContent='AI тайлан боловсруулж байна…';status.textContent='';
    const prompt='SchoolHub-ийн '+c.label+' хэрэглэгчид зориулсан '+period+' тайланг Монгол хэлээр бич. Одоогийн мэдээлэл: сурагч/хамрах хүрээ '+c.student+', ирц '+c.attendance+', анхаарах '+c.attention+', даалгавар '+c.assignments+'. 1) товч дүгнэлт 2) сайн үзүүлэлт 3) анхаарах зүйл 4) дараагийн 3 бодит алхам гэсэн бүтэцтэй, эерэг бөгөөд тодорхой бич.';
    try{const {data,error}=await sb.functions.invoke('schoolhub-ai',{body:{prompt}});if(error)throw error;if(data?.error)throw new Error(data.error);reportText=data?.answer||'Тайлан үүссэнгүй.';out.textContent=reportText;out.classList.remove('loading')}
    catch(e){out.classList.remove('loading');out.textContent='AI тайлан үүсгэхэд алдаа гарлаа.';status.textContent=e.message||'Дахин оролдоно уу.';status.className='status show err'}
  }
  async function copy(){if(!reportText)return alert('Эхлээд тайлан үүсгэнэ үү.');try{await navigator.clipboard.writeText(reportText);alert('Тайлан хууллаа ✅')}catch{prompt('Тайлангаа хуулна уу:',reportText)}}
  function bind(){
    const r=role();if(!['teacher','admin','owner'].includes(r))return;
    const nav=document.getElementById('nav');if(!nav)return;
    let b=document.getElementById('shAiReportNav');if(!b){b=document.createElement('button');b.id='shAiReportNav';b.dataset.shLabel='AI тайлан';b.textContent='✦ AI тайлан';nav.appendChild(b)}
    b.onclick=()=>{[...nav.querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));render()};
  }
  document.addEventListener('click',e=>{if(e.target.closest('.rolebar button'))setTimeout(bind,200)});
  setInterval(bind,1800);setTimeout(bind,700);
})();