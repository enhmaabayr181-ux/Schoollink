(() => {
  const style = document.createElement('style');
  style.textContent = `
    #shAiButton{position:fixed;right:18px;bottom:18px;z-index:9900;border:0;border-radius:999px;padding:13px 17px;background:#6d5dfc;color:white;font-weight:800;box-shadow:0 10px 30px #3828a955;cursor:pointer}
    #shAiPanel{position:fixed;right:18px;bottom:76px;z-index:9901;width:min(390px,calc(100vw - 28px));height:min(540px,calc(100vh - 110px));background:white;border:1px solid #e8e5ff;border-radius:20px;box-shadow:0 18px 60px #2f236033;display:flex;flex-direction:column;overflow:hidden}
    #shAiPanel.hidden,#shAiButton.hidden{display:none}
    .shAiHead{padding:14px 16px;background:#6d5dfc;color:white;display:flex;align-items:center;justify-content:space-between}.shAiHead b{font-size:16px}.shAiHead button{border:0;background:transparent;color:white;font-size:24px;cursor:pointer}
    #shAiMessages{flex:1;overflow:auto;padding:14px;background:#faf9ff}.shAiMsg{max-width:88%;padding:10px 12px;border-radius:14px;margin:7px 0;white-space:pre-wrap;line-height:1.45}.shAiUser{margin-left:auto;background:#6d5dfc;color:white}.shAiBot{background:white;border:1px solid #e8e5ff;color:#25223a}
    @media(max-width:760px){#shAiButton{right:14px;bottom:92px;padding:11px 14px}#shAiPanel{right:14px;bottom:148px;height:min(520px,calc(100vh - 180px))}}
    .shAiForm{padding:11px;border-top:1px solid #eee;display:flex;gap:8px}.shAiForm textarea{flex:1;min-height:42px;max-height:100px;resize:vertical;border:1px solid #ddd;border-radius:12px;padding:10px;font:inherit}.shAiForm button{border:0;border-radius:12px;background:#6d5dfc;color:white;padding:0 14px;font-weight:700;cursor:pointer}.shAiForm button:disabled{opacity:.55}
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.id = 'shAiButton';
  button.className = 'hidden';
  button.textContent = '✦ AI туслах';

  const panel = document.createElement('div');
  panel.id = 'shAiPanel';
  panel.className = 'hidden';
  panel.innerHTML = '<div class="shAiHead"><b>✦ SchoolHub AI</b><button type="button" aria-label="Хаах">×</button></div><div id="shAiMessages"><div class="shAiMsg shAiBot">Сайн байна уу? Хичээл, даалгавар, тайлан эсвэл сургуулийн ажлын талаар асуугаарай.</div></div><div class="shAiForm"><textarea id="shAiInput" maxlength="4000" placeholder="Асуултаа бичнэ үү…"></textarea><button id="shAiSend" type="button">Илгээх</button></div>';
  document.body.append(button, panel);

  const messages = panel.querySelector('#shAiMessages');
  const input = panel.querySelector('#shAiInput');
  const send = panel.querySelector('#shAiSend');
  const addMessage = (text, mine) => {
    const el = document.createElement('div');
    el.className = 'shAiMsg ' + (mine ? 'shAiUser' : 'shAiBot');
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };

  button.onclick = () => { panel.classList.toggle('hidden'); if (!panel.classList.contains('hidden')) input.focus(); };
  panel.querySelector('.shAiHead button').onclick = () => panel.classList.add('hidden');

  const ask = async () => {
    const prompt = input.value.trim();
    if (!prompt || send.disabled) return;
    addMessage(prompt, true);
    input.value = '';
    send.disabled = true;
    const waiting = addMessage('Хариулж байна…', false);
    try {
      const { data, error } = await sb.functions.invoke('schoolhub-ai', { body: { prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      waiting.textContent = data?.answer || 'Хариу ирсэнгүй.';
    } catch (error) {
      waiting.textContent = 'AI алдаа: ' + (error?.message || 'Дахин оролдоно уу.');
    } finally {
      send.disabled = false;
      messages.scrollTop = messages.scrollHeight;
      input.focus();
    }
  };
  send.onclick = ask;
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } });

  const syncVisibility = () => {
    const loggedIn = !document.getElementById('app')?.classList.contains('hidden');
    button.classList.toggle('hidden', !loggedIn);
    if (!loggedIn) panel.classList.add('hidden');
  };
  new MutationObserver(syncVisibility).observe(document.getElementById('app'), { attributes: true, attributeFilter: ['class'] });
  syncVisibility();
})();