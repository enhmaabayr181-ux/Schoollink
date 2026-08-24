(() => {
  const BANK='5301485964',BANK_NAME='Б.Энхмаа';
  let schoolHint='Сургууль';
  function captureSchool(){
    const card=document.querySelector('#ownerSchools h4');
    const code=(document.querySelector('#ownerSchools')?.textContent||'').match(/SL-[A-Z0-9]+/)?.[0];
    if(card)schoolHint=card.textContent.trim()+(code?' · '+code:'');
  }
  async function copy(value,label){
    try{await navigator.clipboard.writeText(value);alert(label+' хууллаа ✅')}catch{prompt(label+'-ээ хуулна уу:',value)}
  }
  function render(){
    const section=document.getElementById('owner'),grid=section?.querySelector(':scope > .grid');if(!grid)return;
    grid.innerHTML=`<div class="card hero full"><span class="pill">ТӨЛБӨР</span><h3>SchoolHub эрх сунгах</h3><p>Owner болон сургуулийн удирдлага хоёулаа төлбөрийн мэдээллийг эндээс харна.</p></div>
    <div class="card narrow"><div class="sectionTitle"><h3>Дансны мэдээлэл</h3><span class="demoTag">ХААН БАНК</span></div><div class="notice"><b>Данс эзэмшигч: ${BANK_NAME}</b><div class="codeBox" style="font-size:22px;margin-top:10px">${BANK}</div><button class="ghost tpFull" style="margin-top:9px" id="shOwnerCopyBank">Дансны дугаар хуулах</button></div><label>Гүйлгээний утга</label><div class="notice"><b>${schoolHint}</b><p>Сургуулийн нэр эсвэл SL кодоо бичнэ.</p><button class="ghost tpFull" id="shOwnerCopyRef">Гүйлгээний утга хуулах</button></div></div>
    <div class="card wide"><div class="sectionTitle"><h3>Багц сонгох</h3><span class="pill">Эцэг эх үнэгүй</span></div><div class="shPlanGrid"><div class="notice shPlanCard"><b>SchoolHub сарын эрх</b><div class="shPlanPrice">15,000₮</div><p>Сар бүр сунгана · Эцэг эх үнэгүй</p></div><div class="notice shPlanCard featured"><b>SchoolHub жилийн эрх</b><div class="shPlanPrice">150,000₮</div><p>2 сарын төлбөр хэмнэнэ · Эцэг эх үнэгүй</p><span class="pill">ХЭМНЭЛТТЭЙ</span></div></div><div class="shPaySteps"><b>Хамгийн энгийн дараалал</b><span>1. Багцаа сонгоод дээрх данс руу шилжүүлнэ.</span><span>2. Гүйлгээний утгад сургуулийн нэр эсвэл SL код бичнэ.</span><span>3. Шилжүүлсний дараа SchoolHub админд мэдэгдэнэ.</span></div><div class="notice" style="margin-top:12px"><b>“Удирдлага” гэж юу вэ?</b><p>Owner нь бүх SchoolHub-ийг хянадаг. Удирдлага нь зөвхөн нэг сургуулийн өдөр тутмын эрх юм. Төлбөр харахын тулд заавал Удирдлага руу шилжих шаардлагагүй боллоо.</p></div></div>`;
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