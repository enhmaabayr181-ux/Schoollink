(() => {
  const style = document.createElement('style');
  style.textContent = '.shReportActions{display:flex;gap:9px;flex-wrap:wrap}.shReportOutput{min-height:180px;white-space:pre-wrap;line-height:1.65;background:#fbfaff;border:1px solid #e4defe;border-radius:20px;padding:18px;margin-top:14px}.shReportOutput.loading{color:var(--muted)}.shReportMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.shReportMeta div{padding:13px;border-radius:16px;background:#f5f2ff}.shReportMeta b,.shReportMeta span{display:block}.shReportMeta span{font-size:12px;color:var(--muted);margin-bottom:5px}.shReportFilters{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}@media(max-width:700px){.shReportMeta,.shReportFilters{grid-template-columns:1fr}.shReportActions .btn{width:100%}}';
  document.head.appendChild(style);
  let reportText = '';
  let reportContext = null;

  function role() {
    return document.querySelector('.page.active')?.id || 'teacher';
  }

  function dateRange(period) {
    const end = new Date();
    const start = new Date(end);
    if (period === 'month') start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString(), startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
  }

  async function loadTeacherContext(period) {
    if (!teacherData?.cls && typeof tpContext === 'function') await tpContext();
    const cls = teacherData?.cls;
    if (!cls) throw new Error('Танд анги холбогдоогүй байна.');
    const range = dateRange(period);
    const [attendanceResult, assignmentsResult, announcementsResult] = await Promise.all([
      sb.from('attendance').select('status,attendance_date').eq('school_id', membership.school_id).eq('class_id', cls.id).gte('attendance_date', range.startDate).lte('attendance_date', range.endDate),
      sb.from('assignments').select('id,subject,title,created_at,due_at').eq('school_id', membership.school_id).eq('class_id', cls.id).eq('teacher_id', session.user.id).gte('created_at', range.start).lte('created_at', range.end),
      sb.from('announcements').select('id,kind,created_at').eq('school_id', membership.school_id).eq('class_id', cls.id).gte('created_at', range.start).lte('created_at', range.end)
    ]);
    const error = attendanceResult.error || assignmentsResult.error || announcementsResult.error;
    if (error) throw error;
    const attendance = attendanceResult.data || [];
    const counts = { present: 0, late: 0, absent: 0, excused: 0 };
    attendance.forEach(row => { if (counts[row.status] !== undefined) counts[row.status] += 1; });
    const marked = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const rate = marked ? Math.round((counts.present / marked) * 100) : 0;
    return {
      label: 'Багш',
      period,
      periodLabel: period === 'month' ? 'Энэ сарын' : 'Өнөөдрийн',
      scope: cls.name + ' анги',
      students: teacherData?.students?.length || 0,
      attendance: counts,
      attendanceMarked: marked,
      attendanceRate: rate,
      assignments: assignmentsResult.data || [],
      announcements: announcementsResult.data || []
    };
  }

  async function loadContext(period) {
    if (role() === 'teacher') return loadTeacherContext(period);
    const label = role() === 'admin' ? 'Сургуулийн удирдлага' : 'SchoolHub Owner';
    return { label, period, periodLabel: period === 'month' ? 'Энэ сарын' : 'Өнөөдрийн', scope: 'Нэгдсэн мэдээлэл', students: 0, attendance: { present: 0, late: 0, absent: 0, excused: 0 }, attendanceMarked: 0, attendanceRate: 0, assignments: [], announcements: [] };
  }

  function updateMeta(c) {
    const scope = document.getElementById('shReportScopeValue');
    const attendance = document.getElementById('shReportAttendanceValue');
    const period = document.getElementById('shReportPeriodValue');
    if (scope) scope.textContent = c.scope + ' · ' + c.students + ' сурагч';
    if (attendance) attendance.textContent = c.attendanceMarked ? c.attendanceRate + '% · ' + c.attendanceMarked + ' бүртгэл' : 'Ирц бүртгээгүй';
    if (period) period.textContent = c.periodLabel;
  }

  async function refreshMeta() {
    const status = document.getElementById('shReportStatus');
    try {
      const period = document.getElementById('shReportPeriod')?.value || 'today';
      if (status) showStatus(status, 'Бодит мэдээлэл ачаалж байна…');
      reportContext = await loadContext(period);
      updateMeta(reportContext);
      if (status) { status.textContent = ''; status.className = 'status'; }
    } catch (error) {
      if (status) showStatus(status, error.message || 'Мэдээлэл ачаалсангүй.', 'err');
    }
  }

  function render() {
    const r = role();
    const section = document.getElementById(r);
    if (!section) return;
    section.innerHTML = '<div class="grid"><div class="card hero full"><span class="pill">AI ТАЙЛАН</span><h3>✦ Ухаалаг тайлан үүсгэх</h3><p>Ирц, даалгавар, мэдээллийг бодит бүртгэлээс нэгтгэнэ.</p></div><div class="card full"><div class="shReportFilters"><div><label>Хамрах хүрээ</label><select id="shReportScope"><option value="class">Миний анги</option></select></div><div><label>Хугацаа</label><select id="shReportPeriod"><option value="today">Өнөөдөр</option><option value="month">Энэ сар</option></select></div></div><div class="shReportMeta" style="margin-top:14px"><div><span>Хамрах хүрээ</span><b id="shReportScopeValue">Ачаалж байна…</b></div><div><span>Ирц</span><b id="shReportAttendanceValue">Ачаалж байна…</b></div><div><span>Хугацаа</span><b id="shReportPeriodValue">—</b></div></div><div class="shReportActions" style="margin-top:14px"><button class="btn primary" id="shGenerateReport">Тайлан үүсгэх</button><button class="ghost" id="shCopyReport">Тайлан хуулах</button></div><div id="shReportStatus" class="status"></div><div id="shReportOutput" class="shReportOutput">Хугацаагаа сонгоод “Тайлан үүсгэх” дарна уу.</div></div></div>';
    document.getElementById('title').textContent = 'AI тайлан';
    document.getElementById('shReportPeriod').onchange = refreshMeta;
    document.getElementById('shGenerateReport').onclick = generate;
    document.getElementById('shCopyReport').onclick = copy;
    refreshMeta();
  }

  async function generate() {
    const out = document.getElementById('shReportOutput');
    const status = document.getElementById('shReportStatus');
    const button = document.getElementById('shGenerateReport');
    const period = document.getElementById('shReportPeriod')?.value || 'today';
    out.classList.add('loading');
    out.textContent = 'Ирц, даалгаврын бодит мэдээллийг нэгтгэж байна…';
    status.textContent = '';
    button.disabled = true;
    try {
      const c = await loadContext(period);
      reportContext = c;
      updateMeta(c);
      const a = c.attendance;
      const prompt = [
        'SchoolHub-ийн ' + c.label + ' хэрэглэгчид зориулсан ' + c.periodLabel.toLowerCase() + ' тайланг Монгол хэлээр бич.',
        'Хамрах хүрээ: ' + c.scope + ', нийт сурагч: ' + c.students + '.',
        'Ирцийн бүртгэл: нийт ' + c.attendanceMarked + ', ирсэн ' + a.present + ', хоцорсон ' + a.late + ', тасалсан ' + a.absent + ', чөлөөтэй ' + a.excused + ', ирцийн хувь ' + c.attendanceRate + '%.',
        'Даалгавар: ' + c.assignments.length + '. Мэдээлэл/зарлал: ' + c.announcements.length + '.',
        'Зөвхөн өгөгдсөн тоонд тулгуурла. Мэдээлэл байхгүй бол байхгүй гэж тодорхой бич.',
        'Бүтэц: 1. Товч дүгнэлт 2. Ирц 3. Даалгавар ба мэдээлэл 4. Анхаарах зүйл 5. Дараагийн 3 бодит алхам. 350 үгнээс хэтрэхгүй.'
      ].join('\n');
      out.textContent = 'AI тайлан бичиж байна…';
      const { data, error } = await sb.functions.invoke('schoolhub-ai', { body: { prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      reportText = data?.answer || 'Тайлан үүссэнгүй.';
      out.textContent = reportText;
      out.classList.remove('loading');
    } catch (error) {
      out.classList.remove('loading');
      out.textContent = 'AI тайлан үүсгэхэд алдаа гарлаа.';
      showStatus(status, error.message || 'Дахин оролдоно уу.', 'err');
    } finally {
      button.disabled = false;
    }
  }

  async function copy() {
    if (!reportText) return alert('Эхлээд тайлан үүсгэнэ үү.');
    try { await navigator.clipboard.writeText(reportText); alert('Тайлан хууллаа ✅'); }
    catch (_) { prompt('Тайлангаа хуулна уу:', reportText); }
  }

  function bind() {
    const r = role();
    if (!['teacher', 'admin', 'owner'].includes(r)) return;
    const nav = document.getElementById('nav');
    if (!nav) return;
    let button = document.getElementById('shAiReportNav');
    if (!button) {
      button = document.createElement('button');
      button.id = 'shAiReportNav';
      button.dataset.shLabel = 'AI тайлан';
      button.textContent = '✦ AI тайлан';
      nav.appendChild(button);
    }
    button.onclick = () => {
      [...nav.querySelectorAll('button')].forEach(item => item.classList.toggle('active', item === button));
      render();
    };
  }

  document.addEventListener('click', event => { if (event.target.closest('.rolebar button')) setTimeout(bind, 200); });
  setInterval(bind, 1800);
  setTimeout(bind, 700);
})();