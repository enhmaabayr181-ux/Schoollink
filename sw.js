const CACHE='schoolhub-shell-v8';
const SHELL=['/','/index.html','/style.css','/app.js','/parent-live.js','/teacher-pro.js','/teacher-fix.js','/parent-attachments.js','/admin-pro.js','/parent-pro.js','/calendar-live.js','/poll-live.js','/notifications-live.js','/pwa-install.js','/push-live.js','/stability-live.js','/teacher-sharing.js','/manifest.webmanifest','/icons/schoollink-192.svg','/icons/schoollink-512.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET')return;
  if(url.hostname.includes('supabase.co')||url.pathname.startsWith('/functions/')||url.pathname.includes('/auth/'))return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',copy)).catch(()=>{});return res;
    }).catch(()=>caches.match('/index.html')));
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});return res;
    })));
  }
});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={title:'SchoolHub',body:event.data?.text()||'Шинэ мэдэгдэл ирлээ.'}}
  const title=data.title||'SchoolHub';
  const options={
    body:data.body||'Шинэ мэдэгдэл ирлээ.',
    icon:'/icons/schoollink-192.svg',
    badge:'/icons/schoollink-192.svg',
    tag:data.notification_id||data.type||'schoolhub',
    renotify:true,
    data:{link:data.link||'',notification_id:data.notification_id||''}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const link=event.notification?.data?.link||'';
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(windows.length){
      const client=windows[0];
      await client.focus();
      client.postMessage({type:'schoollink-push-open',link});
      return;
    }
    const target=link?'/?push='+encodeURIComponent(link):'/';
    await self.clients.openWindow(target);
  })());
});
