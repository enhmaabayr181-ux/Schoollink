(() => {
  const q=new URLSearchParams(location.search),code=(q.get('invite')||'').trim().toUpperCase();
  if(code){localStorage.setItem('schoollink_pending_invite',JSON.stringify({code,fullName:''}));history.replaceState({},'',location.pathname+location.hash)}
})();