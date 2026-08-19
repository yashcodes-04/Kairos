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

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!loginForm.checkValidity()) {
    message.textContent = 'Please enter all required login details.';
    message.classList.add('error-message');
    loginForm.reportValidity();
    return;
  }

  const savedAccount = JSON.parse(localStorage.getItem('kairosAccount'));
  const email = document.querySelector('#email').value.trim();
  const password = passwordInput.value;
  const company = loginCompany.value.trim();

  if (!savedAccount) {
    message.textContent = 'No Kairos account found. Please create an account first.';
    message.classList.add('error-message');
    return;
  }

  if (savedAccount.email !== email || savedAccount.password !== password || savedAccount.role !== selectedRole || (selectedRole === 'Recruiter' && savedAccount.company !== company)) {
    message.textContent = 'Your email, password, or account type does not match.';
    message.classList.add('error-message');
    return;
  }

  message.classList.remove('error-message');
  message.textContent = `Welcome back, ${savedAccount.name}! Signed in as ${selectedRole}.`;
});

document.querySelectorAll('a[href="register.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = 'register.html'; }, 180);
  });
});
