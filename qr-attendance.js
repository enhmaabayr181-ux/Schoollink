(() => {
  const style=document.createElement('style');
  style.textContent='.shQrWrap{display:grid;grid-template-columns:280px 1fr;gap:22px;align-items:start}.shQrBox{min-height:250px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);border-radius:24px;padding:18px}.shQrBox img,.shQrBox canvas{max-width:220px!important;width:100%!important;height:auto!important}.shQrActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.shQrCode{font-size:28px;font-weight:900;letter-spacing:5px;color:#4e3bc5}@media(max-width:700px){.shQrWrap{grid-template-columns:1fr}.shQrBox{min-height:220px}.shQrActions .btn,.shQrActions .ghost{width:100%}}';
  document.head.appendChild(style);
  let qrUrl='';
  function code(){return String(Math.floor(100000+Math.random()*900000))}
  function render(){
    const section=document.getElementById('teacher');if(!section)return;
    const cls=(typeof teacherData!=='undefined'&&teacherData?.cls?.name)||'Миний анги';
    section.innerHTML='<div class="grid"><div class="card hero full"><span class="pill">БАГШ</span><h3>▦ QR ирц</h3><p>Утсаараа QR-ийг нээгээд тухайн өдрийн ирцийг шууд бүртгэнэ.</p></div><div class="card full"><div class="shQrWrap"><div id="shQrBox" class="shQrBox"><span class="muted">“QR үүсгэх” товч дарна уу.</span></div><div><div class="sectionTitle"><h3>'+cls+'</h3><span class="demoTag">АЮУЛГҮЙ</span></div><p class="muted">QR нь зөвхөн ирцийн дэлгэцийг нээнэ. Сурагчийг автоматаар тэмдэглэхгүй; багш шалгаад хадгална.</p><div class="notice"><b>Өнөөдрийн нэг удаагийн код</b><div id="shQrCode" class="shQrCode">——</div><p>Шинээр QR үүсгэх бүрт код солигдоно.</p></div><div class="shQrActions"><button class="btn primary" id="shMakeQr">QR үүсгэх</button><button class="ghost" id="shCopyQr">Холбоос хуулах</button><button class="ghost" id="shOpenAttendance">Ирц бүртгэх</button></div><div id="shQrStatus" class="status"></div></div></div></div></div>';
    document.getElementById('title').textContent='QR ирц';
    document.getElementById('shMakeQr').onclick=make;
    document.getElementById('shCopyQr').onclick=copy;
    document.getElementById('shOpenAttendance').onclick=openAttendance;
  }
  function make(){
    const token=code(),box=document.getElementById('shQrBox');qrUrl=location.origin+'/?open=attendance&code='+token;
    document.getElementById('shQrCode').textContent=token;box.innerHTML='';
    if(window.QRCode)new QRCode(box,{text:qrUrl,width:220,height:220,colorDark:'#30266f',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    else box.innerHTML='<div class="notice"><b>QR сан ачаалагдсангүй.</b><p>'+qrUrl+'</p></div>';
    localStorage.setItem('schoolhub_attendance_qr',JSON.stringify({token,createdAt:Date.now()}));
  }
  async function copy(){if(!qrUrl)return alert('Эхлээд QR үүсгэнэ үү.');try{await navigator.clipboard.writeText(qrUrl);alert('QR холбоос хууллаа ✅')}catch{prompt('Холбоосоо хуулна уу:',qrUrl)}}
  function openAttendance(){const target=[...document.querySelectorAll('#nav button')].find(x=>(x.dataset.shLabel||x.textContent.trim()).includes('Ирц'));target?.click()}
  function bind(){
    const active=document.querySelector('.page.active')?.id;if(active!=='teacher')return;
    const nav=document.getElementById('nav');if(!nav)return;
    let b=document.getElementById('shQrAttendanceNav');if(!b){b=document.createElement('button');b.id='shQrAttendanceNav';b.dataset.shLabel='QR ирц';b.textContent='▦ QR ирц';nav.appendChild(b)}
    b.onclick=()=>{[...nav.querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));render()};
  }
  function incoming(){
    const q=new URLSearchParams(location.search);if(q.get('open')!=='attendance')return;
    const tryOpen=()=>{if(document.getElementById('app')?.classList.contains('hidden'))return;const r=(typeof membership!=='undefined'&&membership?.role)||document.querySelector('.page.active')?.id;if(r!=='teacher')return;const target=[...document.querySelectorAll('#nav button')].find(x=>(x.dataset.shLabel||x.textContent.trim()).includes('Ирц'));if(target){target.click();history.replaceState({},'',location.pathname);}};
    setTimeout(tryOpen,1800);setTimeout(tryOpen,4500);
  }
  document.addEventListener('click',e=>{if(e.target.closest('.rolebar [data-role="teacher"]'))setTimeout(bind,200)});
  setInterval(bind,1800);setTimeout(bind,700);incoming();
})();