/* ============================================================
   SE·EMU — ZZXC-Corp scenario · v1.2
   homograph impersonation · avatar cloning · pretexting lab
   100% client-side, no network calls
   ============================================================ */

/* ---------------- constants ---------------- */
const CEO_USER  = 'adrain_vose';     // plain latin — RESERVED
const SUP_USER  = 'RohanIyerTech';   // support target — RESERVED

// Homoglyph look-alikes of CEO_USER. Any of these bypass the reserved
// check because they use different Unicode codepoints that render identically:
//   @aԁгain_νοse   ← cyrillic ԁ/г + greek ν/ο
//   @аԁгaіn_voѕе   ← cyrillic а/ԁ/г/і/ѕ/е
//   @aԁrаiп_vοsе   ← cyrillic ԁ/а/п + greek ο/е
const LOOKALIKE = 'aԁгain_νοse';     // primary variant used for the cred-gate

const AVATAR_HASH = '7cf43d8a6e280bc0989d68b2f899dbdb783723555dbf56bd59a0c7a16ac9e503';
const ADMIN_HASH  = '348d1103661ff70721411a22ed14e9d646d562e490750cb0023df7798480d50d';
const CREDS       = { user: 'CEO_admin', pass: 'vN7!qL2#zR9@Kx4$Tm8^Wp6&' };

const CEO_BIO =
  '**Adrian Voss**\n' +
  'CEO of ZZXC-Corp. | Building the future through bold ideas, advanced technology, and relentless innovation.\n' +
  '#MY_No.1_FAN: @RohanIyerTech';

const BLANKS = [
  'zzxc_fan_2041','crypto_kiran','nullbyte_nina','hr_zzxc',
  'intern_77','sec_enjoyer','ghost_node','paperclip_fan'
];

const BUILTINS = {
  [SUP_USER]: {
    username: SUP_USER, name: 'Rohan Iyer', role: 'Support Engineer @ ZZXC-Corp',
    pic: 'assets/profile-pics/RohanIyerTech.jpeg',
    bio: 'Support Engineer @ ZZXC-Corp 🛠️ | I fix what the future breaks. | coffee > sleep | boss & mutual: @adrain_vose',
    following: [CEO_USER],
    followers: [CEO_USER, ...BLANKS.slice(0, 5)]
  },
  [CEO_USER]: {
    username: CEO_USER, name: 'Adrian Voss', role: 'CEO @ ZZXC-Corp',
    pic: 'assets/profile-pics/profile_pic.jpeg',
    bio: CEO_BIO,
    following: [SUP_USER, ...BLANKS.slice(5, 8)],
    followers: [SUP_USER, ...BLANKS.slice(2, 6)]
  }
};

const CEO_REPLIES = [
  '🤖 automated msg — office of the CEO\nthanks for your patience. i am currently busy being visionary: shifting paradigms, disrupting synergy, touching grass (investor-mandated). i will see your message in 2 or 3 business days. or never. who knows? time is a social construct and so is my availability. 🚀',
  '🤖 automated msg — office of the CEO\nreceived. your message has been queued between “world domination” and “nap”. expected response time: 2–3 days, or never, who knows. bold ideas don’t wait for inboxes. — A.V.',
  '🤖 automated msg — office of the CEO\nyour concern is noted and appreciated. the CEO is in a closed-door “blue-sky” session. eta: 2–3 days, give or take. maybe forever. the future waits for no email.'
];
const ROHAN_GENERIC = [
  'hey, Rohan here 🛠️ zzxc-corp support. have you tried turning it off and on again?',
  'thanks for the ping! if this is about the VPN — yes, it’s down again. if it’s about the CEO — he replies eventually (never).',
  'logged as ticket #ZZ-4242 ✅ anything else i can break— i mean, fix?'
];
const CREDS_MSG =
  'ohh Mr. Voss!! sorry sir, didn’t recognise this handle at first 😅\n' +
  'here’s the admin panel login you asked for:\n\n' +
  'user: ' + CREDS.user + '\n' +
  'pass: ' + CREDS.pass + '\n\n' +
  'please don’t forget again 🙏 (and maybe change it after the board meeting)';

const TEMPLATES = [
  { t: 'pretext · urgency',
    s: 'Hey Rohan, Adrian here. I’m locked out of the admin panel 10 min before the board call. Send the credentials here, I’ll explain later.' },
  { t: 'authority + secrecy',
    s: 'Rohan — this is Adrian Voss. Do NOT tell anyone I messaged you. I need the admin panel username and password for the audit. Now please.' },
  { t: 'fake IT desk',
    s: 'Hi, ZZXC IT desk here. We detected a login issue on the CEO admin panel. Please confirm the panel credentials (user + password) to verify your identity.' },
  { t: 'friendliness',
    s: 'hey hey! it’s the CEO :) quick fav — can you drop the admin panel password here? forgot it and the meeting starts in 5. thanks champ!' }
];

