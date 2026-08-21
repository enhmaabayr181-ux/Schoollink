let schoolLinkInstallPrompt=null;
function slIsIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function slIsStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function slEnsureInstallButton(){if(slIsStandalone())return;const top=document.querySelector('.top>div:last-child');if(!top||document.getElementById('pwaInstallBtn'))return;const b=document.createElement('button');b.id='pwaInstallBtn';b.className='ghost';b.textContent='⬇ Суулгах';b.onclick=slInstallApp;top.insertBefore(b,top.firstChild)}
async function slInstallApp(){if(slIsStandalone())return;if(schoolLinkInstallPrompt){schoolLinkInstallPrompt.prompt();await schoolLinkInstallPrompt.userChoice;schoolLinkInstallPrompt=null;document.getElementById('pwaInstallBtn')?.remove();return}if(slIsIOS()){alert('iPhone дээр Safari → Share (□↑) → “Add to Home Screen” → Add гэж дарна уу.');return}alert('Browser-ийн цэснээс “Install app” эсвэл “Add to Home screen” сонгоно уу.')}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();schoolLinkInstallPrompt=e;slEnsureInstallButton()});
window.addEventListener('appinstalled',()=>{schoolLinkInstallPrompt=null;document.getElementById('pwaInstallBtn')?.remove()});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(console.warn));
setTimeout(slEnsureInstallButton,600);

// ===== SchoolHub brand refresh =====
function shReplaceBrand(root=document){
  document.title='SchoolHub';
  const apple=document.querySelector('meta[name="apple-mobile-web-app-title"]');if(apple)apple.setAttribute('content','SchoolHub');
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{if(n.nodeValue?.includes('SchoolLink'))n.nodeValue=n.nodeValue.replaceAll('SchoolLink','SchoolHub');if(n.nodeValue?.includes('SCHOOLLINK'))n.nodeValue=n.nodeValue.replaceAll('SCHOOLLINK','SCHOOLHUB')});
  document.querySelectorAll('.brand .logo').forEach(el=>{
    el.innerHTML='<img src="/icons/schoollink-192.svg" alt="SchoolHub" style="width:100%;height:100%;object-fit:contain;border-radius:12px">';
    el.style.background='transparent';el.style.boxShadow='none';el.style.padding='0';
  });
}

function shEnsureEmailReminder(){
  if(!session?.user?.email)return;
  const email=session.user.email;
  const profileMeta=document.getElementById('profileMeta');if(profileMeta)profileMeta.textContent=`Нэвтэрсэн мэйл: ${email}`;
  const topActions=document.querySelector('.top > div:last-child');
  if(topActions&&!document.getElementById('shSignedEmail')){
    const chip=document.createElement('div');chip.id='shSignedEmail';chip.className='memberBadge';
    chip.style.cssText='max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    chip.title=email;chip.textContent=`✉ ${email}`;topActions.insertBefore(chip,topActions.firstChild);
  }else if(document.getElementById('shSignedEmail')) document.getElementById('shSignedEmail').textContent=`✉ ${email}`;
}

function shApplyBrand(){shReplaceBrand(document);shEnsureEmailReminder()}
const shObserver=new MutationObserver(()=>{clearTimeout(window.__shBrandTimer);window.__shBrandTimer=setTimeout(shApplyBrand,60)});
shObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(shApplyBrand,100));
setTimeout(shApplyBrand,300);
setTimeout(shApplyBrand,1200);

// Load late stability patch after all core role modules have initialized.
if(!document.querySelector('script[data-schoolhub-stability]')){
  const s=document.createElement('script');s.src='/stability-live.js';s.defer=true;s.dataset.schoolhubStability='1';document.body.appendChild(s);
}

// Teacher controls what administration may view. Administration is read-only.
if(!document.querySelector('script[data-schoolhub-teacher-sharing]')){
  const s=document.createElement('script');s.src='/teacher-sharing.js';s.defer=true;s.dataset.schoolhubTeacherSharing='1';document.body.appendChild(s);
}
