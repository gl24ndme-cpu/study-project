import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBZtIQSdbahEYBp1C29-s6WyYH4UNvPf9A",
  authDomain: "music-2c146.firebaseapp.com",
  projectId: "music-2c146",
  storageBucket: "music-2c146.firebasestorage.app",
  messagingSenderId: "220576495488",
  appId: "1:220576495488:web:0d0e04782816d32033b365"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export let currentUser = null;

const authorizeOverlay = document.getElementById('authorize-overlay');
const authBtn = document.getElementById('auth-btn');
const openLogin = document.getElementById('open-login');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const passwordConfirmInput = document.getElementById('password-confirm-input');
const userNick = document.getElementById('un-login');
const authError = document.getElementById('auth-error');
const authTitle = document.getElementById('auth-title');
const modeButtons = document.querySelectorAll('.auth-mode-btn');

let authMode = 'login';

openLogin.addEventListener('click', () => {
  authorizeOverlay.classList.add('active');
  clearAuthForm();
});

authorizeOverlay.addEventListener('click', (e) => {
  if (e.target === authorizeOverlay) {
    authorizeOverlay.classList.remove('active');
    clearAuthForm();
  }
});

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    authMode = btn.dataset.mode;

    if (authMode === 'register') {
      authTitle.textContent = 'Регистрация';
      authBtn.textContent = 'Зарегистрироваться';
      passwordConfirmInput.style.display = 'block';
    } else {
      authTitle.textContent = 'Авторизация';
      authBtn.textContent = 'Войти';
      passwordConfirmInput.style.display = 'none';
    }
    clearAuthError();
  });
});

authBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const passwordConfirm = passwordConfirmInput.value.trim();

  if (!email || !password) {
    showAuthError('Введите email и пароль!');
    return;
  }

  if (!isValidEmail(email)) {
    showAuthError('Введите корректный email!');
    return;
  }

  if (password.length < 6) {
    showAuthError('Пароль должен быть минимум 6 символов!');
    return;
  }

  if (authMode === 'register' && password !== passwordConfirm) {
    showAuthError('Пароли не совпадают!');
    return;
  }

  authBtn.disabled = true;
  authBtn.textContent = 'Загрузка...';

  try {
    if (authMode === 'register') {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    showAuthError(getErrorMessage(error.code));
    authBtn.disabled = false;
    authBtn.textContent = authMode === 'register' ? 'Зарегистрироваться' : 'Войти';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loginSuccess(user);
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
  } else {
    currentUser = null;
    showLoggedOutState();
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }
});

function loginSuccess(user) {
  authorizeOverlay.classList.remove('active');
  openLogin.style.display = 'none';

  const displayName = user.email.split('@')[0];
  userNick.textContent = displayName;
  userNick.style.color = 'white';
  userNick.style.cursor = 'pointer';
  userNick.style.marginLeft = '10px';
  userNick.title = 'Нажмите для выхода';

  userNick.onclick = logout;
  clearAuthForm();
}

function showLoggedOutState() {
  openLogin.style.display = 'block';
  userNick.textContent = '';
  userNick.onclick = null;
}

async function logout() {
  try {
    await signOut(auth);
  } catch (error) { }
}

function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
}

function clearAuthError() {
  authError.textContent = '';
  authError.style.display = 'none';
}

function clearAuthForm() {
  emailInput.value = '';
  passwordInput.value = '';
  passwordConfirmInput.value = '';
  clearAuthError();
  authBtn.disabled = false;
  authBtn.textContent = authMode === 'register' ? 'Зарегистрироваться' : 'Войти';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/invalid-email': 'Некорректный email',
    'auth/operation-not-allowed': 'Авторизация временно недоступна',
    'auth/weak-password': 'Пароль слишком простой',
    'auth/user-disabled': 'Аккаунт заблокирован',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение'
  };
  return messages[errorCode] || 'Произошла ошибка. Попробуйте снова';
}