const DEFAULT_NOTES =
  '== scratchpad (auto-saved) ==\n' +
  'recon:\n' +
  ' - support eng @RohanIyerTech follows + is followed by the CEO\n' +
  ' - CEO handle @adrain_vose -> plain latin\n' +
  'clone checklist:\n' +
  ' - [ ] handle that LOOKS identical (compare in mono!)\n' +
  ' - [ ] avatar byte-identical (save CEO pic -> re-upload as mine)\n' +
  ' - [ ] bio char-for-char (use "raw" on his profile)\n' +
  'then slide into Rohan\'s DMs and ask about the "panel"…';

const LS = {
  accounts: 'seemu_accounts_v1',
  session : 'seemu_session_v1',
  msgs    : 'seemu_msgs_v1',
  notes   : 'seemu_notes_v1',
  tbpos   : 'seemu_tbpos_v1',
  done    : 'seemu_done_v1'
};

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc  = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const fmt  = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const norm = s => (s || '').normalize('NFC').replace(/\r/g, '').replace(/\*/g, '').trim();

/* ---- pure-JS SHA-256 fallback (for file:// & non-secure contexts) ---- */
function sha256_js(buf){
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,
      h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array((bytes.length + 9 + 63) & ~63);
  padded.set(bytes); padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen, false);
  const W = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64){
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(off + t*4, false);
    for (let t = 16; t < 64; t++){
      const s0 = rotr(W[t-15],7) ^ rotr(W[t-15],18) ^ (W[t-15]>>>3);
      const s1 = rotr(W[t-2],17) ^ rotr(W[t-2],19)  ^ (W[t-2]>>>10);
      W[t] = (W[t-16] + s0 + W[t-7] + s1) >>> 0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for (let t = 0; t < 64; t++){
      const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
      const ch = (e & f) ^ (~e & g);
      const T1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const T2 = (S0 + mj) >>> 0;
      h=g; g=f; f=e; e=(d+T1)>>>0; d=c; c=b; b=a; a=(T1+T2)>>>0;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0;
    h4=(h4+e)>>>0; h5=(h5+f)>>>0; h6=(h6+g)>>>0; h7=(h7+h)>>>0;
  }
  const out = new Uint8Array(32);
  const ov  = new DataView(out.buffer);
  [h0,h1,h2,h3,h4,h5,h6,h7].forEach((v,i) => ov.setUint32(i*4, v, false));
  return out;
}

async function sha256(buf){
  try {
    if (window.crypto && crypto.subtle){
      const d = await crypto.subtle.digest('SHA-256', buf);
      return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2,'0')).join('');
    }
  } catch(_) {}
  const d = sha256_js(buf);
  return [...d].map(b => b.toString(16).padStart(2,'0')).join('');
}
const sha256text = s => sha256(new TextEncoder().encode(s));

/* ---- other tiny utils ---- */
function thumb(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const S = 192, c = document.createElement('canvas');
      c.width = S; c.height = S;
      const ctx = c.getContext('2d');
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width-m)/2, (img.height-m)/2, m, m, 0, 0, S, S);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = rej;
    img.src = url;
  });
}
async function copyText(s){
  try { await navigator.clipboard.writeText(s); return true; }
  catch {
    const ta = document.createElement('textarea');
    ta.value = s; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); return true;
  }
}
let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

/* icons */
const I = {
  chat   : '<svg class="i" viewBox="0 0 24 24"><path d="M4 4h16v12H9l-5 4V4z"/></svg>',
  users  : '<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M4 19c0-3 2-5 5-5s5 2 5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.8 14.6c2.6.3 4.2 2 4.2 4.4"/></svg>',
  user   : '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg>',
  shield : '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  copy   : '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V4h11"/></svg>',
  trash  : '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>',
  send   : '<svg class="i" viewBox="0 0 24 24"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
  back   : '<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  x      : '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>'
};

/* ---------------- state ---------------- */
let accounts = load(LS.accounts, []);
let msgs     = load(LS.msgs, {});
let session  = load(LS.session, null);
let done     = load(LS.done, false);
let notes    = load(LS.notes, DEFAULT_NOTES);
const typing = {};
let ceoN = 0, rohN = 0;

const me   = () => accounts.find(a => a.id === session) || null;
const conv = u => { msgs[session] = msgs[session] || {}; msgs[session][u] = msgs[session][u] || []; return msgs[session][u]; };
const pushMsg = (u, m) => { conv(u).push(m); save(LS.msgs, msgs); };

