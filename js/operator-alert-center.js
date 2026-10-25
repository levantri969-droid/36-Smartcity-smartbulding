/**
 * CSE122 - BTL-36 SmartBuilding
 * js/operator-alert-center.js
 * Trang: Trung tam canh bao (Vanilla JS)
 * 1. Loc theo muc do (Khan cap / Trung binh / Thap)
 * 2. Tiep nhan / Bo qua tung alert (dong bo table + card)
 * 3. Tac vu hang loat + dem so canh bao mo
 * 4. Luu trang thai vao localStorage
 */
(function () {
  'use strict';
  var STORE = 'smartbuilding_alert_center_v1';
  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  function toast(msg, ok) {
    var b = $('toast'); if (!b) return;
    b.textContent = msg;
    b.className = 'toast show ' + (ok === false ? 'toast-error' : 'toast-ok');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { b.classList.remove('show'); }, 2400);
  }
  function setStatus(id, status) {
    state[id] = status; save(state);
    all('[data-id="' + id + '"]').forEach(function (el) {
      var st = el.querySelector('.st');
      if (st) {
        if (status === 'done') { st.className = 'st st-done'; st.innerHTML = '<i></i>Đã tiếp nhận'; }
        else if (status === 'skipped') { st.className = 'st st-pending'; st.innerHTML = '<i></i>Đã bỏ qua'; }
      }
      var ack = el.querySelector('.btn-ack');
      if (ack) { ack.disabled = (status === 'done'); ack.textContent = status === 'done' ? 'Đã tiếp nhận' : ack.textContent.replace('Đã tiếp nhận', 'Tiếp nhận'); if (el.classList.contains('alert-card') && status !== 'done' && ack.textContent.indexOf('✓') < 0) { ack.textContent = 'Tiếp nhận'; } }
    });
    updateSubtitle();
  }
  function updateSubtitle() {
    var open = 0, crit = 0;
    all('#alertTableBody tr').forEach(function (tr) {
      var id = tr.getAttribute('data-id');
      if (!state[id] || state[id] === 'open') {
        open++;
        if (tr.getAttribute('data-sev') === 'critical') crit++;
      }
    });
    var sub = $('alertSubtitle');
    if (sub) sub.textContent = open + ' cảnh báo mở • ' + crit + ' cảnh báo khẩn cấp';
  }
  function applyFilter() {
    var on = {};
    all('.filter-pill').forEach(function (p) {
      var f = p.getAttribute('data-filter');
      var isOn = p.classList.contains('is-on');
      on[f] = isOn;
      p.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    });
    var visible = 0;
    all('#alertTableBody tr, #alertCards .alert-card').forEach(function (el) {
      var show = !!on[el.getAttribute('data-sev')];
      el.classList.toggle('is-hidden', !show);
      if (show && el.tagName === 'TR') visible++;
    });
    var empty = $('alertEmpty');
    if (empty) empty.classList.toggle('show', visible === 0);
  }
  document.addEventListener('DOMContentLoaded', function () {
    Object.keys(state).forEach(function (id) { if (state[id] !== 'open') setStatus(id, state[id]); });
    updateSubtitle();
    all('.filter-pill').forEach(function (p) {
      p.addEventListener('click', function () {
        p.classList.toggle('is-on'); p.classList.toggle('is-off');
        applyFilter();
      });
    });
    all('.btn-ack').forEach(function (b) {
      b.addEventListener('click', function () {
        var host = b.closest('[data-id]');
        if (!host) return;
        setStatus(host.getAttribute('data-id'), 'done');
        toast('Đã tiếp nhận cảnh báo ' + host.getAttribute('data-id') + '.', true);
      });
    });
    all('.btn-skip').forEach(function (b) {
      b.addEventListener('click', function () {
        var host = b.closest('[data-id]');
        if (!host) return;
        setStatus(host.getAttribute('data-id'), 'skipped');
        toast('Đã bỏ qua cảnh báo ' + host.getAttribute('data-id') + '.', true);
      });
    });
    var bulkAck = $('bulkAckBtn');
    if (bulkAck) bulkAck.addEventListener('click', function () {
      var n = 0;
      all('#alertTableBody tr:not(.is-hidden)').forEach(function (tr) {
        var id = tr.getAttribute('data-id');
        if (state[id] !== 'done') { setStatus(id, 'done'); n++; }
      });
      toast(n ? ('Đã tiếp nhận ' + n + ' cảnh báo.') : 'Không còn cảnh báo nào để tiếp nhận.', n ? true : false);
    });
    var bulkSkip = $('bulkSkipBtn');
    if (bulkSkip) bulkSkip.addEventListener('click', function () {
      all('#alertTableBody tr:not(.is-hidden)').forEach(function (tr) { setStatus(tr.getAttribute('data-id'), 'skipped'); });
      toast('Đã bỏ qua các cảnh báo đang hiển thị.', true);
    });
    applyFilter();
  });
})();
