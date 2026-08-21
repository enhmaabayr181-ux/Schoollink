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
  school:'<path d="m3 10 9-6 9 6-9 6Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/><path d="M21 10v6"/>'
};
const SH_VISUAL_MAP=[
  ['мэдээлэл','info'],['даалгавар','assignment'],['ирц','attendance'],['чат','chat'],['мессеж','chat'],['календар','calendar'],['санал асуулга','poll'],['зөвшөөрөл','permission'],['ажиглалт','observation'],['сарын тайлан','report'],['portfolio','portfolio'],['портфолио','portfolio'],['ажлын сан','files'],['харах эрх','eye'],['хуваалцсан','eye'],['анги','school']
];
function shVisualKey(text=''){
  const t=String(text).toLowerCase();
  return SH_VISUAL_MAP.find(([needle])=>t.includes(needle))?.[1]||'school';
}
function shVisualArt(key){
  const icon=SH_VISUAL_ICONS[key]||SH_VISUAL_ICONS.school;
  return `<div class="shHeroArt" aria-hidden="true"><div class="shArtBubble shArtBubbleA">•••</div><div class="shArtPaper"><i></i><i></i><i></i></div><div class="shArtMain"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div></div>`;
}
function shDecorateHero(hero){
  if(!hero||hero.dataset.shVisual==='1')return;
  const title=hero.querySelector('h3')?.textContent||'';
  const key=shVisualKey(title);
  hero.dataset.shVisual='1';hero.dataset.shVisualKey=key;hero.classList.add('shVisualHero');
  hero.insertAdjacentHTML('beforeend',shVisualArt(key));
}
function shDecorateHeroes(root=document){
  if(root.matches?.('.hero'))shDecorateHero(root);
  root.querySelectorAll?.('.hero').forEach(shDecorateHero);
}
function shVisualStyles(){
  if(document.getElementById('shVisualCardStyles'))return;
  const s=document.createElement('style');s.id='shVisualCardStyles';s.textContent=`
  .hero.shVisualHero{padding-right:270px;min-height:226px;background:linear-gradient(135deg,#6548f4 0%,#7c68ff 46%,#a8a4ff 100%);isolation:isolate}
  .hero.shVisualHero:before{width:280px;height:280px;right:-70px;top:-95px;background:rgba(255,255,255,.14);box-shadow:-145px 190px 0 22px rgba(255,255,255,.075)}
  .hero.shVisualHero:after{width:190px;height:190px;right:120px;bottom:-138px;background:rgba(255,255,255,.105)}
  .hero.shVisualHero h3{font-size:clamp(30px,3vw,42px);font-weight:900;letter-spacing:-1.35px;max-width:720px;margin-top:18px}
  .hero.shVisualHero p{font-size:15px;line-height:1.55;max-width:650px;color:rgba(255,255,255,.82)}
  .hero.shVisualHero .pill{padding:8px 12px;border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.15);backdrop-filter:blur(12px);box-shadow:inset 0 1px 0 rgba(255,255,255,.16)}
  .shHeroArt{position:absolute!important;z-index:2!important;right:22px;top:50%;width:220px;height:178px;transform:translateY(-50%);pointer-events:none;filter:drop-shadow(0 18px 20px rgba(49,32,150,.18))}
  .shArtMain{position:absolute;right:26px;bottom:12px;width:128px;height:128px;border-radius:34px;display:grid;place-items:center;color:#6951ee;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(235,231,255,.9));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 1px rgba(255,255,255,.8),0 16px 32px rgba(56,40,164,.17);transform:rotate(7deg)}
  .shArtMain:after{content:"";position:absolute;inset:12px;border-radius:27px;border:1px solid rgba(112,83,245,.08)}
  .shArtMain svg{width:68px;height:68px;filter:drop-shadow(0 5px 10px rgba(98,75,220,.12))}
  .shArtPaper{position:absolute;right:0;bottom:24px;width:86px;height:104px;border-radius:22px;background:linear-gradient(155deg,rgba(255,255,255,.9),rgba(224,219,255,.76));border:1px solid rgba(255,255,255,.68);transform:rotate(9deg);box-shadow:0 10px 24px rgba(49,32,150,.12);padding:30px 15px 0}
  .shArtPaper i{display:block;height:6px;margin:0 0 8px;border-radius:9px;background:rgba(112,83,245,.28)}
  .shArtPaper i:nth-child(2){width:78%}.shArtPaper i:nth-child(3){width:58%}
  .shArtBubble{position:absolute;right:18px;top:2px;min-width:72px;height:54px;border-radius:18px 18px 18px 8px;display:grid;place-items:center;color:rgba(104,80,226,.66);font-size:22px;letter-spacing:3px;background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(228,223,255,.62));border:1px solid rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(49,32,150,.1);transform:rotate(6deg)}
  .shVisualHero[data-sh-visual-key="calendar"] .shArtMain,.shVisualHero[data-sh-visual-key="report"] .shArtMain{transform:rotate(-4deg)}
  .shVisualHero[data-sh-visual-key="portfolio"] .shArtMain,.shVisualHero[data-sh-visual-key="files"] .shArtMain{transform:rotate(4deg) scale(1.03)}
  .shVisualHero[data-sh-visual-key="chat"] .shArtBubble{right:4px;top:12px;transform:rotate(-4deg)}
  @media(max-width:900px){.hero.shVisualHero{padding-right:190px;min-height:216px}.shHeroArt{width:164px;height:150px;right:7px}.shArtMain{width:104px;height:104px;right:22px;border-radius:28px}.shArtMain svg{width:54px;height:54px}.shArtPaper{width:66px;height:84px;border-radius:18px;padding:24px 11px 0}.shArtBubble{min-width:58px;height:43px;font-size:17px;right:11px}.hero.shVisualHero h3{font-size:31px}.hero.shVisualHero p{font-size:14px}}
  @media(max-width:480px){.hero.shVisualHero{padding:18px 132px 18px 18px;min-height:205px}.shHeroArt{width:126px;height:126px;right:2px}.shArtMain{width:86px;height:86px;right:17px;bottom:11px;border-radius:24px}.shArtMain svg{width:45px;height:45px}.shArtPaper{width:52px;height:69px;border-radius:15px;padding:20px 9px 0}.shArtPaper i{height:4px;margin-bottom:6px}.shArtBubble{min-width:48px;height:36px;font-size:14px;letter-spacing:2px}.hero.shVisualHero h3{font-size:27px;max-width:100%;margin-top:14px}.hero.shVisualHero p{font-size:13px;line-height:1.45}.hero.shVisualHero .pill{padding:7px 10px}}
  `;document.head.appendChild(s);
}
function shVisualInit(){shVisualStyles();shDecorateHeroes(document);const obs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)shDecorateHeroes(n)});obs.observe(document.body,{childList:true,subtree:true});}
setTimeout(shVisualInit,0);
