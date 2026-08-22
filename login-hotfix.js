// SchoolHub login reliability hotfix for iPhone/Safari.
(function(){
  const login=document.getElementById('login');
  const signup=document.getElementById('signup');
  const email=document.getElementById('email');
  const password=document.getElementById('password');
  const status=document.getElementById('authStatus');
  if(!login||!email||!password||typeof sb==='undefined')return;

  function setBusy(v){
    login.disabled=!!v;
    if(signup)signup.disabled=!!v;
    login.textContent=v?'Нэвтэрч байна…':'Нэвтрэх';
  }
  function fail(msg){
    try{showStatus(status,msg,'err')}catch{if(status){status.textContent=msg;status.className='status show err'}}
  }
  function withTimeout(p,ms,msg){
    return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error(msg)),ms))]);
  }

  login.onclick=async function(e){
    e?.preventDefault?.();
    if(login.disabled)return;
    const mail=email.value.trim();
    const pass=password.value;
    if(!mail||pass.length<6){fail('И-мэйл болон нууц үгээ зөв оруулна уу.');return;}
    if(!navigator.onLine){fail('Интернэт холболтоо шалгаад дахин оролдоно уу.');return;}

    setBusy(true);
    try{
      try{clearStatus(status)}catch{}
      try{savePendingInvite?.()}catch{}
      try{showStatus(status,'Нэвтэрч байна…')}catch{}

      const result=await withTimeout(
        sb.auth.signInWithPassword({email:mail,password:pass}),
        15000,
        'Нэвтрэх хүсэлт удаж байна. Дахин оролдоно уу.'
      );
      if(result?.error)throw result.error;
      if(!result?.data?.session)throw new Error('Session үүссэнгүй. Дахин оролдоно уу.');

      session=result.data.session;
      try{showStatus(status,'Амжилттай нэвтэрлээ. Эрхийг шалгаж байна…','ok')}catch{}
      await withTimeout(
        Promise.resolve(resolveAccess()),
        15000,
        'Нэвтэрсэн боловч эрх шалгах хэсэг удаж байна.'
      );
    }catch(err){
      const msg=String(err?.message||err||'Нэвтрэхэд алдаа гарлаа.');
      fail('Нэвтрэх алдаа: '+msg);
      const app=document.getElementById('app');
      const join=document.getElementById('joinWrap');
      const auth=document.getElementById('authWrap');
      if(app?.classList.contains('hidden')&&join?.classList.contains('hidden'))auth?.classList.remove('hidden');
    }finally{
      const auth=document.getElementById('authWrap');
      if(auth&&!auth.classList.contains('hidden'))setBusy(false);
    }
  };
})();
