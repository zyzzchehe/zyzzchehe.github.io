(function () {
  'use strict';

  var LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/i;
  var PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C42', '#A8E6CF', '#C9B1FF', '#6C7BFF'];

  var actions = document.querySelector('.thzh-actions');
  var grid = document.querySelector('.tool-grid');
  var form = document.getElementById('thzh-add-form');
  var addBtn = document.getElementById('thzh-add-btn');
  var titleInput = document.getElementById('thzh-title');
  var urlInput = document.getElementById('thzh-url');

  function styleCard(card, color) {
    var n = parseInt(String(color).slice(1), 16);
    if (isNaN(n)) return;
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    card.style.setProperty('--thzh-dot', color);
    card.style.background = 'linear-gradient(160deg, rgba(' + r + ',' + g + ',' + b + ',0.12), #ffffff 72%)';
    card.style.borderColor = 'rgb(' + Math.round(r * 0.7) + ',' + Math.round(g * 0.7) + ',' + Math.round(b * 0.7) + ')';
  }

  Array.prototype.slice.call(document.querySelectorAll('.tool-card[data-color]')).forEach(function (card) {
    styleCard(card, card.getAttribute('data-color'));
  });

  if (!form || !grid || !addBtn || !titleInput || !urlInput) return;

  if (!LOCAL_HOST.test(location.hostname)) {
    if (actions) actions.style.display = 'none';
    return;
  }

  var page = (actions && actions.getAttribute('data-page')) || (location.pathname.split('/').filter(Boolean)[0] || '');
  var msg = document.createElement('div');
  msg.className = 'thzh-msg';
  msg.setAttribute('role', 'status');
  actions.appendChild(msg);

  function notify(text, ok) {
    msg.textContent = text;
    msg.classList.toggle('is-error', !ok);
    if (ok) {
      window.clearTimeout(notify.timer);
      notify.timer = window.setTimeout(function () { msg.textContent = ''; }, 4000);
    }
  }

  function normalizeUrl(value) {
    var url = value.trim();
    if (!url) return '';
    if (url.charAt(0) !== '/' && !/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(url)) url = 'https://' + url;
    return url;
  }

  function request(action, payload) {
    return fetch('/api/links/' + action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok || data.ok === false) throw new Error(data.error || ('HTTP ' + res.status));
        return data;
      });
    });
  }

  function buildCard(link) {
    var card = document.createElement('a');
    card.href = link.url;
    card.className = 'tool-card';
    card.target = '_blank';
    card.rel = 'noopener';
    card.setAttribute('data-color', link.color);

    var h3 = document.createElement('h3');
    h3.textContent = link.title;
    card.appendChild(h3);
    card.appendChild(buildDel(link));
    styleCard(card, link.color);
    return card;
  }

  function buildDel(link) {
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'thzh-del';
    del.title = '删除';
    del.textContent = '×';
    del.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm('确定从 index.md 删除「' + link.title + '」吗？')) return;
      request('delete', { page: page, title: link.title, url: link.url }).then(function () {
        var card = del.parentNode;
        if (card) card.remove();
        notify('已从 index.md 删除', true);
      }).catch(function (err) {
        notify('删除失败：' + err.message, false);
      });
    });
    return del;
  }

  Array.prototype.slice.call(grid.querySelectorAll('.tool-card')).forEach(function (card) {
    var h3 = card.querySelector('h3');
    if (!card.querySelector('.thzh-del')) {
      card.appendChild(buildDel({ title: h3 ? h3.textContent : '', url: card.getAttribute('href') || '' }));
    }
  });

  addBtn.addEventListener('click', function () {
    form.hidden = false;
    addBtn.hidden = true;
    titleInput.focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    var url = normalizeUrl(urlInput.value);
    if (!title || !url) {
      notify('名称和网址都要填', false);
      return;
    }

    request('add', { page: page, title: title, url: url }).then(function (data) {
      grid.appendChild(buildCard(data.link));
      form.hidden = true;
      addBtn.hidden = false;
      form.reset();
      notify('已写入 source/' + page + '/index.md', true);
    }).catch(function (err) {
      notify('保存失败：' + err.message, false);
    });
  });
})();
