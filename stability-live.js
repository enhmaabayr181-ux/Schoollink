let shRealtimeChannel=null;

function shToday(){
  if(typeof shUlaanbaatarDate==='function')return shUlaanbaatarDate();
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ulaanbaatar',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
window.shToday=shToday;

async function shRefreshTeacherToday(){
  if(!session?.user||membership?.role!=='teacher'||!teacherData?.cls)return;
  try{
    const {data,error}=await sb.from('attendance').select('id,student_id,status,note,attendance_date').eq('school_id',membership.school_id).eq('class_id',teacherData.cls.id).eq('attendance_date',shToday());
    if(error)throw error;
    teacherData.attendance=data||[];
    if($('teacherAttendance')){
      const total=teacherData.students?.length||0,present=(data||[]).filter(x=>x.status==='present').length;
      $('teacherAttendance').textContent=total?`${present}/${total}`:'—';
    }
    if($('teacherAttentionCount'))$('teacherAttentionCount').textContent=(data||[]).filter(x=>x.status==='late'||x.status==='absent').length;
  }catch(e){console.warn('Teacher today refresh',e)}
}

const shBaseTeacherLoad=window.loadTeacherDashboard;
window.loadTeacherDashboard=async function(){await shBaseTeacherLoad();await shRefreshTeacherToday()};

const shBaseParentLoad=window.loadParentDashboard;
window.loadParentDashboard=async function(studentId=null){
  await shBaseParentLoad(studentId);
  try{
    if(membership?.role!=='parent'||!parentData?.child)return;
    const {data,error}=await sb.from('attendance').select('status,note,attendance_date,marked_at').eq('student_id',parentData.child.id).eq('attendance_date',shToday()).maybeSingle();
    if(error)throw error;
    parentData.attendance=data||null;
    if($('parentAttendance'))$('parentAttendance').textContent=data?parentStatusLabel(data.status):'Бүртгээгүй';
  }catch(e){console.warn('Parent today refresh',e)}
};

function shStartRealtime(){
  if(!session?.user)return;
  if(shRealtimeChannel){sb.removeChannel(shRealtimeChannel);shRealtimeChannel=null}
  shRealtimeChannel=sb.channel(`schoolhub-live-${session.user.id}`)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async payload=>{
      try{
        const row=payload.new||{};
        if(typeof teacherChatId!=='undefined'&&teacherChatId&&row.conversation_id===teacherChatId&&typeof tpLoadMessages==='function')await tpLoadMessages(teacherChatId);
        if(typeof parentProChatId!=='undefined'&&parentProChatId&&row.conversation_id===parentProChatId&&typeof ppOpenChat==='function')await ppOpenChat(parentProChatId);
      }catch(e){console.warn('Realtime chat refresh',e)}
    })
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${session.user.id}`},async()=>{
      try{if(typeof slLoadNotifications==='function')await slLoadNotifications()}catch(e){console.warn('Realtime notification refresh',e)}
    })
    .subscribe();
}

const shBaseSetRole=setRole;
setRole=function(role){shBaseSetRole(role);setTimeout(()=>{if(session?.user){shStartRealtime();if(membership?.role==='teacher')shRefreshTeacherToday()}},250)};

document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session?.user)shStartRealtime()});
setTimeout(()=>{if(session?.user)shStartRealtime()},900);
