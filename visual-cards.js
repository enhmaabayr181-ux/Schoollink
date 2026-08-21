const SH_VISUAL_ICONS={
  info:'<path d="M7 16h3l5 4V4l-5 4H7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3Z"/><path d="M19 9a5 5 0 0 1 0 6M21 6a9 9 0 0 1 0 12"/>',
  assignment:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 8h6M9 12h4M9 16h6"/><path d="M4 7v10"/>',
  attendance:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="m17 11 2 2 4-4"/>',
  chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><circle cx="17" cy="16" r="3"/><path d="M17 14.7V16l1 .7"/>',
  poll:'<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/><path d="M2 20h22"/>',
  permission:'<path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-5"/>',
  observation:'<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5"/><path d="M8 12l2-2 2 2 3-4"/>',
  report:'<path d="M5 20V9M10 20V4M15 20v-7M20 20v-4"/><path d="M3 20h19"/>',
  portfolio:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
  files:'<path d="M3 6h6l2 2h10v11H3Z"/><path d="M7 4h5l2 2"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  school:'<path d="m3 10 9-6 9 6-9 6Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/><path d="M21 10v6"/>',
  family:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M15 14h1a5 5 0 0 1 5 5v1"/><path d="m16.5 4.5 1 1 2-2"/>',
  admin:'<path d="M4 21V8l8-5 8 5v13"/><path d="M8 21v-6h8v6M8 10h2M14 10h2"/><path d="m18 5 2 1.4L22 5v5c0 2.5-1.6 4.3-4 5.4-2.4-1.1-4-2.9-4-5.4V5l2 1.4Z"/>',
  student:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>'
};
const SH_VISUAL_MAP=[
  ['мэдээлэл','info'],['даалгавар','assignment'],['ирц','attendance'],['чат','chat'],['мессеж','chat'],['календар','calendar'],['санал асуулга','poll'],['зөвшөөрөл','permission'],['ажиглалт','observation'],['сарын тайлан','report'],['тайлан','report'],['portfolio','portfolio'],['портфолио','portfolio'],['ажлын сан','files'],['харах эрх','eye'],['хуваалцсан','eye'],['сурагч','student'],['хүүхэд','family'],['анги','school'],['багш','admin'],['сургууль','school']
];
function shVisualKey(text=''){
  const t=String(text).toLowerCase();
  return SH_VISUAL_MAP.find(([needle])=>t.includes(needle))?.[1]||'school';
}
function shHeroKey(hero){
  if(hero.closest('#parent'))return 'family';
  if(hero.closest('#admin'))return 'admin';
  return shVisualKey(hero.querySelector('h3')?.textContent||'');
}
function shVisualArt(key){
  const icon=SH_VISUAL_ICONS[key]||SH_VISUAL_ICONS.school;
  return `<div class="shHeroArt" aria-hidden="true"><div class="shArtBubble shArtBubbleA">•••</div><div class="shArtPaper"><i></i><i></i><i></i></div><div class="shArtMain"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div></div>`;
}
function shDecorateHero(hero){
  if(!hero||hero.dataset.shVisual==='1')return;
  const key=shHeroKey(hero);
  hero.dataset.shVisual='1';hero.dataset.shVisualKey=key;hero.classList.add('shVisualHero');
  hero.insertAdjacentHTML('beforeend',shVisualArt(key));
}
function shDecorateModuleCard(card){
  if(!card||card.classList.contains('hero')||card.dataset.shModuleVisual==='1')return;
  const title=card.querySelector(':scope > .sectionTitle h3, :scope > h3')?.textContent?.trim();
  if(!title)return;
  const key=shVisualKey(title),icon=SH_VISUAL_ICONS[key]||SH_VISUAL_ICONS.school;
  card.dataset.shModuleVisual='1';card.dataset.shModuleKey=key;card.classList.add('shModuleCard');
  const h=card.querySelector(':scope > .sectionTitle h3, :scope > h3');
  if(h&&!h.querySelector('.shModuleIcon'))h.insertAdjacentHTML('afterbegin',`<span class="shModuleIcon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span>`);
}
function shDecorateHeroes(root=document){
  if(root.matches?.('.hero'))shDecorateHero(root);
  root.querySelectorAll?.('.hero').forEach(shDecorateHero);
  if(root.matches?.('.card'))shDecorateModuleCard(root);
  root.querySelectorAll?.('.card').forEach(shDecorateModuleCard);
}
function shVisualStyles(){
  if(document.getElementById('shVisualCardStyles'))return;
  const s=document.createElement('style');s.id='shVisualCardStyles';s.textContent=`
  .hero.shVisualHero{padding-right:270px;min-height:226px;background:linear-gradient(135deg,#6548f4 0%,#7c68ff 46%,#a8a4ff 100%);isolation:isolate}
  #parent .hero.shVisualHero{background:linear-gradient(135deg,#6654ef 0%,#8274ff 46%,#b2aaff 100%)}
  #admin .hero.shVisualHero{background:linear-gradient(135deg,#5847df 0%,#7062f5 46%,#9d94ff 100%)}
  .hero.shVisualHero:before{width:280px;height:280px;right:-70px;top:-95px;background:rgba(255,255,255,.14);box-shadow:-145px 190px 0 22px rgba(255,255,255,.075)}
  .hero.shVisualHero:after{width:190px;height:190px;right:120px;bottom:-138px;background:rgba(255,255,255,.105)}
  .hero.shVisualHero h3{font-size:clamp(30px,3vw,42px);font-weight:900;letter-spacing:-1.35px;max-width:720px;margin-top:18px}
  .hero.shVisualHero p{font-size:15px;line-height:1.55;max-width:650px;color:rgba(255,255,255,.82)}
  .hero.shVisualHero .pill{padding:8px 12px;border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.15);backdrop-filter:blur(12px);box-shadow:inset 0 1px 0 rgba(255,255,255,.16)}
  .shHeroArt{position:absolute!important;z-index:2!important;right:22px;top:50%;width:220px;height:178px;transform:translateY(-50%);pointer-events:none;filter:drop-shadow(0 18px 20px rgba(49,32,150,.18))}
  .shArtMain{position:absolute;right:26px;bottom:12px;width:128px;height:128px;border-radius:34px;display:grid;place-items:center;color:#6951ee;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(235,231,255,.9));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 1px rgba(255,255,255,.8),0 16px 32px rgba(56,40,164,.17);transform:rotate(7deg)}
  #parent .shArtMain{color:#6554df}#admin .shArtMain{color:#5144d3}
  .shArtMain:after{content:"";position:absolute;inset:12px;border-radius:27px;border:1px solid rgba(112,83,245,.08)}
  .shArtMain svg{width:68px;height:68px;filter:drop-shadow(0 5px 10px rgba(98,75,220,.12))}
  .shArtPaper{position:absolute;right:0;bottom:24px;width:86px;height:104px;border-radius:22px;background:linear-gradient(155deg,rgba(255,255,255,.9),rgba(224,219,255,.76));border:1px solid rgba(255,255,255,.68);transform:rotate(9deg);box-shadow:0 10px 24px rgba(49,32,150,.12);padding:30px 15px 0}
  .shArtPaper i{display:block;height:6px;margin:0 0 8px;border-radius:9px;background:rgba(112,83,245,.28)}
  .shArtPaper i:nth-child(2){width:78%}.shArtPaper i:nth-child(3){width:58%}
  .shArtBubble{position:absolute;right:18px;top:2px;min-width:72px;height:54px;border-radius:18px 18px 18px 8px;display:grid;place-items:center;color:rgba(104,80,226,.66);font-size:22px;letter-spacing:3px;background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(228,223,255,.62));border:1px solid rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(49,32,150,.1);transform:rotate(6deg)}
  .shVisualHero[data-sh-visual-key="calendar"] .shArtMain,.shVisualHero[data-sh-visual-key="report"] .shArtMain{transform:rotate(-4deg)}
  .shVisualHero[data-sh-visual-key="portfolio"] .shArtMain,.shVisualHero[data-sh-visual-key="files"] .shArtMain{transform:rotate(4deg) scale(1.03)}
  .shVisualHero[data-sh-visual-key="chat"] .shArtBubble{right:4px;top:12px;transform:rotate(-4deg)}
  .shVisualHero[data-sh-visual-key="family"] .shArtMain{transform:rotate(-3deg);border-radius:38px}
  .shVisualHero[data-sh-visual-key="admin"] .shArtMain{transform:rotate(3deg);border-radius:32px}
  .shModuleCard{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  .shModuleCard:hover{transform:translateY(-2px);border-color:rgba(115,87,255,.13);box-shadow:0 16px 38px rgba(52,43,105,.08)}
  .shModuleCard .sectionTitle h3,.shModuleCard>h3{display:flex;align-items:center;gap:9px}
  .shModuleIcon{width:32px;height:32px;border-radius:11px;display:inline-grid;place-items:center;flex:0 0 auto;background:linear-gradient(145deg,#f3f0ff,#ebe7ff);color:#6b54ed;box-shadow:inset 0 1px 0 rgba(255,255,255,.95);border:1px solid rgba(115,87,255,.08)}
  .shModuleIcon svg{width:17px;height:17px}
  #parent .shModuleIcon{background:linear-gradient(145deg,#f0efff,#e8e5ff);color:#6252dd}
  #admin .shModuleIcon{background:linear-gradient(145deg,#eeedff,#e4e1ff);color:#5547d2}
  .empty{position:relative;overflow:hidden}.empty:before{content:"✦";display:inline-grid;place-items:center;width:30px;height:30px;margin:0 8px 0 0;border-radius:10px;background:linear-gradient(145deg,#f2efff,#ebe7ff);color:#7a64ef;font-size:14px;vertical-align:middle}
  .quickItem{position:relative;overflow:hidden}.quickItem:after{content:"";position:absolute;width:64px;height:64px;border-radius:50%;right:-24px;top:-28px;background:rgba(115,87,255,.055)}
  .metric{position:relative;overflow:hidden}.metric:after{content:"";position:absolute;width:58px;height:58px;border-radius:50%;right:-22px;bottom:-28px;background:rgba(115,87,255,.055)}
  @media(max-width:900px){.hero.shVisualHero{padding-right:190px;min-height:216px}.shHeroArt{width:164px;height:150px;right:7px}.shArtMain{width:104px;height:104px;right:22px;border-radius:28px}.shArtMain svg{width:54px;height:54px}.shArtPaper{width:66px;height:84px;border-radius:18px;padding:24px 11px 0}.shArtBubble{min-width:58px;height:43px;font-size:17px;right:11px}.hero.shVisualHero h3{font-size:31px}.hero.shVisualHero p{font-size:14px}}
  @media(max-width:480px){.hero.shVisualHero{padding:18px 132px 18px 18px;min-height:205px}.shHeroArt{width:126px;height:126px;right:2px}.shArtMain{width:86px;height:86px;right:17px;bottom:11px;border-radius:24px}.shArtMain svg{width:45px;height:45px}.shArtPaper{width:52px;height:69px;border-radius:15px;padding:20px 9px 0}.shArtPaper i{height:4px;margin-bottom:6px}.shArtBubble{min-width:48px;height:36px;font-size:14px;letter-spacing:2px}.hero.shVisualHero h3{font-size:27px;max-width:100%;margin-top:14px}.hero.shVisualHero p{font-size:13px;line-height:1.45}.hero.shVisualHero .pill{padding:7px 10px}.shModuleIcon{width:29px;height:29px;border-radius:10px}.shModuleIcon svg{width:15px;height:15px}}
  `;document.head.appendChild(s);
}
function shVisualInit(){shVisualStyles();shDecorateHeroes(document);const obs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)shDecorateHeroes(n)});obs.observe(document.body,{childList:true,subtree:true});}
setTimeout(shVisualInit,0);