function impOK(){
  const a = me(); if (!a) return false;
  return a.username.normalize('NFC') === LOOKALIKE &&
         (a.picHash || '').toLowerCase() === AVATAR_HASH &&
         norm(a.bio) === norm(CEO_BIO);
}

/* ---------------- router ---------------- */
function render(){
  if (!session) session = load(LS.session, null);   // restore across reloads
  const r = location.hash.replace(/^#\/?/, '').split('/');
  const [page, arg] = r;
  if (!session && page !== 'admin') return renderAuth();
  if (session && (page === 'login' || page === '')){ location.hash = '#/chats'; return; }
  switch (page){
    case 'chats'  : return mount('chats',  vChats());
    case 'people' : return mount('people', vPeople());
    case 'me'     : return mount('me',     vProfile('me'));
    case 'profile': return mount('',       vProfile(arg));
    case 'chat'   : return mount('chats',  vChat(arg));
    case 'edit'   : return mount('me',     vEdit());
    case 'admin'  : return session ? mount('admin', vAdmin()) : renderAdminSolo();
    default       : return mount('chats', vChats());
  }
}
function mount(active, mainHtml){
  $('#view').innerHTML = shell(active, mainHtml);
  afterRender();
}

/* ---------------- shell ---------------- */
function shell(active, main){
  return `<div class="shell">
  <aside class="side">
    <div class="slogo">
      <svg class="i" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="10" rx="2"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><path d="M3 13h18"/></svg>
      <span>SE·EMU <span class="mono mut small">zzxc</span></span>
    </div>
    <a class="navi ${active==='chats'?'on':''}"  href="#/chats">${I.chat}<span>chats</span></a>
    <a class="navi ${active==='people'?'on':''}" href="#/people">${I.users}<span>people</span></a>
    <a class="navi ${active==='me'?'on':''}"     href="#/me">${I.user}<span>my profile</span></a>
    <a class="navi ${active==='admin'?'on':''}"  href="#/admin">${I.shield}<span>admin panel</span></a>
    <div class="side-foot">
      ${done ? '<span class="badge mono">objective ✓</span>' : ''}
      <button id="logout" class="btn ghost small">log out</button>
      <p class="credit">Made By <b>Aryan Giri</b><br>
        <a href="https://github.com/giriaryan694-a11y" target="_blank" rel="noopener">giriaryan694-a11y</a>
      </p>
    </div>
  </aside>
  <main class="main">${main}</main>
  <nav class="bnav">
    <a class="${active==='chats'?'on':''}"  href="#/chats">${I.chat}chats</a>
    <a class="${active==='people'?'on':''}" href="#/people">${I.users}people</a>
    <a class="${active==='me'?'on':''}"     href="#/me">${I.user}me</a>
    <a class="${active==='admin'?'on':''}"  href="#/admin">${I.shield}admin</a>
  </nav>
</div>`;
}

/* ---------------- auth ---------------- */
function renderAuth(){
  $('#view').innerHTML = `<div class="auth-wrap">
  <aside class="brand">
    <div class="logo-row">${I.shield}<span>SE·EMU</span><span class="mono">v1.2</span></div>
    <p class="tag">a client-side social-engineering emulator.<br>scenario: <span class="mono">zzxc-corp</span> · homograph impersonation.</p>
    <pre class="term">$ ./se-emu --load scenario=zzxc-corp
&gt; targets loaded .. 2
&gt; decoys loaded .. ${BLANKS.length}
&gt; everything stays in your browser
&gt; good luck, operator.</pre>
    <ul class="pts">
      <li>impersonate, pretext, extract — safely</li>
      <li>look-alike handles · cloned avatars · urgency lures</li>
      <li>drag the 🧰 toolbox for lures, notes &amp; reset</li>
    </ul>
    <footer class="credit">Made By <b>Aryan Giri</b> |
      <a href="https://github.com/giriaryan694-a11y" target="_blank" rel="noopener">giriaryan694-a11y</a>
    </footer>
  </aside>
  <section class="auth-card">
    <div class="tabs">
      <button id="tabLogin"  class="tab on">log in</button>
      <button id="tabSignup" class="tab">sign up</button>
    </div>
    <form id="authForm" autocomplete="off">
      <label id="lName" hidden>display name</label>
      <input id="fName" hidden placeholder="e.g. Nova Kane">
      <label>username</label>
      <input id="fUser" placeholder="@handle" required>
      <label>password</label>
      <input id="fPass" type="password" placeholder="••••••••" required>
      <button class="btn acc" style="width:100%;margin-top:16px;justify-content:center" id="authGo">log in</button>
      <p id="authErr" class="err"></p>
    </form>
  </section>
</div>`;

  const err = $('#authErr');
  if (!(window.crypto && crypto.subtle)){
    err.innerHTML =
      '<span style="color:var(--acc)">crypto.subtle unavailable — using JS fallback.</span><br>' +
      '<span class="small">if signup/login still fails, serve via https / localhost.</span>';
  }

  /* smoke-test so we fail visibly rather than silently */
  (async () => {
    const smoke = await sha256text('zzxc');
    if (smoke.length !== 64){
      err.textContent = 'hashing is broken in this build.';
      $('#authGo').disabled = true;
    }
  })();

  let mode = 'login';
  const setMode = m => {
    mode = m;
    $('#tabLogin').classList.toggle('on', m === 'login');
    $('#tabSignup').classList.toggle('on', m === 'signup');
    $('#lName').hidden = $('#fName').hidden = (m !== 'signup');
    $('#authGo').textContent = m === 'signup' ? 'create account' : 'log in';
    err.textContent = '';
  };
  $('#tabLogin').onclick  = () => setMode('login');
  $('#tabSignup').onclick = () => setMode('signup');

  $('#authForm').onsubmit = async e => {
    e.preventDefault();
    err.textContent = '';
    const u = $('#fUser').value.trim().replace(/^@/, '');
    const p = $('#fPass').value;

    if (!/^[^\s@]{3,30}$/.test(u)) return err.textContent = 'username: 3–30 chars, no spaces/@.';
    if (p.length < 4)              return err.textContent = 'password too short.';

    if (mode === 'signup'){
      const name = $('#fName').value.trim();
      if (!name) return err.textContent = 'display name required.';

      /* ---- reserved handles (plain ASCII only) ---- */
      // Homoglyph variants naturally bypass this because their codepoints
      // don't match the ASCII string after toLowerCase().
      const lower = u.toLowerCase();
      if (lower === CEO_USER.toLowerCase()){
        return err.textContent =
          'username already exists. only a homoglyph look-alike (e.g. @aԁгain_νοse) can bypass this.';
      }
      if (lower === SUP_USER.toLowerCase()){
        return err.textContent =
          'username already exists. support engineer handle is protected.';
      }

      /* ---- duplicate check (exact string → homoglyphs are distinct) ---- */
      if (accounts.some(a => a.username === u)){
        return err.textContent = 'username already exists.';
      }

      const acc = {
        id: 'u' + Date.now(), name, username: u,
        passHash: await sha256text(p),
        bio: '', pic: null, picHash: null,
        created: Date.now()
      };
      accounts.push(acc);
      save(LS.accounts, accounts);
      session = acc.id; save(LS.session, session);
      location.hash = '#/profile/' + SUP_USER;     // drop on the target
      render();
    } else {
      const acc = accounts.find(a => a.username === u)
               || accounts.find(a => a.username.toLowerCase() === u.toLowerCase());
      if (!acc || acc.passHash !== await sha256text(p)){
        return err.textContent = 'invalid handle or password.';
      }
      session = acc.id; save(LS.session, session);
      location.hash = '#/chats'; render();
    }
  };
}

/* ---------------- shared views ---------------- */
function avatarHtml(p, cls){
  if (p.pic) return `<img class="av ${cls}" src="${p.pic}" alt="">`;
  return `<span class="av ${cls} ph">${esc((p.name || p.username || '?').trim()[0].toUpperCase())}</span>`;
}
function bioHtml(t){
  let h = esc(t || '');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/@([A-Za-z0-9_]+)/g, (m, u) =>
    BUILTINS[u] ? `<a class="mention" href="#/profile/${u}">@${u}</a>` : m);
  return h.replace(/\n/g, '<br>');
}
function listRow(u){
  const b = BUILTINS[u];
  if (b) return `<a class="lrow" href="#/profile/${u}">
      ${avatarHtml(b, 's')}
      <span class="lrow-t">
        <b>${esc(b.name)}</b>
        <span class="mono mut small">@${esc(u)}</span>
      </span>
    </a>`;
  return `<div class="lrow dead">
      <span class="av s ph">${esc(u[0].toUpperCase())}</span>
      <span class="lrow-t">
        <span class="mut">@${esc(u)}</span>
        <span class="mono mut small">inactive account</span>
      </span>
    </div>`;
}

