(function () {
  var KEY = 'blog_logged_in';
  var USERNAME = 'admin';
  var PASSWORD = 'hexo2026';

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'login-overlay';

    var card = document.createElement('div');
    card.className = 'login-card';

    var h2 = document.createElement('h2');
    h2.textContent = '个人博客';

    var p = document.createElement('p');
    p.textContent = '请输入用户名和密码';

    var user = document.createElement('input');
    user.type = 'text';
    user.placeholder = '用户名';
    user.id = 'login-username';
    user.autocomplete = 'off';

    var input = document.createElement('input');
    input.type = 'password';
    input.placeholder = '密码';
    input.id = 'login-password';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'login-btn';
    btn.textContent = '登 录';

    var err = document.createElement('div');
    err.className = 'login-error';
    err.textContent = '用户名或密码错误，请重试';

    card.appendChild(h2);
    card.appendChild(p);
    card.appendChild(user);
    card.appendChild(input);
    card.appendChild(btn);
    card.appendChild(err);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    return { overlay: overlay, card: card, user: user, input: input, btn: btn, err: err };
  }

  var els = buildOverlay();

  function fail() {
    els.err.classList.add('show');
    els.card.classList.remove('shake');
    void els.card.offsetWidth;
    els.card.classList.add('shake');
    els.input.value = '';
    els.input.focus();
  }

  function tryLogin() {
    if (els.user.value.trim() === USERNAME && els.input.value === PASSWORD) {
      try {
        sessionStorage.setItem(KEY, '1');
      } catch (e) {}
      els.overlay.classList.add('hidden');
    } else {
      fail();
    }
  }

  els.btn.addEventListener('click', tryLogin);
  els.input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      tryLogin();
    }
  });

  var authed = false;
  try {
    authed = sessionStorage.getItem(KEY) === '1';
  } catch (e) {}

  if (authed) {
    els.overlay.classList.add('hidden');
  } else {
    els.user.focus();
  }
})();