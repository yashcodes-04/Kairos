const roleCards = document.querySelectorAll('.role-card');
const passwordInput = document.querySelector('#registerPassword');
const showPasswordButton = document.querySelector('#showPassword');
const registerForm = document.querySelector('#registerForm');
const message = document.querySelector('#message');
const studentFields = document.querySelector('#studentFields');
const recruiterFields = document.querySelector('#recruiterFields');
let selectedRole = 'Student';

function changeRequiredFields(fields, required) {
  fields.querySelectorAll('input, select').forEach((field) => {
    field.required = required;
  });
}

roleCards.forEach((card) => {
  card.addEventListener('click', () => {
    roleCards.forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    selectedRole = card.dataset.role;

    const isStudent = selectedRole === 'Student';
    studentFields.classList.toggle('hidden', !isStudent);
    recruiterFields.classList.toggle('hidden', isStudent);
    changeRequiredFields(studentFields, isStudent);
    changeRequiredFields(recruiterFields, !isStudent);
  });
});

showPasswordButton.addEventListener('click', () => {
  const hidden = passwordInput.type === 'password';
  passwordInput.type = hidden ? 'text' : 'password';
  showPasswordButton.textContent = hidden ? 'Hide' : 'Show';
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!registerForm.checkValidity()) {
    message.textContent = 'Please complete all required fields before creating your account.';
    message.classList.add('error-message');
    registerForm.reportValidity();
    return;
  }

  const name = document.querySelector('#fullName').value;
  const account = {
    name: name.trim(),
    email: document.querySelector('#registerEmail').value.trim(),
    password: passwordInput.value,
    role: selectedRole,
    company: selectedRole === 'Recruiter' ? document.querySelector('#company').value.trim() : ''
  };

  localStorage.setItem('kairosAccount', JSON.stringify(account));
  message.classList.remove('error-message');
  message.textContent = `Account created! Taking you to the sign-in page...`;

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
});

document.querySelectorAll('a[href="index.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = 'index.html'; }, 180);
  });
});