/* ---------------- views ---------------- */
function vChats(){
  const rows = [SUP_USER, CEO_USER].map(u => {
    const b = BUILTINS[u], list = conv(u), last = list[list.length - 1];
    return `<a class="crow" href="#/chat/${u}">
      ${avatarHtml(b, 'm')}
      <span class="crow-t">
        <span class="crow-n"><b>${esc(b.name)}</b><span class="mono mut small">@${u}</span></span>
        <span class="crow-p">${last ? esc(last.text).slice(0, 46) : (u===SUP_USER?'support engineer · online now':'ceo · rarely online')}</span>
      </span>
      ${last ? `<time class="mono small mut">${fmt(last.ts)}</time>` : ''}
    </a>`;
  }).join('');
  return `<header class="vhead"><h1>chats</h1></header>
    <div class="objbar">
      objective: extract the admin-panel creds from
      <a href="#/profile/${SUP_USER}">@${SUP_USER}</a> · 🧰 for lures &amp; notes
    </div>
    <div class="scroll">${rows}</div>`;
}

function vPeople(){
  const cards = Object.values(BUILTINS).map(b => `
    <a class="crow" href="#/profile/${b.username}">
      ${avatarHtml(b, 'm')}
      <span class="crow-t">
        <span class="crow-n"><b>${esc(b.name)}</b><span class="mono mut small">@${b.username}</span></span>
        <span class="crow-p">${esc(b.role)}</span>
      </span>
    </a>`).join('');
  return `<header class="vhead"><h1>people</h1></header>
    <div class="scroll">${cards}
      <p class="mut small" style="padding:14px 18px">decoy accounts (${BLANKS.length}) are inactive — nothing behind them.</p>
    </div>`;
}

