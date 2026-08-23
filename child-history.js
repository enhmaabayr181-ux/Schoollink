(() => {
  const style=document.createElement('style');
  style.textContent='.shHistory{position:relative;padding-left:30px}.shHistory:before{content:"";position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:#e4defe}.shHistoryItem{position:relative;margin-bottom:12px;padding:14px 16px;border:1px solid var(--line);border-radius:18px;background:#fff}.shHistoryItem:before{content:"";position:absolute;left:-25px;top:19px;width:12px;height:12px;border-radius:50%;background:#765ff2;border:3px solid #eeeaff}.shHistoryDate{font-size:12px;color:var(--muted);margin-bottom:5px}.shHistoryItem b{display:block}.shHistoryItem p{margin:5px 0 0;color:var(--muted)}';
  document.head.appendChild(style);
  const fmt=v=>{try{return new Date(v).toLocaleDateString('mn-MN',{year:'numeric',month:'long',day:'numeric'})}catch{return String(v||'')}};
  const safe=v=>typeof esc==='function'?esc(v):String(v||'');
  function events(){
    if(!window.parentData&&!parentData)return [];
    const d=window.parentData||parentData,out=[];
    if(d.attendance)out.push({date:d.attendance.marked_at||d.attendance.attendance_date,icon:'✅',title:'Ирц · '+(typeof parentStatusLabel==='function'?parentStatusLabel(d.attendance.status):d.attendance.status),body:d.attendance.note||''});
    (d.assignments||[]).forEach(x=>out.push({date:x.created_at,icon:'📝',title:'Даалгавар · '+x.subject,body:x.title+(x.due_at?' · Дуусах '+fmt(x.due_at):'')}));
    (d.observations||[]).forEach(x=>out.push({date:x.observed_at||x.created_at,icon:'🌱',title:'Багшийн ажиглалт · '+x.subject,body:x.note+(x.next_step?' · Дараагийн алхам: '+x.next_step:'')}));
    (d.summaries||[]).forEach(x=>out.push({date:x.updated_at||x.month_start,icon:'📈',title:'Сарын ахицын тайлан',body:x.parent_summary||x.support_plan||''}));
    return out.filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date));
  }
  function render(){
    const section=document.getElementById('parent'),data=events();
    const child=(typeof parentData!=='undefined'&&parentData?.child?.full_name)||'Хүүхэд';
    const rows=data.length?data.map(x=>'<div class="shHistoryItem"><div class="shHistoryDate">'+safe(fmt(x.date))+'</div><b>'+x.icon+' '+safe(x.title)+'</b>'+(x.body?'<p>'+safe(x.body)+'</p>':'')+'</div>').join(''):'<div class="shHistoryItem"><div class="shHistoryDate">Өнөөдөр</div><b>🌱 Хөгжлийн түүх эхэллээ</b><p>Ирц, даалгавар, ажиглалт болон сарын тайлан энд хугацааны дарааллаар харагдана.</p></div>';
    section.innerHTML='<div class="grid"><div class="card hero full"><span class="pill">ЭЦЭГ ЭХ</span><h3>🌱 '+safe(child)+' · Хөгжлийн түүх</h3><p>Хүүхдийн сурлага, оролцоо, ахицын мэдээллийг нэг урсгалаар харна.</p></div><div class="card full"><div class="sectionTitle"><h3>Үйл явдлын дараалал</h3><span class="demoTag">'+(data.length?'LIVE':'ЭХЛЭЛ')+'</span></div><div class="shHistory">'+rows+'</div></div></div>';
    document.getElementById('title').textContent='Хөгжлийн түүх';
  }
  function bind(){
    const section=document.querySelector('.page.active');if(section?.id!=='parent')return;
    const nav=document.getElementById('nav');if(!nav)return;
    let b=document.getElementById('shChildHistoryNav');
    if(!b){b=document.createElement('button');b.id='shChildHistoryNav';b.dataset.shLabel='Хөгжлийн түүх';b.textContent='🌱 Хөгжлийн түүх';nav.appendChild(b)}
    b.onclick=()=>{[...nav.querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));render()};
  }
  document.addEventListener('click',e=>{if(e.target.closest('.rolebar [data-role="parent"]'))setTimeout(bind,200)});
  setInterval(bind,1800);setTimeout(bind,700);
})();