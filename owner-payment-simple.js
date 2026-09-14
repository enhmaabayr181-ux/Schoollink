(() => {
  const BANK='5301485964',BANK_NAME='Б.Энхмаа';
  const PLANS=[
    {label:'Жижиг сургууль',limit:'10 хүртэл анги',monthly:'99,000₮',yearly:'990,000₮'},
    {label:'Дунд сургууль',limit:'20 хүртэл анги',monthly:'149,000₮',yearly:'1,490,000₮'},
    {label:'Том сургууль',limit:'Хязгааргүй анги',monthly:'199,000₮',yearly:'1,990,000₮'}
  ];
  let schoolHint='Сургууль';
  function captureSchool(){
    const card=document.querySelector('#ownerSchools h4');
    const code=(document.querySelector('#ownerSchools')?.textContent||'').match(/SL-[A-Z0-9]+/)?.[0];
    if(card)schoolHint=card.textContent.trim()+(code?' · '+code:'');
  }
  async function copy(value,label){try{await navigator.clipboard.writeText(value);alert(label+' хууллаа ✅')}catch{prompt(label+'-ээ хуулна уу:',value)}}
  function render(){
    const section=document.getElementById('owner'),grid=section?.querySelector(':scope > .grid');if(!grid)return;
    const planCards=PLANS.map((p,i)=>`<div class="notice shPlanCard ${i===1?'featured':''}"><div class="sectionTitle"><div><b>${p.label}</b><div class="muted">${p.limit}</div></div>${i===1?'<span class="pill">ТҮГЭЭМЭЛ</span>':''}</div><div class="shPlanPrice">${p.monthly} <small>/ сар</small></div><p>Жилээр: <b>${p.yearly}</b> · 2 сарын төлбөр хэмнэнэ.</p></div>`).join('');
    grid.innerHTML=`<div class="card hero full"><span class="pill">ТӨЛБӨР</span><h3>Нэг сургууль = нэг төлбөр</h3><p>Owner болон тухайн сургуулийн удирдлага төлбөрийн мэдээллийг харна. Багш, мэргэжлийн багш, эцэг эхээс тусдаа төлбөр авахгүй.</p></div>
    <div class="card narrow"><div class="sectionTitle"><h3>Дансны мэдээлэл</h3><span class="demoTag">ХААН БАНК</span></div><div class="notice"><b>Данс эзэмшигч: ${BANK_NAME}</b><div class="codeBox" style="font-size:22px;margin-top:10px">${BANK}</div><button class="ghost tpFull" style="margin-top:9px" id="shOwnerCopyBank">Дансны дугаар хуулах</button></div><label>Гүйлгээний утга</label><div class="notice"><b>${schoolHint}</b><p>Сургуулийн нэр эсвэл SL кодоо бичнэ.</p><button class="ghost tpFull" id="shOwnerCopyRef">Гүйлгээний утга хуулах</button></div></div>
    <div class="card wide"><div class="sectionTitle"><h3>Сургуулийн багц</h3><span class="pill">Сургууль бүхэлдээ</span></div><div class="shPlanGrid">${planCards}</div><div class="shPaySteps"><b>Төлбөрийн дараалал</b><span>1. Сургуулийнхаа ангийн тоонд тохирох багцыг сонгоно.</span><span>2. Дээрх данс руу шилжүүлнэ.</span><span>3. Гүйлгээний утгад сургуулийн нэр эсвэл SL код бичнэ.</span><span>4. Төлбөр шалгагдсаны дараа тухайн сургуулийн эрх идэвхжинэ.</span></div><div class="notice" style="margin-top:12px"><b>Хэрэглэгч тус бүр төлөхгүй</b><p>Нэг сургуулийн эрх идэвхтэй байхад Удирдлага, ангийн багш, мэргэжлийн багш, эцэг эх бүгд тусдаа төлбөргүй ашиглана.</p></div></div>`;
    document.getElementById('title').textContent='Төлбөр';
    document.getElementById('shOwnerCopyBank').onclick=()=>copy(BANK,'Дансны дугаар');
    document.getElementById('shOwnerCopyRef').onclick=()=>copy(schoolHint,'Гүйлгээний утга');
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('#nav button');if(!b)return;
    const label=b.dataset.shLabel||b.querySelector('.sh-nav-label')?.textContent?.trim()||b.textContent.trim();
    if(label==='Багц & төлбөр')setTimeout(render,80);
  });
  setInterval(captureSchool,1500);setTimeout(captureSchool,700);
})();
