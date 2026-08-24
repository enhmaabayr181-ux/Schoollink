(() => {
  const KEY='schoolhub_preferences_v1';
  const defaults={largeText:false,reduceMotion:false,compact:false,notifications:true};
  let prefs={...defaults};try{prefs={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
  const style=document.createElement('style');
  style.textContent='.sh-large-text{font-size:18px}.sh-large-text input,.sh-large-text button,.sh-large-text select,.sh-large-text textarea{font-size:1em}.sh-reduce-motion *{animation:none!important;transition:none!important;scroll-behavior:auto!important}.sh-compact .card,.sh-compact .shDaily,.sh-compact .shAlerts{padding:13px!important}.sh-compact .grid{gap:10px!important}.shSettings{display:grid;gap:10px}.shSetting{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid var(--line);border-radius:18px;background:#fff}.shSetting b{display:block}.shSetting span{display:block;color:var(--muted);font-size:12px;margin-top:4px}.shSwitch{position:relative;width:50px;height:29px;flex:0 0 auto}.shSwitch input{opacity:0;position:absolute}.shSwitch i{position:absolute;inset:0;border-radius:999px;background:#d9d6e8;cursor:pointer}.shSwitch i:after{content:"";position:absolute;width:23px;height:23px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 6px #0002;transition:.2s}.shSwitch input:checked+i{background:#7156f6}.shSwitch input:checked+i:after{transform:translateX(21px)}';
  document.head.appendChild(style);
  function apply(){
    document.body.classList.toggle('sh-large-text',prefs.largeText);
    document.body.classList.toggle('sh-reduce-motion',prefs.reduceMotion);
    document.body.classList.toggle('sh-compact',prefs.compact);
    localStorage.setItem(KEY,JSON.stringify(prefs));
  }
  function currentRole(){return document.querySelector('.page.active')?.id||'owner'}
  function toggle(key,value){prefs[key]=value;apply();const status=document.getElementById('shSettingsStatus');if(status){status.textContent='Тохиргоо хадгалагдлаа ✅';status.className='status show ok'}}
  function row(key,title,desc){return '<div class="shSetting"><div><b>'+title+'</b><span>'+desc+'</span></div><label class="shSwitch"><input type="checkbox" data-sh-pref="'+key+'" '+(prefs[key]?'checked':'')+'><i></i></label></div>'}
  function render(){
    const r=currentRole(),section=document.getElementById(r);if(!section)return;
    section.innerHTML='<div class="grid"><div class="card hero full"><span class="pill">ТОХИРГОО</span><h3>⚙ Миний тохиргоо</h3><p>SchoolHub-ийг өөрт эвтэйхэн байдлаар ашиглана.</p></div><div class="card full"><div class="sectionTitle"><h3>Харагдац ба мэдэгдэл</h3><span class="demoTag">ЭНЭ ТӨХӨӨРӨМЖ</span></div><div class="shSettings">'+row('largeText','Том үсэг','Текст болон товчлуурын хэмжээг томруулна.')+row('reduceMotion','Хөдөлгөөн багасгах','Animation болон шилжилтийн эффектийг зогсооно.')+row('compact','Нягт харагдац','Картуудын зайг багасгаж, илүү мэдээлэл харуулна.')+row('notifications','Мэдэгдэл авах','SchoolHub-ийн сануулга, шинэ мэдээллийг харуулна.')+'</div><div id="shSettingsStatus" class="status"></div><button id="shResetPrefs" class="ghost" style="margin-top:14px">Анхны тохиргоонд буцаах</button></div></div>';
    document.getElementById('title').textContent='Тохиргоо';
    section.querySelectorAll('[data-sh-pref]').forEach(x=>x.onchange=()=>toggle(x.dataset.shPref,x.checked));
    document.getElementById('shResetPrefs').onclick=()=>{prefs={...defaults};apply();render()};
  }
  function bind(){
    const nav=document.getElementById('nav');if(!nav||document.getElementById('shSettingsNav'))return;
    const b=document.createElement('button');b.id='shSettingsNav';b.dataset.shLabel='Тохиргоо';b.textContent='⚙ Тохиргоо';b.onclick=()=>{[...nav.querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));render()};nav.appendChild(b);
  }
  apply();setTimeout(bind,700);setInterval(bind,2200);
})();