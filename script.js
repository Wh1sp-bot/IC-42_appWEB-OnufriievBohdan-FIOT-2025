/* ---------- storage keys ---------- */
const USERS_KEY = 'gachifit_users';
const PROFILE_KEY = 'gachifit_profile';

/* ---------- DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  setupBurger();
  await ensureAdmin();
  initSignup();
  initLogin();
  initUserPage();
  initAdminPage();
  checkSessionForProtectedPages();
  updateNavLinks();
});

/* ---------- NAV BURGER ---------- */
function setupBurger(){
  const burgers = document.querySelectorAll('.burger');
  burgers.forEach(b => {
    b.addEventListener('click', ()=> {
      b.classList.toggle('active');
      const navMenu = document.querySelector('nav ul.mobile');
      if(navMenu) navMenu.classList.toggle('show');
    });
    b.addEventListener('keydown', (e)=> { if(e.key === 'Enter') b.click(); });
  });
}

/* ---------- PASSWORD HASH ---------- */
async function hashPassword(pass){
  const enc = new TextEncoder();
  const data = enc.encode(pass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ---------- ENSURE ADMIN ---------- */
async function ensureAdmin(){
  const users = loadUsers();
  if(!users.some(u => u.role==='admin' && u.login==='admin')){
    const hash = await hashPassword('admin');
    users.push({
      id: 'admin-1',
      login: 'admin',
      email: 'admin@gachifit.local',
      passwordHash: hash,
      role: 'admin',
      created: new Date().toISOString().split('T')[0]
    });
    saveUsers(users);
  }
}

/* ---------- SIGNUP ---------- */
function initSignup(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const login = form.regLogin.value.trim();
    const email = form.regEmail.value.trim();
    const pass = form.regPassword.value;
    if(!login || !pass){ alert('Логін і пароль обов\'язкові'); return; }

    const users = loadUsers();
    if(users.some(u=>u.login===login)){ alert('Користувач з таким логіном вже існує'); return; }

    const passHash = await hashPassword(pass);
    users.push({id:Date.now().toString(), login, email, passwordHash: passHash, role:'user', created:new Date().toISOString().split('T')[0]});
    saveUsers(users);
    alert('Користувача створено. Тепер ви можете увійти.');
    form.reset();
    window.location.href='login.html';
  });
}

/* ---------- LOGIN ---------- */
function initLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const login = form.loginUser.value.trim();
    const pass = form.loginPass.value;
    if(!login || !pass){ alert('Введіть логін і пароль'); return; }

    const users = loadUsers();
    const found = users.find(u=>u.login===login);
    if(!found){ alert('Користувача не знайдено'); return; }

    const passHash = await hashPassword(pass);
    if(passHash !== found.passwordHash){ alert('Невірний пароль'); return; }

    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      id: found.id, login: found.login, email: found.email, role: found.role, since: found.created
    }));

    window.location.href = found.role==='admin' ? 'admin.html' : 'user.html';
  });
}

/* ---------- USER PAGE ---------- */
function initUserPage(){
  const profile = getProfile();
  if(!profile) return;

  const nameDiv = document.getElementById('profileName');
  const emailDiv = document.getElementById('profileEmail');
  const sinceDiv = document.getElementById('profileSince');
  if(nameDiv) nameDiv.textContent = profile.login;
  if(emailDiv) emailDiv.textContent = profile.email;
  if(sinceDiv) sinceDiv.textContent = `Зареєстрований: ${profile.since}`;

  const historyList = document.getElementById('historyList');
  if(historyList){
    const h = loadHistory(profile.login);
    historyList.innerHTML = h.length ? h.map(it=>`<li>${escapeHtml(it)}</li>`).join('') : '<li style="color:var(--muted)">Історія порожня</li>';
  }

  addLogoutListener();
}

