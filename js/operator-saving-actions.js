/**
 * CSE122 - BTL-36 SmartBuilding
 * js/operator-saving-actions.js
 * 1. Modal tao Task tu goi y AI
 * 2. Nhan giu chuot trai + keo trai/phai de chinh phan tram % tien do
 * 3. Nut XOA tren moi task
 * 4. Luu tasks moi vao localStorage
 */
(function () {
  'use strict';
  var STORE = 'smartbuilding_saving_tasks_v1';
  var STEP = 10; // moi 10px keo doi 10%
  function $(id) { return document.getElementById(id); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function save(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {} }
  function toast(msg, ok) {
    var b = $('toast'); if (!b) return;
    b.textContent = msg;
    b.className = 'toast show ' + (ok === false ? 'toast-error' : 'toast-ok');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { b.classList.remove('show'); }, 2400);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function statusHtml(p) {
    return p >= 100
      ? '<span class="st st-done"><i></i>Ho\u00e0n t\u1ea5t</span>'
      : '<span class="st"><i></i>\u0110ang ch\u1ea1y</span>';
  }
  function statusCardHtml(p) {
    return p >= 100
      ? '<span class="st st-done"><i></i>Ho\u00e0n th\u00e0nh</span>'
      : '<span class="st"><i></i>\u0110ang th\u1ef1c hi\u1ec7n</span>';
  }
  function getEl(id) {
    var row = document.querySelector('#taskTableBody tr[data-id="' + id + '"]');
    var card = document.querySelector('#taskCards .task-card[data-id="' + id + '"]');
    return { row: row, card: card };
  }
  function getProgress(id) {
    var el = getEl(id);
    var raw = (el.row && el.row.getAttribute('data-progress')) || (el.card && el.card.getAttribute('data-progress')) || '0';
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }
  // Cap nhat tien do tren ca bang (table) va card (mobile)
  function updateProgress(id, value, persist) {
    var p = Math.max(0, Math.min(100, Math.round(value)));
    var el = getEl(id);
    [el.row, el.card].forEach(function (node) {
      if (!node) return;
      node.setAttribute('data-progress', String(p));
      var fill = node.querySelector('.prog-fill');
      if (fill) fill.style.width = p + '%';
      var pct = node.querySelector('.prog-pct');
      if (pct && !pct.querySelector('.progress-edit-input')) pct.textContent = p + '%';
    });
    if (el.row) { var st = el.row.querySelector('.st'); if (st && st.className !== (p >= 100 ? 'st st-done' : 'st')) st.outerHTML = statusHtml(p); }
    if (el.card) { var cs = el.card.querySelector('.st'); if (cs && cs.className !== (p >= 100 ? 'st st-done' : 'st')) cs.outerHTML = statusCardHtml(p); }
    if (persist !== false) {
      var list = load();
      list.forEach(function (t) { if (t.id === id) t.progress = p; });
      save(list);
    }
    return p;
  }
  function persistDelete(id) {
    var list = load();
    save(list.filter(function (t) { return t.id !== id; }));
  }
  // ======== Keo chuot trai de chinh % tien do ========
  var drag = null;
  function onDragMove(e) {
    if (!drag) return;
    e.preventDefault();
    var delta = e.clientX - drag.startX;
    var steps = Math.round(delta / STEP);
    var next = drag.startProgress + steps * STEP;
    next = Math.max(0, Math.min(100, next));
    if (next !== drag.current) {
      drag.current = next;
      drag.moved = true;
      updateProgress(drag.id, next, false);
    }
  }
  function onDragEnd() {
    if (!drag) return;
    var d = drag;
    drag = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.body.classList.remove('is-dragging-progress');
    if (d.target) d.target.classList.remove('dragging');
    updateProgress(d.id, d.current);
    if (d.moved) {
      lastDragEnd = Date.now();
      toast('Ti\u1ebfn \u0111\u1ed9 Task ' + d.id + ': ' + d.current + '%', true);
    }
  }
  function startDrag(e, id, pctEl) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    var start = getProgress(id);
    drag = { id: id, startX: e.clientX, startProgress: start, current: start, target: pctEl, moved: false };
    if (pctEl) pctEl.classList.add('dragging');
    document.body.classList.add('is-dragging-progress');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }
  // ======== Xoa task ========
  function deleteTask(id) {
    var el = getEl(id);
    if (el.row) el.row.remove();
    if (el.card) el.card.remove();
    persistDelete(id);
    toast('\u0110\u00e3 x\u00f3a Task ' + id, true);
  }
  // ======== Sua tien do bang input ========
  function createProgressEditor(id, currentProgress) {
    var input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '100';
    input.value = currentProgress;
    input.className = 'progress-edit-input';
    input.dataset.id = id;
    input.style.width = '40px';
    input.style.textAlign = 'center';
    input.style.marginLeft = '8px';
    input.style.padding = '2px';
    input.style.fontSize = '12px';
    return input;
  }
  function editProgress(id, currentProgress) {
    var el = getEl(id);
    var input = createProgressEditor(id, currentProgress);
    var existing = document.querySelector('.progress-edit-input');
    if (existing) existing.remove();
    var pctCell = el.row ? el.row.querySelector('.prog-pct') : el.card ? el.card.querySelector('.prog-pct') : null;
    if (!pctCell) return;
    pctCell.innerHTML = '';
    pctCell.appendChild(input);
    input.focus();
    input.select();
    function saveProgress() {
      if (!input.parentNode) return;
      var newVal = parseInt(input.value, 10);
      if (isNaN(newVal)) newVal = currentProgress;
      newVal = Math.max(0, Math.min(100, newVal));
      updateProgress(id, newVal);
      var rowPct = el.row ? el.row.querySelector('.prog-pct') : null;
      var cardPct = el.card ? el.card.querySelector('.prog-pct') : null;
      if (rowPct) rowPct.textContent = newVal + '%';
      if (cardPct) cardPct.textContent = newVal + '%';
      toast('\u0110\u00e3 c\u1eadp nh\u1eadt ti\u1ebfn \u0111\u1ed9 ' + newVal + '% cho Task ' + id, true);
      input.remove();
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveProgress(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    });
    input.addEventListener('blur', saveProgress);
    function cancelEdit() {
      if (!input.parentNode) return;
      input.remove();
      var rowPct = el.row ? el.row.querySelector('.prog-pct') : null;
      var cardPct = el.card ? el.card.querySelector('.prog-pct') : null;
      var keep = currentProgress + '%';
      if (rowPct) rowPct.textContent = keep;
      if (cardPct) cardPct.textContent = keep;
    }
  }
  // ======== Ve bang va card ========
  function deleteBtnHtml() {
    return '<button type="button" class="task-delete-btn" title="X\u00f3a task" aria-label="X\u00f3a task">\u00d7</button>';
  }
  function progHtml(p) {
    return '<div class="prog-wrap"><div class="prog-track"><div class="prog-fill" style="width:' + p + '%"></div></div>'
      + '<span class="prog-pct" title="Nh\u00ean gi\u1eef chu\u1ed9t tr\u00e1i v\u00e0 k\u00e9o tr\u00e1i/ph\u1ea3i \u0111\u1ec3 \u0111\u1ed5i ti\u1ebfn \u0111\u1ed9">' + p + '%</span></div>';
  }
  function bindProgress(el, id) {
    var wrap = el.querySelector('.prog-wrap');
    if (!wrap) return;
    wrap.addEventListener('mousedown', function (e) {
      var pct = wrap.querySelector('.prog-pct');
      if (!pct) return;
      startDrag(e, id, pct);
    });
    wrap.addEventListener('click', function (e) {
      if (Date.now() - lastDragEnd < 300) return; // vua keo xong -> khong mo o nhap
      var t = e.target;
      if (t && (t.className === 'prog-pct' || (t.parentNode && t.parentNode.className === 'prog-pct'))) {
        e.stopPropagation();
        editProgress(id, getProgress(id));
      }
    });
  }
  var lastDragEnd = 0;
  function addTask(t) {
    var tb = $('taskTableBody');
    var tr = document.createElement('tr');
    tr.setAttribute('data-id', t.id);
    tr.setAttribute('data-progress', String(t.progress));
    tr.innerHTML = '<td class="mono">' + esc(t.id) + '</td>'
      + '<td class="content-cell">' + esc(t.content) + '</td>'
      + '<td class="tech-cell">' + esc(t.tech) + '</td>'
      + '<td class="deadline-cell">' + esc(t.deadline) + '</td>'
      + '<td>' + progHtml(t.progress) + '</td>'
      + '<td>' + statusHtml(t.progress) + '</td>'
      + '<td class="delete-cell">' + deleteBtnHtml() + '</td>';
    if (tb) tb.appendChild(tr);
    bindProgress(tr, t.id);

    var cards = $('taskCards');
    var ac = document.createElement('article');
    ac.className = 'task-card'; ac.setAttribute('tabindex', '0');
    ac.setAttribute('data-id', t.id); ac.setAttribute('data-progress', String(t.progress));
    ac.innerHTML = '<div class="tc-top"><span class="tc-id">' + esc(t.id) + '</span>' + statusCardHtml(t.progress) + deleteBtnHtml() + '</div>'
      + '<div class="tc-title">' + esc(t.content) + '</div>'
      + '<div class="tc-sub">Ph\u1ee5 tr\u00e1ch: ' + esc(t.tech) + ' \u2022 ' + esc(t.deadline) + '</div>'
      + progHtml(t.progress);
    if (cards) cards.appendChild(ac);
    bindProgress(ac, t.id);
  }
  function bindDelete(el, id) {
    var btn = el.querySelector('.task-delete-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      deleteTask(id);
    });
  }
  function bindStatic(el) {
    var id = el.getAttribute('data-id');
    if (!id) return;
    bindProgress(el, id);
    bindDelete(el, id);
  }
  function openModal() { var m = $('taskModal'); if (m) { m.classList.add('show'); m.setAttribute('aria-hidden', 'false'); var f = $('fContent'); if (f) f.focus(); } }
  function closeModal() { var m = $('taskModal'); if (m) { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); } }
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Nap task da luu
    load().forEach(addTask);
    // 2. Gan su kien cho cac task co san trong HTML
    all('#taskTableBody tr, #taskCards .task-card').forEach(bindStatic);
    // 3. Modal
    ['createTaskTop', 'createTaskMobile'].forEach(function (id) {
      var b = $(id); if (b) b.addEventListener('click', openModal);
    });
    var c = $('taskModalClose'); if (c) c.addEventListener('click', closeModal);
    var x = $('taskModalCancel'); if (x) x.addEventListener('click', closeModal);
    var m = $('taskModal'); if (m) m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var s = $('taskModalSubmit');
    if (s) s.addEventListener('click', function () {
      var content = ($('fContent') && $('fContent').value.trim()) || 'Task ti\u1ebft ki\u1ec7m m\u1edbi';
      var tech = ($('fTech') && $('fTech').value.trim()) || 'K\u1ef9 thu\u1eadt \u0111i\u1ec7n';
      var deadline = ($('fDeadline') && $('fDeadline').value.trim()) || '20/10/2025';
      var progress = Math.max(0, Math.min(100, parseInt(($('fProgress') && $('fProgress').value) || '0', 10)));
      var list = load();
      var id = 'TASK-' + (143 + list.length);
      var t = { id: id, content: content, tech: tech, deadline: deadline, progress: progress };
      list.push(t); save(list); addTask(t); closeModal();
      toast('\u0110\u00e3 t\u1ea1o ' + id + ' giao ' + tech + '.', true);
    });
  });
})();
