// login.js - handles login and register forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      await login(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    try {
      await register(name, email, password);
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };
});
