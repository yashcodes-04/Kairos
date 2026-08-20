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

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!registerForm.checkValidity()) {
    message.textContent = 'Please complete all required fields before creating your account.';
    message.classList.add('error-message');
    registerForm.reportValidity();
    return;
  }

  const payload = { name: document.querySelector('#fullName').value.trim(), email: document.querySelector('#registerEmail').value.trim(), password: passwordInput.value, role: selectedRole, college: document.querySelector('#college').value.trim(), course: document.querySelector('#course').value.trim(), availability: document.querySelector('#availability').value, company: document.querySelector('#company').value.trim(), jobTitle: document.querySelector('#jobTitle').value.trim(), industry: document.querySelector('#industry').value };
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const account = await response.json();
    if (!response.ok) throw new Error(account.message);
    localStorage.setItem('kairosAccount', JSON.stringify(account));
    message.classList.remove('error-message'); message.textContent = 'Account created! Opening your workspace...';
    setTimeout(() => { window.location.href = selectedRole === 'Recruiter' ? 'recruiter.html' : 'student.html'; }, 900);
  } catch (error) { message.textContent = error.message || 'Could not connect to the server.'; message.classList.add('error-message'); }
});

document.querySelectorAll('a[href="index.html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = 'index.html'; }, 180);
  });
});
