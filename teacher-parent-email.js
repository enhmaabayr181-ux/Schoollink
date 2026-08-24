(() => {
  let targetStudent = null;

  function ensureModal() {
    if (document.getElementById('shParentInviteModal')) return;
    const modal = document.createElement('div');
    modal.id = 'shParentInviteModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modalCard" style="max-width:520px">
        <div class="modalTop">
          <div>
            <div class="muted">ЭЦЭГ ЭХ ХОЛБОХ</div>
            <h3 id="shParentInviteTitle">Урилгын код</h3>
          </div>
          <button class="close" id="shParentInviteClose">×</button>
        </div>
        <p class="muted">Нэг удаагийн код үүсгээд эцэг эхэд Messenger, SMS эсвэл өөрийн тохиромжтой аргаар өгнө. И-мэйл шаардлагагүй.</p>
        <button class="btn primary" id="shCreateParentCode" style="width:100%;margin-top:8px">Урилгын код үүсгэх</button>
        <div id="shParentInviteResult" class="hidden" style="margin-top:16px">
          <div class="muted" style="text-align:center">Эцэг эхэд өгөх код</div>
          <div id="shParentInviteCode" class="codeBox" style="margin-top:8px;text-align:center;font-size:28px;letter-spacing:4px"></div>
          <div class="authActions" style="margin-top:12px">
            <button class="btn secondary" id="shCopyParentCode">Код хуулах</button>
            <button class="btn secondary" id="shShareParentCode">Хуваалцах</button>
          </div>
          <p class="muted" style="font-size:12px;margin-top:10px">Код нэг удаа ашиглагдана. Эцэг эх SchoolHub-д өөрийн нэр болон энэ кодыг оруулж холбогдоно.</p>
        </div>
        <div id="shParentInviteStatus" class="status"></div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('shParentInviteClose').onclick = () => modal.classList.add('hidden');
    document.getElementById('shCreateParentCode').onclick = createCode;
    document.getElementById('shCopyParentCode').onclick = copyCode;
    document.getElementById('shShareParentCode').onclick = shareCode;
  }

  window.teacherCreateParentInvite = function (studentId, studentName) {
    ensureModal();
    targetStudent = { id: studentId, name: studentName };
    document.getElementById('shParentInviteTitle').textContent = studentName + ' · Эцэг эх холбох';
    document.getElementById('shParentInviteResult').classList.add('hidden');
    document.getElementById('shParentInviteCode').textContent = '';
    const status = document.getElementById('shParentInviteStatus');
    status.textContent = '';
    status.className = 'status';
    const button = document.getElementById('shCreateParentCode');
    button.disabled = false;
    button.textContent = 'Урилгын код үүсгэх';
    document.getElementById('shParentInviteModal').classList.remove('hidden');
  };

  async function createCode() {
    const status = document.getElementById('shParentInviteStatus');
    const button = document.getElementById('shCreateParentCode');
    try {
      if (!targetStudent) throw new Error('Сурагч сонгоно уу.');
      button.disabled = true;
      showStatus(status, 'Код үүсгэж байна…');
      const data = await schoolWorkflowCall({
        action: 'create_parent_invite',
        student_id: targetStudent.id
      });
      document.getElementById('shParentInviteCode').textContent = data.code;
      document.getElementById('shParentInviteResult').classList.remove('hidden');
      button.textContent = 'Шинэ код үүсгэх';
      showStatus(status, 'Урилгын код бэлэн ✅', 'ok');
    } catch (error) {
      showStatus(status, error.message || 'Код үүсгэхэд алдаа гарлаа.', 'err');
    } finally {
      button.disabled = false;
    }
  }

  function inviteText() {
    const code = document.getElementById('shParentInviteCode').textContent.trim();
    return targetStudent && code
      ? targetStudent.name + '-ийн SchoolHub урилгын код: ' + code + '. SchoolHub-д нэр болон энэ кодоо оруулж холбогдоно уу.'
      : '';
  }

  async function copyCode() {
    const code = document.getElementById('shParentInviteCode').textContent.trim();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      showStatus(document.getElementById('shParentInviteStatus'), 'Код хуулагдлаа ✅', 'ok');
    } catch (_) {
      window.prompt('Кодоо хуулна уу:', code);
    }
  }

  async function shareCode() {
    const text = inviteText();
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'SchoolHub урилга', text }); return; } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(text);
      showStatus(document.getElementById('shParentInviteStatus'), 'Урилгын тайлбар хуулагдлаа ✅', 'ok');
    } catch (_) {
      window.prompt('Энэ мэдээллийг эцэг эхэд илгээнэ үү:', text);
    }
  }

  ensureModal();
})();