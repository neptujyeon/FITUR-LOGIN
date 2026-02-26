/* ── Storage helpers ── */
const USERS_KEY = 'nexus_users';
const SESSION_KEY = 'nexus_session';

function getUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }catch{ return {}; }
}
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getSession(){ return localStorage.getItem(SESSION_KEY); }
function setSession(u){ localStorage.setItem(SESSION_KEY, u); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

/* ── Seed default admin ── */
(function seedAdmin(){
  const users = getUsers();
  if(!users['admin']){
    users['admin'] = { password:'admin123', role:'admin' };
    saveUsers(users);
  }
})();

/* ── Role config ── */
const ROLE_CONFIG = {
  admin:{
    label:'Administrator', color:'admin', emoji:'👑',
    accessLevel:99,
    perms:['READ','WRITE','DELETE','MANAGE_USERS','MANAGE_ROLES','VIEW_LOGS','SYSTEM_CONFIG','ALL_ACCESS'],
  },
  moderator:{
    label:'Moderator', color:'moderator', emoji: '',
    accessLevel:50,
    perms:['READ','WRITE','DELETE','MANAGE_CONTENT','VIEW_REPORTS'],
  },
  vip:{
    label:'VIP Member', color:'vip', emoji:  '',
    accessLevel:30,
    perms:['READ','WRITE','PREMIUM_CONTENT','EARLY_ACCESS'],
  },
  user:{
    label:'User', color:'user', emoji: '',
    accessLevel:10,
    perms:['READ','WRITE'],
  },
};

/* ── Init: check session ── */
window.addEventListener('load', ()=>{
  const session = getSession();
  if(session){
    const users = getUsers();
    if(users[session]){ showDashboard(session, users[session]); return; }
    clearSession();
  }
});

/* ── Tabs ── */
function switchTab(tab){
  document.querySelectorAll('.tab').forEach((t,i)=>{
    t.classList.toggle('active', (tab==='login'&&i===0)||(tab==='register'&&i===1));
  });
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+tab).classList.add('active');
}

/* ── Toggle eye ── */
function toggleEye(id,btn){
  const el = document.getElementById(id);
  if(el.type==='password'){el.type='text';btn.textContent='🤔';}
  else{el.type='password';btn.textContent='👁';}
}

/* ── Toast ── */
let toastTimer;
function showToast(msg, type='info'){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show '+type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 3000);
}

/* ── Login ── */
function doLogin(){
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  if(!username||!password){ showToast('Username dan password wajib diisi','error'); return; }

  const users = getUsers();
  if(!users[username]){ showToast('Username tidak ditemukan','error'); return; }
  if(users[username].password !== password){ showToast('Password salah','error'); return; }

  setSession(username);
  showToast('Login berhasil! Selamat datang, '+username,'success');
  setTimeout(()=> showDashboard(username, users[username]), 600);
}

/* ── Register ── */
function doRegister(){
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm  = document.getElementById('regConfirm').value;
  const role     = document.getElementById('regRole').value;

  if(!username||!password||!confirm){ showToast('Semua field wajib diisi','error'); return; }
  if(username.length < 3){ showToast('Username min. 3 karakter','error'); return; }
  if(password.length < 6){ showToast('Password min. 6 karakter','error'); return; }
  if(password !== confirm){ showToast('Password tidak cocok','error'); return; }

  const users = getUsers();
  if(users[username]){ showToast('Username sudah digunakan','error'); return; }

  users[username] = { password, role };
  saveUsers(users);
  setSession(username);
  showToast('Akun berhasil dibuat!','success');
  setTimeout(()=> showDashboard(username, users[username]), 600);
}

/* ── Show Dashboard ── */
function showDashboard(username, userData){
  document.getElementById('authCard').style.display = 'none';
  const dash = document.getElementById('dashboard');
  dash.style.display = 'block';

  const cfg = ROLE_CONFIG[userData.role] || ROLE_CONFIG.user;

  document.getElementById('dashAvatar').textContent = cfg.emoji;
  document.getElementById('dashAvatar').className = 'avatar '+cfg.color;
  document.getElementById('dashName').textContent = username;

  const badge = document.getElementById('dashBadge');
  badge.textContent = cfg.label;
  badge.className = 'role-badge '+cfg.color;

  document.getElementById('statRole').textContent = cfg.emoji+' '+userData.role.toUpperCase();
  document.getElementById('statAccess').textContent = cfg.accessLevel;

  const allPerms = ['READ','WRITE','DELETE','MANAGE_USERS','MANAGE_ROLES','VIEW_LOGS','SYSTEM_CONFIG','ALL_ACCESS','MANAGE_CONTENT','VIEW_REPORTS','PREMIUM_CONTENT','EARLY_ACCESS'];
  const granted = new Set(cfg.perms);
  document.getElementById('dashPerms').innerHTML = allPerms.map(p=>
    `<span class="perm${granted.has(p)?' granted':''}">${granted.has(p)?'✓':'✗'} ${p}</span>`
  ).join('');
}

/* ── Logout ── */
function doLogout(){
  clearSession();
  showToast('Berhasil logout','info');
  setTimeout(()=> location.reload(), 600);
}

/* ── Enter key ── */
document.addEventListener('keydown', e=>{
  if(e.key!=='Enter') return;
  const loginView = document.getElementById('view-login');
  const regView   = document.getElementById('view-register');
  if(loginView.classList.contains('active')) doLogin();
  else if(regView.classList.contains('active')) doRegister();
});