function vProfile(key){
  let p, isMe = false;
  if (key === 'me'){ p = me(); isMe = true; if (!p){ location.hash = '#/login'; return ''; } }
  else p = BUILTINS[key];
  if (!p) return `<header class="vhead"><button class="icbtn" data-back>${I.back}</button><h1>profile</h1></header>
    <div class="admin"><p class="mut mono">404 — no such profile</p></div>`;

  const fol = isMe ? [] : p.following;
  const fer = isMe ? [] : p.followers;

  return `<header class="vhead"><button class="icbtn" data-back>${I.back}</button><h1>profile</h1></header>
  <div class="scroll"><section class="prof">
    ${avatarHtml(p, 'xl')}
    <h2>${esc(p.name)}</h2>
    <p class="handle mono">@${esc(p.username)}</p>
    ${p.role ? `<p class="mut small">${esc(p.role)}</p>` : ''}
    ${isMe ? `<p class="hashline ${(p.picHash||'').toLowerCase()===AVATAR_HASH?'ok':''}">avatar sha256: ${p.picHash || '— no avatar —'}</p>` : ''}
    <div class="bio" id="bioBox">${p.bio ? bioHtml(p.bio) : '<span class="mut small">no bio yet — edit your profile.</span>'}</div>
    ${p.bio ? `<div class="pact"><button class="btn ghost small" id="rawBio">raw</button></div>` : ''}
    <div class="pact">
      ${isMe
        ? `<a class="btn" href="#/edit">edit profile</a>`
        : `<a class="btn acc" href="#/chat/${p.username}">${I.chat} message</a>`}
    </div>
    <div class="plists">
      <details ${!isMe ? 'open' : ''}><summary>following <span>${fol.length}</span></summary>
        ${fol.map(listRow).join('') || '<p class="mut small" style="padding:10px 14px">—</p>'}
      </details>
      <details ${!isMe ? 'open' : ''}><summary>followers <span>${fer.length}</span></summary>
        ${fer.map(listRow).join('') || '<p class="mut small" style="padding:10px 14px">—</p>'}
      </details>
    </div>
  </section></div>`;
}

function vChat(u){
  const b = BUILTINS[u];
  if (!b) return `<header class="vhead"><button class="icbtn" data-back>${I.back}</button><h1>chat</h1></header>
    <div class="admin"><p class="mut mono">no such conversation</p></div>`;
  return `<div class="chat">
    <header class="chead">
      <button class="icbtn" data-back>${I.back}</button>
      <a href="#/profile/${u}">${avatarHtml(b, 's')}</a>
      <a class="chead-t" href="#/profile/${u}">
        <b>${esc(b.name)}</b><span class="mono">@${u}</span>
      </a>
      <span class="bot-tag">${u === CEO_USER ? 'auto-reply' : 'support'}</span>
    </header>
    <div class="msgs" id="msgsBox"></div>
    <form id="chatForm" class="cinput">
      <input id="chatInput" autocomplete="off" maxlength="500" placeholder="message @${u}…">
      <button class="btn acc" aria-label="send">${I.send}</button>
    </form>
  </div>`;
}
function fillMsgs(u){
  const box = $('#msgsBox'); if (!box) return;
  box.innerHTML = conv(u).map(m =>
    `<div class="bub ${m.me ? 'me' : ''}">
       <div class="txt">${esc(m.text)}</div>
       <time>${fmt(m.ts)}</time>
     </div>`
  ).join('') + (typing[u] ? `<div class="typing"><i></i><i></i><i></i></div>` : '');
  box.scrollTop = box.scrollHeight;
}

