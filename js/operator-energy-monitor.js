/**
 * CSE122 - BTL-36 SmartBuilding
 * js/operator-energy-monitor.js
 * Trang: Operator Energy Monitor (Vanilla JS, de hieu cho sinh vien)
 *
 * Chuc nang:
 * 1. Bieu do 24 gio tuong tac (mock co dinh, khong random)
 * 2. Xem chi tiet khu vuc qua Modal (dong bang nut + Escape)
 * 3. Phat hien vuot nguong bang quy tac don gian (mo phong, khong phai AI that)
 * 4. Xu ly banner canh bao + nut "Da tiep nhan" + dieu huong Alert Center
 * 5. Luu trang thai tiep nhan vao localStorage (co fallback)
 */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. DU LIEU MOCK CO DINH (de sua, de giai thich khi van dap)
  // ------------------------------------------------------------

  // Nguong minh hoa cho tong toa nha (kW). Vuot nguong -> cot do.
  const BUILDING_THRESHOLD_KW = 85;

  // 24 moc gio: { hour: "00:00", kw: 28 }
  const HOURLY_POWER = [
    { hour: '00:00', kw: 28 }, { hour: '01:00', kw: 26 },
    { hour: '02:00', kw: 96 }, { hour: '03:00', kw: 30 },
    { hour: '04:00', kw: 32 }, { hour: '05:00', kw: 38 },
    { hour: '06:00', kw: 55 }, { hour: '07:00', kw: 68 },
    { hour: '08:00', kw: 74 }, { hour: '09:00', kw: 79 },
    { hour: '10:00', kw: 82 }, { hour: '11:00', kw: 84 },
    { hour: '12:00', kw: 80 }, { hour: '13:00', kw: 78 },
    { hour: '14:00', kw: 76 }, { hour: '15:00', kw: 72 },
    { hour: '16:00', kw: 70 }, { hour: '17:00', kw: 74 },
    { hour: '18:00', kw: 88 }, { hour: '19:00', kw: 92 },
    { hour: '20:00', kw: 90 }, { hour: '21:00', kw: 82 },
    { hour: '22:00', kw: 64 }, { hour: '23:00', kw: 44 }
  ];

  // 4 khu vuc hien thi tren trang.
  // thresholdKW la NGUONG MINH HOA de demo quy tac vuot nguong.
  const ZONES = [
    {
      id: 'tang-1', name: 'Tầng 1', currentKW: 42, avg7dKW: 44,
      thresholdKW: 60, cause: ''
    },
    {
      id: 'tang-2', name: 'Tầng 2', currentKW: 96, avg7dKW: 38,
      thresholdKW: 55, cause: 'HVAC tầng 2 chạy liên tục sau 22:00, nghi quên tắt + phụ tải tăng đột biến lúc 02:00.'
    },
    {
      id: 'server-room', name: 'Server Room', currentKW: 68, avg7dKW: 65,
      thresholdKW: 90, cause: ''
    },
    {
      id: 'office', name: 'Khối văn phòng', currentKW: 54, avg7dKW: 52,
      thresholdKW: 70, cause: ''
    }
  ];

  // Canh bao gan voi banner tren trang (mo phong quy tac).
  const ALERT = {
    id: 'ALT-T2-0200', zoneId: 'tang-2', zoneName: 'Tầng 2',
    time: '02:00 AM', measuredKW: 96, thresholdKW: 55,
    reason: 'Công suất vượt +74% so với ngưỡng minh họa (96/55 kW). Quy tắc mô phỏng, không phải AI thật.'
  };

  const STORAGE_KEY = 'smartbuilding_operator_alert_ALT-T2-0200';
  const CHART_MAX_PX = 112;
  const EVENING_START_HOUR = 18;

  // ------------------------------------------------------------
  // 2. TIEN ICH NHO (giu code gon, de bao tri)
  // ------------------------------------------------------------

  // Doc 1 phan tu, neu thieu thi tra null thay vi crash.
  function $(id) {
    return document.getElementById(id);
  }

  // Hien thong bao nho (toast). Dung textContent de tranh XSS.
  function showToast(message, type) {
    const box = $('toast');
    if (!box) return;
    box.textContent = message;
    box.className = 'toast show ' + (type === 'error' ? 'toast-error' : 'toast-ok');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      box.classList.remove('show');
    }, 2600);
  }

  // Quy tac mo phong: vuot nguong -> "Bất thường".
  function detectStatus(currentKW, thresholdKW) {
    if (typeof currentKW !== 'number' || typeof thresholdKW !== 'number') return 'Không rõ';
    return currentKW > thresholdKW ? 'Bất thường' : 'Bình thường';
  }

  // ------------------------------------------------------------
  // 3. CHUC NANG 1: BIEU DO 24 GIO TUONG TAC
  // ------------------------------------------------------------
  function renderChart() {
    const chartBox = $('powerChart');
    const infoBox = $('chartInfo');
    if (!chartBox) return;

    chartBox.innerHTML = '';
    chartBox.setAttribute('role', 'list');
    chartBox.setAttribute('aria-label', 'Biểu đồ công suất 24 giờ');

    HOURLY_POWER.forEach(function (point) {
      const hourNum = parseInt(point.hour.slice(0, 2), 10);
      const isOver = point.kw > BUILDING_THRESHOLD_KW;
      const isEvening = hourNum >= EVENING_START_HOUR;

      const bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'chart-bar chart-bar-btn'
        + (isOver ? ' bar-peak' : '')
        + (!isOver && isEvening ? ' b-blue' : '');
      bar.style.height = Math.max(14, Math.round(point.kw / 100 * CHART_MAX_PX)) + 'px';
      bar.setAttribute('role', 'listitem');
      // Tooltip khi hover (don gian, de hieu).
      bar.title = point.hour + ' - ' + point.kw + ' kW'
        + (isOver ? ' (vượt ngưỡng ' + BUILDING_THRESHOLD_KW + ' kW)' : '');
      bar.setAttribute('aria-label', bar.title);

      // Click 1 cot -> hien chi tiet duoi bieu do + tooltip cung cap nhat.
      bar.addEventListener('click', function () {
        chartBox.querySelectorAll('.chart-bar-btn').forEach(function (b) {
          b.classList.remove('is-selected');
          b.removeAttribute('aria-current');
        });
        bar.classList.add('is-selected');
        bar.setAttribute('aria-current', 'true');
        if (infoBox) {
          infoBox.textContent = 'Đã chọn ' + point.hour
            + ' — công suất ' + point.kw + ' kW'
            + (isOver ? ' — VƯỢT ngưỡng ' + BUILDING_THRESHOLD_KW + ' kW.'
                      : ' — trong ngưỡng ' + BUILDING_THRESHOLD_KW + ' kW.');
        }
      });

      chartBox.appendChild(bar);
    });

    if (infoBox && !infoBox.textContent) {
      infoBox.textContent = 'Nhấn một cột để xem giờ và công suất chi tiết. Cột đỏ = vượt ngưỡng '
        + BUILDING_THRESHOLD_KW + ' kW.';
    }
  }

  function tickClock() {
    const clock = $('liveClock');
    if (!clock) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = 'Live - ' + hh + ':' + mm;
  }

  // ------------------------------------------------------------
  // 4. CHUC NANG 2 + 3: MODAL CHI TIET + QUY TAC VUOT NGUONG
  // ------------------------------------------------------------
  let lastFocused = null;

  function openZoneModal(zone) {
    const overlay = $('zoneModal');
    if (!overlay || !zone) return;
    const status = detectStatus(zone.currentKW, zone.thresholdKW);

    $('zoneModalTitle').textContent = zone.name;
    $('zoneModalPower').textContent = zone.currentKW + ' kW';
    $('zoneModalAvg').textContent = zone.avg7dKW + ' kW';
    $('zoneModalThreshold').textContent = zone.thresholdKW + ' kW (minh hoa)';

    const statusEl = $('zoneModalStatus');
    statusEl.textContent = status;
    statusEl.className = 'pill ' + (status === 'Bất thường' ? 'bad' : 'ok');

    const causeEl = $('zoneModalCause');
    if (status === 'Bất thường') {
      causeEl.textContent = 'Nguyên nhân (mô phỏng): ' + (zone.cause || 'Vượt ngưỡng minh họa.');
    } else {
      causeEl.textContent = 'Trong ngưỡng minh họa, chưa ghi nhận nguyên nhân.';
    }

    lastFocused = document.activeElement;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = $('zoneModalClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeZoneModal() {
    const overlay = $('zoneModal');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function refreshZoneCards() {
    ZONES.forEach(function (zone) {
      const card = document.querySelector('[data-zone-card="' + zone.id + '"]');
      if (!card) return;
      const pill = card.querySelector('.pill');
      const val = card.querySelector('.zval');
      if (val) {
        val.innerHTML = '';
        val.appendChild(document.createTextNode(zone.currentKW + ' '));
        const unit = document.createElement('small');
        unit.textContent = 'kW';
        val.appendChild(unit);
      }
      if (pill) {
        const status = detectStatus(zone.currentKW, zone.thresholdKW);
        pill.className = 'pill ' + (status === 'Bất thường' ? 'bad' : 'ok');
        pill.innerHTML = '';
        const dot = document.createElement('i');
        pill.appendChild(dot);
        pill.appendChild(document.createTextNode(status));
      }
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Xem chi tiet ' + zone.name);
    });
  }

  function bindZoneCards() {
    ZONES.forEach(function (zone) {
      const card = document.querySelector('[data-zone-card="' + zone.id + '"]');
      if (!card || card.dataset.bound === '1') return;
      card.dataset.bound = '1';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        openZoneModal(zone);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openZoneModal(zone);
        }
      });
    });

    const overlay = $('zoneModal');
    const closeBtn = $('zoneModalClose');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', closeZoneModal);
    }
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = '1';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeZoneModal();
      });
    }
    if (!bindZoneCards._escBound) {
      bindZoneCards._escBound = true;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeZoneModal();
      });
    }
  }

  // ------------------------------------------------------------
  // 5. CHUC NANG 4 + 5: BANNER CANH BAO + LOCALSTORAGE
  // ------------------------------------------------------------

  // Doc trang thai tiep nhan, co fallback khi JSON loi.
  function readAckState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { acked: false };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { acked: false };
      return { acked: parsed.acked === true, at: parsed.at || '' };
    } catch (err) {
      showToast('Không đọc được trạng thái lưu cục bộ, dùng mặc định.', 'error');
      return { acked: false };
    }
  }

  function writeAckState(acked) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        alertId: ALERT.id,
        acked: acked,
        at: new Date().toISOString()
      }));
      return true;
    } catch (err) {
      showToast('Không lưu được trạng thái (bộ nhớ đầy hoặc bị chặn).', 'error');
      return false;
    }
  }

  function renderAlert() {
    const detailBtn = $('alertDetailBtn');
    const ackBtn = $('alertAckBtn');
    const statusEl = $('alertStatus');
    const detailBox = $('alertDetail');
    const state = readAckState();

    // Dien thong tin mo phong vao banner (khong cung HTML).
    const zoneEl = $('alertZone');
    const timeEl = $('alertTime');
    const msgEl = $('alertMsg');
    if (zoneEl) zoneEl.textContent = ALERT.zoneName;
    if (timeEl) timeEl.textContent = ALERT.time;
    if (msgEl) {
      msgEl.textContent = 'CẢNH BÁO KHẨN: AI phát hiện ' + ALERT.zoneName
        + ' công suất +150% lúc ' + ALERT.time;
    }

    if (statusEl) {
      statusEl.textContent = state.acked ? 'Đã tiếp nhận' : 'Chưa tiếp nhận';
      statusEl.className = 'pill ' + (state.acked ? 'ok' : 'bad');
    }
    if (ackBtn) {
      ackBtn.disabled = state.acked;
      ackBtn.textContent = state.acked ? 'Đã tiếp nhận' : 'Đã tiếp nhận';
    }
    if (detailBox && !detailBox.dataset.filled) {
      detailBox.dataset.filled = '1';
      detailBox.innerHTML = '';
      const rows = [
        ['Khu vực', ALERT.zoneName],
        ['Thời điểm', ALERT.time],
        ['Đo được', ALERT.measuredKW + ' kW'],
        ['Ngưỡng minh họa', ALERT.thresholdKW + ' kW'],
        ['Nguyên nhân', ALERT.reason]
      ];
      rows.forEach(function (r) {
        const div = document.createElement('div');
        div.className = 'alert-row';
        const b = document.createElement('b');
        b.textContent = r[0] + ': ';
        div.appendChild(b);
        div.appendChild(document.createTextNode(r[1]));
        detailBox.appendChild(div);
      });
    }

    if (detailBtn && !detailBtn.dataset.bound) {
      detailBtn.dataset.bound = '1';
      detailBtn.addEventListener('click', function () {
        if (!detailBox) return;
        const open = detailBox.classList.toggle('show');
        detailBtn.textContent = open ? 'Ẩn chi tiết' : 'Chi tiết';
        detailBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    if (ackBtn && !ackBtn.dataset.bound) {
      ackBtn.dataset.bound = '1';
      ackBtn.addEventListener('click', function () {
        // Cap nhat ca DATA + UI + STORAGE (khong chi doi mau).
        const ok = writeAckState(true);
        if (!ok) return;
        renderAlert();
        showToast('Đã ghi nhận tiếp nhận cảnh báo ' + ALERT.id + '.', 'ok');
      });
    }

    // Nut Alert Center: kiem tra file that truoc khi dieu huong.
    const centerLinks = document.querySelectorAll('[data-alert-center]');
    centerLinks.forEach(function (a) {
      if (a.dataset.bound === '1') return;
      a.dataset.bound = '1';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const url = a.getAttribute('href');
        fetch(url, { method: 'HEAD' }).then(function (res) {
          if (res.ok) {
            window.location.href = url;
          } else {
            showToast('Trang Alert Center chưa tồn tại (' + url + ').', 'error');
          }
        }).catch(function () {
          // file:// khong fetch duoc -> van dieu huong, neu loi trinh duyet se bao.
          window.location.href = url;
        });
      });
    });
  }

  // ------------------------------------------------------------
  // 6. KHOI TAO TRANG
  // ------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    try {
      renderChart();
    } catch (err) {
      const infoBox = document.getElementById('chartInfo');
      if (infoBox) infoBox.textContent = 'Không vẽ được biểu đồ. Hãy kiểm tra Console (F12).';
    }
    tickClock();
    setInterval(tickClock, 15000);
    refreshZoneCards();
    bindZoneCards();
    renderAlert();
  });

})();
