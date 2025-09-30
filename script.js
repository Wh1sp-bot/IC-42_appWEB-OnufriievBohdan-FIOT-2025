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
  