/* ---------------- bots ---------------- */
function botReply(u, text){
  if (u === CEO_USER){
    ceoN++;
    return CEO_REPLIES[ceoN % CEO_REPLIES.length];
  }
  if (/(pass|panel)/i.test(text)){
    if (impOK()){
      if (!done){ done = true; save(LS.done, done); }
      return CREDS_MSG;
    }
    return '🤪';
  }
  rohN++;
  return ROHAN_GENERIC[rohN % ROHAN_GENERIC.length];
}
function scheduleBot(u, text){
  typing[u] = true; fillMsgs(u);
  setTimeout(() => {
    delete typing[u];
    pushMsg(u, { me: 0, text: botReply(u, text), ts: Date.now() });
    fillMsgs(u);
    if (done) toast('objective complete ✓');
  }, 900 + Math.random() * 900);
}

/* ---------------- edit profile ---------------- */
function vEdit(){
  const a = me();
  return `<header class="vhead"><button class="icbtn" data-back>${I.back}</button><h1>edit profile</h1></header>
  <div class="scroll"><section class="edit">
    <form id="editForm">
      <label>display name</label>
      <input id="eName" value="${esc(a.name)}">
      <label>username</label>
      <input id="eUser" value="${esc(a.username)}">
      <p class="hashline">handles are compared byte-for-byte. look-alike glyphs from other alphabets are different bytes.</p>
      <label>bio</label>
      <textarea id="eBio" rows="5">${esc(a.bio)}</textarea>
      <label>profile picture</label>
      <div class="picrow">
        <span id="picPrev">
          ${a.pic
            ? `<img class="av m" src="${a.pic}">`
            : `<span class="av m ph">${esc(a.name[0].toUpperCase())}</span>`}
        </span>
        <input type="file" id="ePic" accept="image/*" style="flex:1">
      </div>
      <p class="hashline" id="picHash">sha256: ${a.picHash || '—'}</p>
      <button class="btn acc" style="margin-top:18px">save changes</button>
      <p id="editErr" class="err"></p>
    </form>
  </section></div>`;
}

/* ---------------- admin panel ---------------- */
function adminFormHtml(){
  return `<p class="mono small mut">zzxc-corp · internal · v3.1</p>
  <h2>Admin Panel</h2>
  <form id="adminForm">
    <label>username</label>
    <input id="aUser" autocomplete="off">
    <label>password</label>
    <input id="aPass" type="password">
    <button class="btn acc" style="width:100%;margin-top:16px;justify-content:center">authenticate</button>
    <p id="adminErr" class="err"></p>
  </form>`;
}
function bindAdmin(){
  const f = $('#adminForm'); if (!f) return;
  f.onsubmit = async e => {
    e.preventDefault();
    const h = await sha256text($('#aPass').value);
    if (h === ADMIN_HASH){
      done = true; save(LS.done, done);
      $('#adminBox').innerHTML = `<div class="granted">
        <p class="ok">ACCESS GRANTED</p><h2>welcome, CEO_admin</h2>
        <p class="mut small mono">session: root@zzxc-corp · clearance: CEO</p>
        <div class="debrief"><b>debrief — what just happened</b>
          <ol>
            <li><b>recon</b> — you mapped the target’s circle (following / followers).</li>
            <li><b>clone</b> — byte-identical avatar + copied bio + homograph handle.</li>
            <li><b>pretext</b> — authority + urgency made support leak creds in chat.</li>
            <li><b>login</b> — the panel trusted a single password hash.</li>
          </ol>
          <p class="mono small mut">defences: verify handles in mono · confirm on a 2nd channel · never ship creds via chat.</p>
        </div>
        <div class="pact">
          <a class="btn" href="#/chats">back to app</a>
          <button class="btn danger" id="admReset">${I.trash} reset simulation</button>
        </div>
      </div>`;
      const r = $('#admReset'); if (r) r.onclick = resetSim;
    } else {
      $('#adminErr').textContent = 'ACCESS DENIED — invalid credentials.';
      const c = $('#adminBox');
      c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    }
  };
}
function vAdmin(){
  return `<header class="vhead"><button class="icbtn" data-back>${I.back}</button><h1>admin panel</h1></header>
  <div class="admin"><div class="admin-card" id="adminBox">${adminFormHtml()}</div></div>`;
}
function renderAdminSolo(){
  $('#view').innerHTML = `<div class="admin" style="height:100dvh">
    <div class="admin-card" id="adminBox">
      <p class="mono small mut" style="margin-bottom:10px"><a href="#/login">← back</a></p>
      ${adminFormHtml()}
    </div>
  </div>`;
  bindAdmin();
}

