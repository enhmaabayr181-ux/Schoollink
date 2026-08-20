let schoolLinkInstallPrompt=null;
function slIsIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function slIsStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function slEnsureInstallButton(){if(slIsStandalone())return;const top=document.querySelector('.top>div:last-child');if(!top||document.getElementById('pwaInstallBtn'))return;const b=document.createElement('button');b.id='pwaInstallBtn';b.className='ghost';b.textContent='⬇ Суулгах';b.onclick=slInstallApp;top.insertBefore(b,top.firstChild)}
async function slInstallApp(){if(slIsStandalone())return;if(schoolLinkInstallPrompt){schoolLinkInstallPrompt.prompt();await schoolLinkInstallPrompt.userChoice;schoolLinkInstallPrompt=null;document.getElementById('pwaInstallBtn')?.remove();return}if(slIsIOS()){alert('iPhone дээр Safari → Share (□↑) → “Add to Home Screen” → Add гэж дарна уу.');return}alert('Browser-ийн цэснээс “Install app” эсвэл “Add to Home screen” сонгоно уу.')}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();schoolLinkInstallPrompt=e;slEnsureInstallButton()});
window.addEventListener('appinstalled',()=>{schoolLinkInstallPrompt=null;document.getElementById('pwaInstallBtn')?.remove()});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(console.warn));
setTimeout(slEnsureInstallButton,600);
