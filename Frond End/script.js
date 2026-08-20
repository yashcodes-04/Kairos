const roleCards = document.querySelectorAll('.role-card');
const passwordInput = document.querySelector('#password');
const showPasswordButton = document.querySelector('#showPassword');
const loginForm = document.querySelector('#loginForm');
const message = document.querySelector('#message');
const companyField = document.querySelector('#companyField');
const loginCompany = document.querySelector('#loginCompany');
let selectedRole = 'Student';

roleCards.forEach((card) => {
  card.addEventListener('click', () => {
    roleCards.forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    selectedRole = card.dataset.role;
    const isRecruiter = selectedRole === 'Recruiter';
    companyField.classList.toggle('hidden', !isRecruiter);
    loginCompany.required = isRecruiter;
  });
});

showPasswordButton.addEventListener('click', () => {
  const hidden = passwordInput.type === 'password';
  passwordInput.type = hidden ? 'text' : 'password';
  showPasswordButton.textContent = hidden ? 'Hide' : 'Show';
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!loginForm.checkValidity()) {
    message.textContent = 'Please enter all required login details.';
    message.classList.add('error-message');
    loginForm.reportValidity();
    return;
  }

  const email = document.querySelector('#email').value.trim();
  const password = passwordInput.value;
  const company = loginCompany.value.trim();
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: selectedRole, company }) });
    const account = await response.json();
    if (!response.ok) throw new Error(account.message);
    localStorage.setItem('kairosAccount', JSON.stringify(account));
    message.classList.remove('error-message'); message.textContent = `Welcome back, ${account.name}!`;
    setTimeout(() => { window.location.href = selectedRole === 'Recruiter' ? 'recruiter.html' : 'student.html'; }, 500);
  } catch (error) { message.textContent = error.message || 'Could not connect to the server.'; message.classList.add('error-message'); }
});

document.querySelectorAll('a[href="register.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = 'register.html'; }, 180);
  });
});
