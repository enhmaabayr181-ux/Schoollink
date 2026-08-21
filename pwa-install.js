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
function shReplaceTextNode(node){
  if(!node?.nodeValue)return;
  if(node.nodeValue.includes('SchoolLink'))node.nodeValue=node.nodeValue.replaceAll('SchoolLink','SchoolHub');
  if(node.nodeValue.includes('SCHOOLLINK'))node.nodeValue=node.nodeValue.replaceAll('SCHOOLLINK','SCHOOLHUB');
}
function shBrandLogo(el){
  if(!el||el.dataset.schoolhubBranded==='1')return;
  el.dataset.schoolhubBranded='1';
  el.innerHTML='<img src="/icons/schoolhub-192.svg" alt="SchoolHub" style="width:100%;height:100%;object-fit:contain;border-radius:12px">';
  el.style.background='transparent';el.style.boxShadow='none';el.style.padding='0';
}
function shReplaceBrand(root=document){
  document.title='SchoolHub';
  const apple=document.querySelector('meta[name="apple-mobile-web-app-title"]');if(apple)apple.setAttribute('content','SchoolHub');
  if(root?.nodeType===Node.TEXT_NODE){shReplaceTextNode(root);return}
  if(!root?.querySelectorAll&&!root?.ownerDocument)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())shReplaceTextNode(walker.currentNode);
  if(root.matches?.('.brand .logo'))shBrandLogo(root);
  root.querySelectorAll?.('.brand .logo').forEach(shBrandLogo);
}

function shEnsureEmailReminder(){
  const currentSession=typeof session!=='undefined'?session:null;
  if(!currentSession?.user?.email)return;
  const email=currentSession.user.email;
  const profileMeta=document.getElementById('profileMeta');if(profileMeta)profileMeta.textContent=`Нэвтэрсэн мэйл: ${email}`;
  const topActions=document.querySelector('.top > div:last-child');
  if(topActions&&!document.getElementById('shSignedEmail')){
    const chip=document.createElement('div');chip.id='shSignedEmail';chip.className='memberBadge';
    chip.style.cssText='max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    chip.title=email;chip.textContent=`✉ ${email}`;topActions.insertBefore(chip,topActions.firstChild);
  }else if(document.getElementById('shSignedEmail'))document.getElementById('shSignedEmail').textContent=`✉ ${email}`;
}

function shApplyBrand(){shReplaceBrand(document);shEnsureEmailReminder()}
const shObserver=new MutationObserver(mutations=>{
  for(const m of mutations)for(const node of m.addedNodes){
    if(node.nodeType===Node.TEXT_NODE)shReplaceTextNode(node);
    else if(node.nodeType===Node.ELEMENT_NODE)shReplaceBrand(node);
  }
  clearTimeout(window.__shEmailTimer);window.__shEmailTimer=setTimeout(shEnsureEmailReminder,80);
});
shObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>setTimeout(shApplyBrand,100));
setTimeout(shApplyBrand,300);
setTimeout(shApplyBrand,1200);

function shLoadLateScript(src,dataKey){
  if(document.querySelector(`script[data-${dataKey}]`))return;
  const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(`data-${dataKey}`,'1');document.body.appendChild(s);
}

// Load late modules after all core role modules have initialized.
shLoadLateScript('/stability-live.js','schoolhub-stability');
shLoadLateScript('/portfolio-live.js','schoolhub-portfolio');
shLoadLateScript('/teacher-sharing.js','schoolhub-teacher-sharing');
shLoadLateScript('/portfolio-sharing-patch.js','schoolhub-portfolio-sharing');
shLoadLateScript('/visual-cards.js','schoolhub-visual-cards');
shLoadLateScript('/launch-polish.js','schoolhub-launch-polish');
shLoadLateScript('/billing-live.js','schoolhub-billing');