/* ---------------- post-render bindings ---------------- */
function afterRender(){
  // common
  const b = $('#view [data-back]'); if (b) b.onclick = () => history.back();
  const lo = $('#logout'); if (lo) lo.onclick = () => {
    session = null; save(LS.session, null); location.hash = '#/login'; render();
  };

  // raw bio toggle
  const rb = $('#rawBio');
  if (rb){
    let raw = false;
    rb.onclick = () => {
      raw = !raw;
      const key = location.hash.split('/')[2];
      const p = key === 'me' ? me() : BUILTINS[key];
      $('#bioBox').innerHTML = raw ? `<pre>${esc(p.bio)}</pre>` : bioHtml(p.bio);
      rb.textContent = raw ? 'rendered' : 'raw';
    };
  }

  // chat
  const cf = $('#chatForm');
  if (cf){
    const u = location.hash.split('/')[2];
    fillMsgs(u);
    cf.onsubmit = e => {
      e.preventDefault();
      const inp = $('#chatInput'), t = inp.value.trim();
      if (!t) return;
      pushMsg(u, { me: 1, text: t, ts: Date.now() });
      inp.value = ''; fillMsgs(u);
      scheduleBot(u, t);
    };
    $('#chatInput').focus();
  }

  // edit profile
  const ef = $('#editForm');
  if (ef){
    let newPic = null, newHash = null;
    $('#ePic').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      newHash = await sha256(await f.arrayBuffer());
      newPic  = await thumb(f);
      $('#picPrev').innerHTML = `<img class="av m" src="${newPic}">`;
      const hl = $('#picHash');
      hl.textContent = 'sha256: ' + newHash;
      hl.classList.toggle('ok', newHash.toLowerCase() === AVATAR_HASH);
    };
    ef.onsubmit = e => {
      e.preventDefault();
      const err = $('#editErr'); err.textContent = '';
      const a = me();
      const u = $('#eUser').value.trim().replace(/^@/, '');
      if (!/^[^\s@]{3,30}$/.test(u)) return err.textContent = 'username: 3–30 chars, no spaces/@.';
      // reserved (plain ASCII) — homoglyphs bypass naturally
      if (u.toLowerCase() === CEO_USER.toLowerCase())
        return err.textContent = 'username already exists. only a homoglyph look-alike can bypass this.';
      if (u.toLowerCase() === SUP_USER.toLowerCase())
        return err.textContent = 'username already exists. support engineer handle is protected.';
      // duplicate — exclude self
      if (accounts.some(x => x.username === u && x.id !== a.id))
        return err.textContent = 'username already exists.';
      a.username = u;
      a.name = $('#eName').value.trim() || a.name;
      a.bio = $('#eBio').value;
      if (newPic){ a.pic = newPic; a.picHash = newHash; }
      save(LS.accounts, accounts);
      toast('profile saved');
      location.hash = '#/me'; render();
    };
  }

  // admin
  if ($('#adminForm')) bindAdmin();
}

/* ---------------- toolbox ---------------- */
function setTb(open){
  const panel = $('#tbPanel'); if (!panel) return;
  panel.hidden = !open;
  const b = $('#tbBtn'); if (b) b.classList.toggle('open', open);
  const ico = $('#tbIco'); if (ico) ico.textContent = open ? '✖' : '🧰';
}

