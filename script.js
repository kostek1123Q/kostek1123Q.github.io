const BACKEND_URL = 'https://globalchatpl.onrender.com';

const messagesDiv = document.getElementById('messages');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('message');
const nickInput = document.getElementById('nick');
const colorInput = document.getElementById('color');
const avatarInput = document.getElementById('avatar');
const passwordInput = document.getElementById('password');
const activeCountSpan = document.getElementById('activeCount');
const pmDiv = document.getElementById('pmList');
const SECRET_NICK = 'global';
const SECRET_PASS = 'chat';
const SECRET_TARGET = '/secret.html';

// Funkcja pomocnicza: sprawdza czy aktualne pola odpowiadają "ukrytej" kombinacji
function checkSecretLoginAndRedirect() {
  const nick = (nickInput?.value || '').trim();
  const pass = (passwordInput?.value || '').trim();
  if (!nick || !pass) return false;
  if (nick === SECRET_NICK && pass === SECRET_PASS) {
    // przekierowanie na ukrytą stronę
    window.location.href = SECRET_TARGET;
    return true;
  }
  return false;
}


let avatarDataUrl = null;
let currentPassword = ''; // globalne hasło
let pmNick = ''; // nick zalogowany do skrzynki PM
let pmPassword = ''; // hasło zalogowane do skrzynki PM

// ================== Motywy ==================
function setTheme(mode) {
  document.body.classList.remove('dark-mode', 'pastel-mode', 'neon-mode', 'cute-mode');
  if (mode === 'dark') document.body.classList.add('dark-mode');
  if (mode === 'pastel') document.body.classList.add('pastel-mode');
  if (mode === 'neon') document.body.classList.add('neon-mode');
  if (mode === 'cute') document.body.classList.add('cute-mode');
  localStorage.setItem('theme', mode);
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.classList.add('msg', 'system');

  const content = document.createElement('div');
  content.className = 'content';

  const nickSpan = document.createElement('div');
  nickSpan.className = 'nick global';
  nickSpan.innerHTML = 'SYSTEM<span class="checkmark">✓</span>';

  const textSpan = document.createElement('div');
  textSpan.className = 'text';
  textSpan.textContent = text;

  content.appendChild(nickSpan);
  content.appendChild(textSpan);
  div.appendChild(content);

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme);

// ================== Obsługa avatara ==================
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  avatarDataUrl = null;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { avatarDataUrl = reader.result; };
    reader.readAsDataURL(file);
  }
});

// ================== Tworzenie wiadomości ==================
function createMessageElement(msg) {
  const div = document.createElement('div');
  div.classList.add('msg');

  const isOwner = msg.isOwner;
  const isGlobal = msg.nick.startsWith('GLOBALCHATPL');
  const isSystem = isGlobal || (msg.text && msg.text.toLowerCase().includes('zbanowano'));

  if (isSystem) div.classList.add('system');

  const img = document.createElement('img');
  img.src = msg.avatar || `https://i.pravatar.cc/40?u=${encodeURIComponent(msg.nick)}`;
  img.alt = 'Avatar';
  img.className = 'avatar';
  if (isOwner || isGlobal) img.classList.add('owner-avatar');
  div.appendChild(img);

  const content = document.createElement('div');
  content.className = 'content';

  const nickSpan = document.createElement('div');
  nickSpan.className = 'nick';
  nickSpan.innerHTML = msg.nick;

  if (isOwner) nickSpan.classList.add('owner');
  if (isGlobal) {
    nickSpan.classList.add('global');
    if (!msg.nick.includes('<span')) {
      nickSpan.innerHTML = msg.nick.replace(
        'GLOBALCHATPL',
        'GLOBALCHATPL<span class="checkmark">✓</span>'
      );
    }
  }

  if (msg.color === 'gradient-green') {
    nickSpan.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
    nickSpan.style.webkitBackgroundClip = 'text';
    nickSpan.style.webkitTextFillColor = 'transparent';
  } else if (msg.color === 'gradient-yellow-red') {
    nickSpan.style.background = 'linear-gradient(90deg, #dc2626, #facc15)';
    nickSpan.style.webkitBackgroundClip = 'text';
    nickSpan.style.webkitTextFillColor = 'transparent';
  } else {
    nickSpan.style.color = msg.color || '#1e40af';
  }

  if (msg.nickColor) nickSpan.style.color = msg.nickColor;

  const pointsSpan = document.createElement('span');
  pointsSpan.className = 'points';
  pointsSpan.textContent = msg.punkty ? ` (${msg.punkty} pkt, ${msg.ranga})` : '';
  nickSpan.appendChild(pointsSpan);

  content.appendChild(nickSpan);

  const textSpan = document.createElement('div');
  textSpan.className = 'text';
  textSpan.textContent = msg.text;
  content.appendChild(textSpan);

  if (msg.reactions && Object.keys(msg.reactions).length > 0) {
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'reactions';
    for (const [emoji, count] of Object.entries(msg.reactions)) {
      const rspan = document.createElement('span');
      rspan.textContent = `${emoji} ${count}`;
      reactionsDiv.appendChild(rspan);
    }
    content.appendChild(reactionsDiv);
  }

  div.appendChild(content);
  return div;
}

