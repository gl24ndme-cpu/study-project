const authorizeOverlay = document.getElementById('authorize-overlay');
const loginBtn = document.getElementById('login-btn');
const openLogin = document.getElementById('open-login');
const loginInput = document.getElementById('login-input');
const passwordInput = document.getElementById('password-input');
const userNick = document.getElementById('un-login');

window.addEventListener('load', () => {
  const user = localStorage.getItem('user');
  if (user) {
    loginSuccess(JSON.parse(user));
  }
});

openLogin.addEventListener('click', () => {
  authorizeOverlay.classList.add('active');
});

authorizeOverlay.addEventListener('click', (e) => {
  if (e.target === authorizeOverlay) {
    authorizeOverlay.classList.remove('active');
  }
});

loginBtn.addEventListener('click', () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  if (!login || !password) {
    alert('Введите логин и пароль!');
    return;
  }

  const user = { login };
  localStorage.setItem('user', JSON.stringify(user));

  loginSuccess(user);
});

function loginSuccess(user) {
  authorizeOverlay.classList.remove('active');

  openLogin.style.display = 'none';

  userNick.textContent = user.login;
  userNick.style.color = 'white';
  userNick.style.cursor = 'pointer';
  userNick.style.marginLeft = '10px';

  userNick.onclick = () => {
    logout();
  };

  if (!userNick.parentNode) {
    openLogin.parentNode.appendChild(userNick);
  }
}

function logout() {
  localStorage.removeItem('user');
  location.reload();
}