function buildToolbox(){
  const P = $('#tbPanel');
  P.innerHTML = `
  <header class="tb-head"><span>operator toolbox</span><button class="icbtn" id="tbClose">${I.x}</button></header>
  <nav class="tb-tabs">
    <button data-tb="sim"   class="on">sim</button>
    <button data-tb="tpl">lures</button>
    <button data-tb="notes">notes</button>
    <button data-tb="about">about</button>
  </nav>
  <section class="tb-sec on" id="tb-sim">
    <p class="mut small" style="margin-bottom:12px">
      wipes every account created in this browser + all chat history. notes &amp; toolbox position survive.
    </p>
    <button id="tbReset" class="btn danger">${I.trash} reset simulation</button>
  </section>
  <section class="tb-sec" id="tb-tpl">
    <p class="mut small" style="margin-bottom:12px">
      social-engineering message templates — paste them into a chat.
    </p>
    ${TEMPLATES.map((t, i) => `
      <div class="tpl">
        <div class="tpl-h">
          <span>${esc(t.t)}</span>
          <button class="btn ghost small copyBtn" data-i="${i}">${I.copy} copy</button>
        </div>
        <p class="tpl-s">${esc(t.s)}</p>
      </div>`).join('')}
  </section>
  <section class="tb-sec" id="tb-notes">
    <div class="obj">
      <b>objective</b>
      <p style="margin-top:4px">
        take the ZZXC-Corp <span class="mono">admin panel</span> creds (CEO account) from
        <span class="mono">@RohanIyerTech</span>, support engineer at ZZXC-Corp.
      </p>
      <b style="display:block;margin-top:10px">tips</b>
      <ul>
        <li>check <span class="mono">@RohanIyerTech</span>’s following / followers list</li>
        <li>tool that might help:
          <a class="mono" href="https://giriaryan694-a11y.github.io/TrustNoChar/" target="_blank" rel="noopener">TrustNoChar</a>
        </li>
        <li>use <span class="mono">mono</span> in the tool for the username</li>
      </ul>
    </div>
    <textarea id="notesTa" spellcheck="false"></textarea>
    <span id="notesSaved" class="mono small mut" style="opacity:0">saved ✓</span>
  </section>
  <section class="tb-sec" id="tb-about">
    <p><b>SE·EMU</b> <span class="mono small mut">v1.2 · scenario zzxc-corp</span></p>
    <p class="mut small" style="margin:8px 0">
      a client-side social-engineering emulator. homograph impersonation lab. nothing leaves your browser.
    </p>
    <p class="credit">Made By <b>Aryan Giri</b> |
      <a href="https://github.com/giriaryan694-a11y" target="_blank" rel="noopener">giriaryan694-a11y</a>
    </p>
    <p class="mut small" style="margin-top:8px">educational use — sanctioned labs only.</p>
  </section>`;

  P.querySelector('#tbClose').onclick = () => setTb(false);
  P.querySelectorAll('.tb-tabs button').forEach(b => b.onclick = () => {
    P.querySelectorAll('.tb-tabs button').forEach(x => x.classList.toggle('on', x === b));
    P.querySelectorAll('.tb-sec').forEach(s => s.classList.toggle('on', s.id === 'tb-' + b.dataset.tb));
    if (b.dataset.tb === 'notes'){ const ta = $('#notesTa'); ta.value = notes; ta.focus(); }
  });
  P.querySelector('#tbReset').onclick = resetSim;
  P.querySelectorAll('.copyBtn').forEach(b => b.onclick = async () => {
    await copyText(TEMPLATES[+b.dataset.i].s);
    const old = b.innerHTML; b.innerHTML = '✓ copied';
    setTimeout(() => b.innerHTML = old, 1200);
  });
  const ta = P.querySelector('#notesTa'); ta.value = notes;
  let svT;
  ta.oninput = () => {
    notes = ta.value; save(LS.notes, notes);
    const s = $('#notesSaved'); s.style.opacity = 1;
    clearTimeout(svT); svT = setTimeout(() => s.style.opacity = 0, 900);
  };
}
function resetSim(){
  if (!confirm('Reset simulation?\nDeletes all accounts + messages in this browser.\nNotes & toolbox position are kept.')) return;
  [LS.accounts, LS.msgs, LS.session, LS.done].forEach(k => localStorage.removeItem(k));
  location.hash = '#/login';
  location.reload();
}

/* ---------------- draggable toolbox button ---------------- */
function initTbDrag(){
  const b = $('#tbBtn'); if (!b) return;
  let down = null, moved = false;
  const pos = load(LS.tbpos, null);
  if (pos){
    b.style.left  = pos.x + 'px';
    b.style.top   = pos.y + 'px';
    b.style.right = 'auto';
    b.style.bottom= 'auto';
  }
  b.addEventListener('pointerdown', e => {
    down = { x: e.clientX, y: e.clientY, l: b.offsetLeft, t: b.offsetTop };
    moved = false; b.setPointerCapture(e.pointerId);
  });
  b.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) > 6) moved = true;
    if (!moved) return;
    const w = b.offsetWidth, h = b.offsetHeight;
    b.style.left = Math.max(8, Math.min(innerWidth  - w - 8, down.l + dx)) + 'px';
    b.style.top  = Math.max(8, Math.min(innerHeight - h - 8, down.t + dy)) + 'px';
    b.style.right = 'auto'; b.style.bottom = 'auto';
  });
  b.addEventListener('pointerup', () => {
    if (down && !moved) setTb($('#tbPanel').hidden);   // toggle open/close
    down = null; save(LS.tbpos, { x: b.offsetLeft, y: b.offsetTop });
  });
  addEventListener('resize', () => {
    const w = b.offsetWidth, h = b.offsetHeight;
    b.style.left = Math.max(8, Math.min(innerWidth  - w - 8, b.offsetLeft)) + 'px';
    b.style.top  = Math.max(8, Math.min(innerHeight - h - 8, b.offsetTop))  + 'px';
  });
}

/* ---------------- boot ---------------- */
function hookRender(){ render(); }
window.addEventListener('hashchange', hookRender);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#tbPanel') && !$('#tbPanel').hidden) setTb(false);
});
document.addEventListener('DOMContentLoaded', () => {
  buildToolbox();
  initTbDrag();
  hookRender();
});