/* ---------- ADMIN PAGE ---------- */
function initAdminPage(){
  const profile = getProfile();
  if(!profile || profile.role!=='admin') return;

  const btnAdd = document.getElementById('btnAddUser');
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  const usersTbody = document.querySelector('#usersTable tbody');

  renderUsers();

  if(btnAdd) btnAdd.addEventListener('click', ()=> openModal('add'));
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal(); });

  if(modalForm) modalForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = modalForm.dataset.editId;
    const login = modalForm.mName.value.trim();
    const email = modalForm.mEmail.value.trim();
    const role = modalForm.mRole.value;
    const pass = modalForm.mPass.value;
    if(!login){ alert('Логін обов\'язковий'); return; }

    const users = loadUsers();
    if(id){
      const idx = users.findIndex(u=>String(u.id)===String(id));
      if(idx===-1){ alert('Користувача не знайдено'); return; }
      if(users.some((u,i)=>i!==idx && u.login===login)){ alert('Інший користувач з таким логіном вже є'); return; }
      users[idx].login = login; users[idx].email = email; users[idx].role = role;
      if(pass) users[idx].passwordHash = await hashPassword(pass);
    } else {
      if(users.some(u=>u.login===login)){ alert('Користувач з таким логіном вже існує'); return; }
      const passHash = pass ? await hashPassword(pass) : await hashPassword('123456');
      users.push({id:Date.now().toString(), login, email, passwordHash:passHash, role, created:new Date().toISOString().split('T')[0]});
    }
    saveUsers(users);
    closeModal();
    renderUsers();
  });

  // export/import
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const importFile = document.getElementById('importFile');

  if(btnExport) btnExport.addEventListener('click', ()=>{
    const users = loadUsers();
    const blob = new Blob([JSON.stringify(users,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='gachifit_users.json'; a.click();
    URL.revokeObjectURL(url);
  });

  if(btnImport) btnImport.addEventListener('click', ()=> importFile.click());
  if(importFile) importFile.addEventListener('change',(e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const data = JSON.parse(ev.target.result);
        if(!Array.isArray(data)){ alert('JSON повинен бути масивом користувачів'); return; }
        const adminCount = data.filter(u=>u.role==='admin' && u.login==='admin').length;
        if(adminCount===0 && !confirm('Файл не містить адміністратора admin. Продовжити?')) return;
        saveUsers(data);
        alert('Імпорт завершено');
        renderUsers();
      }catch(err){ alert('Неможливо прочитати JSON: '+err.message); }
    };
    reader.readAsText(file);
    importFile.value='';
  });

  addLogoutListener();

  /* ---------- HELPERS ---------- */
  function renderUsers(){
    if(!usersTbody) return;
    usersTbody.innerHTML='';
    const users = loadUsers();
    if(users.length===0){ usersTbody.innerHTML='<tr><td colspan="5" style="color:var(--muted)">Користувачі відсутні</td></tr>'; return; }
    users.forEach(u=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(u.login)}</td>
        <td>${escapeHtml(u.email||'')}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${escapeHtml(u.created||'')}</td>
        <td>
          <button class="action-btn action-edit" data-id="${u.id}">Редагувати</button>
          <button class="action-btn action-delete" data-id="${u.id}">Видалити</button>
        </td>
      `;
      usersTbody.appendChild(tr);
    });

    usersTbody.querySelectorAll('.action-edit').forEach(btn=>btn.addEventListener('click',(e)=>openModal('edit', e.currentTarget.dataset.id)));
    usersTbody.querySelectorAll('.action-delete').forEach(btn=>btn.addEventListener('click',(e)=>{
      if(!confirm('Ви впевнені?')) return;
      let users = loadUsers();
      users = users.filter(u=>String(u.id)!==String(e.currentTarget.dataset.id));
      saveUsers(users); renderUsers();
    }));
  }

  function openModal(mode,id){
    modalTitle.textContent = mode==='edit'?'Редагувати користувача':'Додати користувача';
    modalForm.dataset.editId=''; modalForm.mName.value=''; modalForm.mEmail.value=''; modalForm.mRole.value='user'; modalForm.mPass.value='';
    if(mode==='edit' && id){
      const u = loadUsers().find(x=>String(x.id)===String(id));
      if(u){ modalForm.dataset.editId=u.id; modalForm.mName.value=u.login; modalForm.mEmail.value=u.email||''; modalForm.mRole.value=u.role||'user'; }
    }
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); delete modalForm.dataset.editId; }
}

/* ---------- PROFILE HELPERS ---------- */
function getProfile(){ const profileRaw=localStorage.getItem(PROFILE_KEY); return profileRaw?JSON.parse(profileRaw):null; }
function addLogoutListener(){
  document.querySelectorAll('.logout-btn').forEach(b=>b.addEventListener('click', ()=>{
    localStorage.removeItem(PROFILE_KEY);
    window.location.href='index.html';
  }));
}

/* ---------- STORAGE HELPERS ---------- */
function loadUsers(){ const raw = localStorage.getItem(USERS_KEY); try{return raw?JSON.parse(raw):[];}catch(e){return [];} }
function saveUsers(arr){ localStorage.setItem(USERS_KEY,JSON.stringify(arr)); }

/* ---------- HISTORY ---------- */
function saveHistory(login,text){ const key='gachifit_history_'+login; const arr=loadHistory(login); arr.unshift(text); localStorage.setItem(key, JSON.stringify(arr.slice(0,50))); }
function loadHistory(login){ try{ const key='gachifit_history_'+login; const raw=localStorage.getItem(key); return raw?JSON.parse(raw):[]; }catch(e){return [];} }

/* ---------- HTML ESCAPE ---------- */
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
/* ---------- SESSION CHECK ---------- */
function checkSessionForProtectedPages(){
  const profile = getProfile();
  const page = window.location.pathname.split('/').pop();

  // Не блокуємо index.html для залогінених
  if(!profile && ['user.html','admin.html'].includes(page)){
    window.location.href = 'login.html';
  }
  // Login та register редіректимо для залогінених
  if(profile && ['login.html','register.html'].includes(page)){
    window.location.href = profile.role==='admin' ? 'admin.html' : 'user.html';
  }
}
function updateNavLinks(){
  const navDesktop = document.querySelector('nav ul.desktop');
  const navMobile = document.querySelector('nav ul.mobile'); // мобільне меню
  const profile = getProfile();

  // Функція для оновлення конкретного меню
  function updateMenu(nav){
    if(!nav) return;
    const loginLink = nav.querySelector('a[href="login.html"]');
    const registerLink = nav.querySelector('a[href="register.html"]');

    if(profile){
      if(loginLink){
        loginLink.textContent = profile.role==='admin' ? 'Адмінка' : 'Мій профіль';
        loginLink.href = profile.role==='admin' ? 'admin.html' : 'user.html';
      }
      if(registerLink) registerLink.style.display='none';

      // Logout кнопка тільки раз
      if(!nav.querySelector('.logout-li')){
        const li = document.createElement('li');
        li.className = 'logout-li';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Вийти';
        a.className = 'logout-btn';
        a.addEventListener('click', () => {
          localStorage.removeItem(PROFILE_KEY);
          window.location.href = 'index.html';
        });
        li.appendChild(a);
        nav.appendChild(li);
      }
    } else {
      if(loginLink) loginLink.textContent='Увійти';
      if(registerLink) registerLink.style.display='';
      const logoutLi = nav.querySelector('.logout-li');
      if(logoutLi) logoutLi.remove();
    }
  }

  updateMenu(navDesktop);
  updateMenu(navMobile);
}