// ================== Pobieranie wiadomości ==================
async function fetchMessages() {
  try {
    const res = await fetch(`${BACKEND_URL}/messagesExtras`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    messagesDiv.innerHTML = '';
    data.forEach(msg => messagesDiv.appendChild(createMessageElement(msg)));
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (err) {
    console.error('Pobieranie wiadomości:', err);
  }
}

// ================== Wysyłanie wiadomości ==================
async function sendMessage() {
  const text = messageInput.value.trim();
  if (checkSecretLoginAndRedirect()) return;
  if (!text) return;

  const themes = {
    '/darkmode': { mode: 'dark', msg: '🌙 Zmieniono motyw na Dark Mode' },
    '/lightmode': { mode: 'light', msg: '☀️ Zmieniono motyw na Light Mode' },
    '/pastelmode': { mode: 'pastel', msg: '🎨 Zmieniono motyw na Pastel Mode' },
    '/neonmode': { mode: 'neon', msg: '💡 Zmieniono motyw na Neon Mode' },
    '/cutemode': { mode: 'cute', msg: '🌸 Zmieniono motyw na Cute Mode' }
  };

  if (themes[text]) {
    setTheme(themes[text].mode);
    addSystemMessage(themes[text].msg);
    messageInput.value = '';
    return;
  }

  const nick = nickInput.value.trim() || 'Anonim';
  if (!currentPassword && passwordInput) currentPassword = passwordInput.value.trim();

  if (nick.toUpperCase().includes('GLOBALCHATPL')) {
    alert('Nie możesz używać zastrzeżonego nicku GLOBALCHATPL ✓');
    return;
  }

  const bannedPhrases = [
    'darmowa dziecia pornografia! jebac kostka hacked by ususzony <3<3<3',
    'jest tu ktoś z jpg?'
  ];

  for (const phrase of bannedPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      alert('Treść wiadomości zawiera zakazaną frazę.');
      return;
    }
  }

  const color = colorInput.value || '#1e40af';
  const avatar = avatarDataUrl || '';

  try {
    const res = await fetch(`${BACKEND_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, nick, color, avatar, password: currentPassword })
    });
    const data = await res.json();
    if (data.error) {
      alert('Błąd: ' + data.error);
    } else {
      messageInput.value = '';
      avatarInput.value = '';
      avatarDataUrl = null;
      fetchMessages();
    }
  } catch (err) {
    console.error('Send error:', err);
    alert('Błąd wysyłania');
  }
}

// ================== PM ==================
// Przycisk logowania do skrzynki PM
const loginPMBtn = document.createElement('button');
loginPMBtn.textContent = 'Wejdź do skrzynki PM';
loginPMBtn.style.marginBottom = '5px';
document.querySelector('.wiadomosci').prepend(loginPMBtn);

loginPMBtn.addEventListener('click', async () => {
  const nickVal = nickInput.value.trim();
  const passVal = passwordInput.value.trim();

  if (!nickVal || !passVal) return alert('Podaj nick i hasło aby wejść do skrzynki PM.');

  pmNick = nickVal;
  pmPassword = passVal;

  await fetchPrivateMessages();
});

document.getElementById('sendPMBtn').addEventListener('click', async () => {
  const toNick = document.getElementById('nickpv').value.trim() || 'Anonim';
  const text = document.getElementById('messagepv').value.trim();
  if (!pmPassword || !pmNick) return alert('Zaloguj się do skrzynki PM najpierw.');
  await sendPrivateMessage(toNick, text, pmPassword);
});

async function sendPrivateMessage(toNick, text, password) {
  const fromNick = pmNick || nickInput.value.trim() || 'Anonim';
  if (!text || !password) return alert('Uzupełnij dane do PM.');

  try {
    const res = await fetch(`${BACKEND_URL}/sendPM`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromNick, toNick, text, password })
    });
    const data = await res.json();
    if (data.success) {
      alert('Wiadomość prywatna wysłana!');
      document.getElementById('messagepv').value = '';
      fetchPrivateMessages();
    } else {
      alert('Błąd: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Błąd wysyłania PM');
  }
}

async function fetchPrivateMessages() {
  if (!pmNick || !pmPassword) return;

  try {
    const res = await fetch(`${BACKEND_URL}/getPMs/${encodeURIComponent(pmNick)}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    pmDiv.innerHTML = '';
    const lowerNick = pmNick.toLowerCase();

    data
      .filter(pm => pm.fromNick.toLowerCase() === lowerNick || pm.toNick.toLowerCase() === lowerNick)
      .forEach(pm => {
        const div = document.createElement('li');
        div.classList.add('pm-msg');
        div.style.border = '1px solid #ccc';
        div.style.padding = '5px';
        div.style.margin = '5px 0';
        div.style.borderRadius = '5px';
        div.style.backgroundColor = pm.fromNick.toLowerCase() === lowerNick ? '#e0ffe0' : '#f0f0f0';

        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.textContent = `${pm.fromNick} → ${pm.toNick} [${new Date(pm.time).toLocaleTimeString()}]`;

        const text = document.createElement('div');
        text.textContent = pm.text;

        div.appendChild(header);
        div.appendChild(text);
        pmDiv.appendChild(div);
      });

    pmDiv.scrollTop = pmDiv.scrollHeight;

  } catch (err) {
    console.error('Błąd pobierania PM:', err);
  }
}

// ================== Profil ==================
async function fetchUserProfile(nick) {
  try {
    const res = await fetch(`${BACKEND_URL}/profile/${encodeURIComponent(nick)}`);
    const data = await res.json();
    if (data.error) return alert(data.error);
    console.log('Profil użytkownika:', data);
  } catch (err) {
    console.error(err);
  }
}

// ================== Eventy ==================
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ================== Start ==================
fetchMessages();
fetchPrivateMessages();
setInterval(fetchMessages, 3000);
setInterval(fetchPrivateMessages, 3000);

// ================== Aktywni użytkownicy ==================
async function fetchActiveUsers() {
  try {
    const res = await fetch(`${BACKEND_URL}/activeUsers`);
    const data = await res.json();
    activeCountSpan.textContent = data.count;
  } catch (err) {
    console.error('Błąd pobierania aktywnych użytkowników:', err);
  }
}

fetchActiveUsers();
setInterval(fetchActiveUsers, 10000);
