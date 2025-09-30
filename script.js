const BACKEND_URL = 'https://globalchatpl.onrender.com';

const messagesDiv = document.getElementById('messages');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('message');
const nickInput = document.getElementById('nick');
const colorInput = document.getElementById('color');
const avatarInput = document.getElementById('avatar');
const passwordInput = document.getElementById('password');
const activeCountSpan = document.getElementById('activeCount');

async function fetchActiveUsers() {
  try {
    const res = await fetch(`${BACKEND_URL}/activeUsers`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    activeCountSpan.textContent = data.count;
  } catch (err) {
    console.error('Błąd pobierania aktywnych użytkowników:', err);
  }
}

// Aktualizacja co 10 sekund
fetchActiveUsers();
setInterval(fetchActiveUsers, 10000);

let avatarDataUrl = null;
let currentPassword = ''; // <- globalnie przechowywane hasło

// ================== Motywy ==================
function setTheme(mode) {
  document.body.classList.remove('dark-mode', 'pastel-mode', 'neon-mode', 'cute-mode');
  if (mode === 'dark') document.body.classList.add('dark-mode');
  if (mode === 'pastel') document.body.classList.add('pastel-mode');
  if (mode === 'neon') document.body.classList.add('neon-mode');
  if (mode === 'cute') document.body.classList.add('cute-mode');
  localStorage.setItem('theme', mode);
}

// Systemowa wiadomość (lokalna, bez backendu)
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

// Motyw: wczytanie z pamięci
const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme);

// Obsługa avatara
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

  // Avatar
  const img = document.createElement('img');
  img.src = msg.avatar || `https://i.pravatar.cc/40?u=${encodeURIComponent(msg.nick)}`;
  img.alt = 'Avatar';
  img.className = 'avatar';
  if (isOwner || isGlobal) img.classList.add('owner-avatar');
  div.appendChild(img);

  // Treść wiadomości
  const content = document.createElement('div');
  content.className = 'content';

  // Nick + tag
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

  if (msg.nickColor) {
    nickSpan.style.color = msg.nickColor;
  }

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
  if (!text) return;

  // Komendy motywu
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
  
  // Pobierz hasło tylko raz
  if (!currentPassword && passwordInput) {
    currentPassword = passwordInput.value.trim();
  }

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

// ----------------- WYSYŁANIE PM -----------------
document.getElementById('sendPMBtn').addEventListener('click', () => {
  const toNick = document.getElementById('nickpv').value.trim() || 'Anonim';
  const text = document.getElementById('messagepv').value.trim();
  sendPrivateMessage(toNick, text);
});

async function sendPrivateMessage(toNick, text) {
  const fromNick = nickInput.value.trim() || 'Anonim';
  const password = currentPassword;

  if (!text) return alert('Wiadomość nie może być pusta.');

  try {
    const res = await fetch(`${BACKEND_URL}/sendPM`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromNick, toNick, text, password })
    });
    const data = await res.json();
    if (data.success) {
      alert('Wiadomość prywatna wysłana!');
      fetchPrivateMessages();
    } else {
      alert('Błąd: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Błąd wysyłania PM');
  }
}

// ----------------- POBIERANIE PM -----------------
async function fetchPrivateMessages() {
  const nick = nickInput.value.trim() || 'Anonim';
  try {
    const res = await fetch(`${BACKEND_URL}/getPMs/${encodeURIComponent(nick)}`);
    const data = await res.json();

    const pmList = document.getElementById('pmList');
    pmList.innerHTML = '';
    data.forEach(pm => {
      const li = document.createElement('li');
      li.textContent = `[${pm.time}] ${pm.fromNick} → ${pm.toNick}: ${pm.text}`;
      pmList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ----------------- POKAŻ PROFIL -----------------
document.getElementById('viewProfileBtn').addEventListener('click', () => {
  const nick = document.getElementById('profileNick').value.trim();
  if (!nick) return alert('Podaj nick użytkownika');
  fetchUserProfile(nick);
});

async function fetchUserProfile(nick) {
  try {
    const res = await fetch(`${BACKEND_URL}/profile/${encodeURIComponent(nick)}`);
    const data = await res.json();
    if (data.error) return alert(data.error);

    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
      <p>Nick: ${data.nick}</p>
      <p>Punkty: ${data.punkty}</p>
      <p>Ranga: ${data.ranga}</p>
      <p>Tag: ${data.tag || 'brak'}</p>
      <p>Avatar: <img src="${data.avatar}" alt="avatar" width="50"></p>
      <p style="color:${data.color}">Kolor: ${data.color}</p>
    `;
  } catch (err) {
    console.error(err);
  }
}

// Automatyczne odświeżanie PM co 10 sekund
setInterval(fetchPrivateMessages, 10000);
fetchPrivateMessages();


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
setInterval(fetchMessages, 3000);
