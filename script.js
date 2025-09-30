// Обробка форми реєстрації
document.getElementById('signup').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    if(!name || !email){
      alert('Будь ласка, заповніть усі поля.');
      return;
    }
    const btn = this.querySelector('button');
    btn.textContent = 'Відправка...';
    setTimeout(()=>{
      alert('Дякуємо за реєстрацію, ' + name + '! Ми надішлемо лист на ' + email);
      this.reset();
      btn.textContent = 'Sign Up';
    },900);
  });
    // Кнопка "Розпочати" скролить вниз
    document.getElementById('startBtn').addEventListener('click', ()=>{
      window.scrollTo({top:600,behavior:'smooth'});
    });
    
    // BURGER MENU
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('nav ul.mobile');
    
    burger.addEventListener('click', ()=>{
      burger.classList.toggle('active'); // анімація бургеру
      navMenu.classList.toggle('show');  // відкриття меню
    });
    
    // STAGGER-ANIMATION CARDS
    const cards = document.querySelectorAll('.cards .card');
    cards.forEach((card, i)=>{
      card.style.animationDelay = `${i * 0.15}s`;
    });