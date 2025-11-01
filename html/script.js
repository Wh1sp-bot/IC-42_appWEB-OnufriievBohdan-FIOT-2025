/* ---------- CONFIG ---------- */
const API_URL = "http://localhost:4000/api";

/* ---------- DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  setupBurger();
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

/* ---------- SIGNUP ---------- */
function initSignup() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = form.regLogin.value.trim();
    const email = form.regEmail.value.trim();
    const pass = form.regPassword.value;

    if (!login || !pass) {
      alert("Логін і пароль обов'язкові");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, email, password: pass })
      });

      if (res.status === 201) {
        const user = await res.json();
        localStorage.setItem('gachifit_profile', JSON.stringify(user));
        if (parseInt(user.role_id) === 1) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'user.html';
        }

      } else {
        const err = await res.json();
        alert(err.message || 'Помилка реєстрації');
      }

    } catch (err) {
      console.error(err);
      alert('Не вдалося зареєструватися — перевір підключення до сервера.');
    }
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
    if(!login || !pass){ alert('Логін і пароль обов\'язкові'); return; }

    try{
      const res = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password: pass })
      });

      if(res.status===200){
        const profile = await res.json();
        localStorage.setItem('gachifit_profile', JSON.stringify(profile));
        window.location.href = profile.role_id===1 ? 'admin.html' : 'user.html';
      } else {
        const e = await res.json();
        alert(e.message || 'Невірний логін або пароль');
      }
    }catch(err){
      console.error(err);
      alert('Не вдалося виконати вхід — перевір підключення до сервера.');
    }
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
  if(sinceDiv) sinceDiv.textContent = `Зареєстрований: ${profile.created_at || '—'}`;

  addLogoutListener();
}

/* ---------- ADMIN PAGE ---------- */
function initAdminPage(){
  const profile = getProfile();
  if(!profile || profile.role_id !== 1) return;

  const usersTbody = document.querySelector('#usersTable tbody');
  const btnAdd = document.getElementById('btnAddUser');
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');

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

    try {
      if(id){
        await fetch(`${API_URL}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, email, role, password: pass })
        });
      } else {
        await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, email, role, password: pass || '123456' })
        });
      }
      closeModal();
      renderUsers();
    } catch(err){
      console.error(err);
      alert('Помилка при збереженні користувача.');
    }
  });

  async function renderUsers(){
    if(!usersTbody) return;
    try {
      const res = await fetch(`${API_URL}/users`);
      const users = await res.json();
      usersTbody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(u.login)}</td>
          <td>${escapeHtml(u.email || '')}</td>
          <td>${u.role_id === 1 ? 'admin' : 'user'}</td>
          <td>${u.created_at ? u.created_at.split('T')[0] : ''}</td>
          <td>
            <button class="action-btn action-edit" data-id="${u.user_id}">Редагувати</button>
            <button class="action-btn action-delete" data-id="${u.user_id}">Видалити</button>
          </td>`;
        usersTbody.appendChild(tr);
      });
      usersTbody.querySelectorAll('.action-delete').forEach(btn=>btn.addEventListener('click', async(e)=>{
        if(!confirm('Ви впевнені?')) return;
        await fetch(`${API_URL}/users/${e.currentTarget.dataset.id}`, { method: 'DELETE' });
        renderUsers();
      }));
    } catch(err){
      console.error(err);
      usersTbody.innerHTML = '<tr><td colspan="5">Не вдалося завантажити користувачів</td></tr>';
    }
  }

  function openModal(mode,id){
    modalTitle.textContent = mode==='edit'?'Редагувати користувача':'Додати користувача';
    modalForm.dataset.editId=''; modalForm.mName.value=''; modalForm.mEmail.value=''; modalForm.mRole.value='user'; modalForm.mPass.value='';
    if(mode==='edit' && id){
      modalForm.dataset.editId = id;
    }
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); delete modalForm.dataset.editId; }

  addLogoutListener();
}

/* ---------- PROFILE HELPERS ---------- */
function getProfile(){ const raw = localStorage.getItem('gachifit_profile'); return raw?JSON.parse(raw):null; }
function addLogoutListener(){
  document.querySelectorAll('.logout-btn').forEach(b=>b.addEventListener('click', ()=>{
    localStorage.removeItem('gachifit_profile');
    window.location.href='index.html';
  }));
}

/* ---------- HTML ESCAPE ---------- */
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ---------- SESSION CHECK ---------- */
function checkSessionForProtectedPages(){
  const profile = getProfile();
  const page = window.location.pathname.split('/').pop();

  if(!profile && ['user.html','admin.html'].includes(page)){
    window.location.href = 'login.html';
  }

  if(profile && ['login.html','register.html'].includes(page)){
    window.location.href = profile.role_id===1 ? 'admin.html' : 'user.html';
  }
}

/* ---------- NAV UPDATE ---------- */
function updateNavLinks(){
  const navDesktop = document.querySelector('nav ul.desktop');
  const navMobile = document.querySelector('nav ul.mobile');
  const profile = getProfile();

  function updateMenu(nav){
    if(!nav) return;
    const loginLink = nav.querySelector('a[href="login.html"]');
    const registerLink = nav.querySelector('a[href="register.html"]');
    if(profile){
      if(loginLink){
        loginLink.textContent = profile.role_id===1 ? 'Адмінка' : 'Мій профіль';
        loginLink.href = profile.role_id===1 ? 'admin.html' : 'user.html';
      }
      if(registerLink) registerLink.style.display='none';
      if(!nav.querySelector('.logout-li')){
        const li = document.createElement('li');
        li.className = 'logout-li';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Вийти';
        a.className = 'logout-btn';
        a.addEventListener('click', () => {
          localStorage.removeItem('gachifit_profile');
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
