/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * occupant-dashboard.js - Quản lý dữ liệu Tổng quan căn hộ (Occupant SV2)
 * Barem: Tiêu chuẩn 5 (dữ liệu >= 15 bản ghi, search đa tiêu chí, localStorage), Tiêu chuẩn 6 (AI Eco UX)
 */

(function () {
  'use strict';

  // Seed Data: Bảng xếp hạng tiết kiệm năng lượng toàn tòa nhà (>= 15 căn hộ thực tế)
  const SEED_LEADERBOARD = [
    { rank: 1, room: 'P.1208', resident: 'Lê Minh', kwh: 6.8, savingPct: -18.4, points: 1240, floor: 12 },
    { rank: 2, room: 'P.0803', resident: 'Thu Hà', kwh: 7.1, savingPct: -15.9, points: 980, floor: 8 },
    { rank: 3, room: 'P.1102', resident: 'Gia Bảo', kwh: 7.4, savingPct: -13.2, points: 880, floor: 11 },
    { rank: 4, room: 'P.0504', resident: 'Minh Anh', kwh: 7.8, savingPct: -11.5, points: 820, floor: 5 },
    { rank: 5, room: 'P.1101', resident: 'Quang Huy', kwh: 8.3, savingPct: -9.1, points: 740, floor: 11 },
    { rank: 6, room: 'P.1204', resident: 'Phạm Mai Lan (Bạn)', kwh: 8.6, savingPct: -12.0, points: 450, isMe: true, floor: 12 },
    { rank: 7, room: 'P.0402', resident: 'Vũ Đức Thịnh', kwh: 8.9, savingPct: -7.5, points: 690, floor: 4 },
    { rank: 8, room: 'P.0701', resident: 'Đặng Kim Ngân', kwh: 9.2, savingPct: -6.8, points: 640, floor: 7 },
    { rank: 9, room: 'P.0905', resident: 'Trần Tuấn Kiệt', kwh: 9.5, savingPct: -5.4, points: 580, floor: 9 },
    { rank: 10, room: 'P.0602', resident: 'Nguyễn Bích Ngọc', kwh: 9.8, savingPct: -4.2, points: 520, floor: 6 },
    { rank: 11, room: 'P.1003', resident: 'Hoàng Quốc Việt', kwh: 10.1, savingPct: -3.0, points: 490, floor: 10 },
    { rank: 12, room: 'P.0304', resident: 'Lý Lan Hương', kwh: 10.4, savingPct: -2.1, points: 460, floor: 3 },
    { rank: 13, room: 'P.1302', resident: 'Đỗ Mạnh Cường', kwh: 10.9, savingPct: +1.2, points: 390, floor: 13 },
    { rank: 14, room: 'P.0501', resident: 'Trịnh Thanh Hằng', kwh: 11.2, savingPct: +2.8, points: 350, floor: 5 },
    { rank: 15, room: 'P.0203', resident: 'Phan Văn Hậu', kwh: 11.8, savingPct: +4.5, points: 310, floor: 2 },
    { rank: 16, room: 'P.0401', resident: 'Dương Thúy Diễm', kwh: 12.3, savingPct: +6.0, points: 270, floor: 4 }
  ];

  const LS_LEADERBOARD_KEY = 'smartbuild_occupant_leaderboard';

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getLeaderboardData() {
    try {
      const raw = localStorage.getItem(LS_LEADERBOARD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(LS_LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
    return [...SEED_LEADERBOARD];
  }

  function renderTable(data) {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: #94A3B8;">Không tìm thấy căn hộ phù hợp</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((item) => {
      let badgeClass = 'rank-other';
      if (item.rank === 1) badgeClass = 'rank-1';
      else if (item.rank === 2) badgeClass = 'rank-2';
      else if (item.rank === 3) badgeClass = 'rank-3';

      const savingClass = item.savingPct < 0 ? 'val-saving' : 'val-high';
      const savingSign = item.savingPct > 0 ? `+${item.savingPct}%` : `${item.savingPct}%`;
      const rowHighlight = item.isMe ? 'class="is-current-user"' : '';

      return `
        <tr ${rowHighlight}>
          <td><span class="rank-badge ${badgeClass}">${item.rank}</span></td>
          <td><strong>${escapeHTML(item.room)}</strong> · ${escapeHTML(item.resident)}</td>
          <td>${item.kwh.toFixed(1)} kWh</td>
          <td class="${savingClass}">${savingSign}</td>
          <td class="val-points">${item.points.toLocaleString('vi-VN')}</td>
        </tr>
      `;
    }).join('');
  }

  function setupFilters(allData) {
    const searchInput = document.getElementById('leaderboardSearch');
    const floorFilter = document.getElementById('floorFilter');

    function applyFilter() {
      const term = (searchInput ? searchInput.value.trim().toLowerCase() : '');
      const floor = (floorFilter ? floorFilter.value : '');

      const filtered = allData.filter(item => {
        const matchesTerm = !term ||
          item.room.toLowerCase().includes(term) ||
          item.resident.toLowerCase().includes(term);

        const matchesFloor = !floor || String(item.floor) === floor;

        return matchesTerm && matchesFloor;
      });

      renderTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (floorFilter) floorFilter.addEventListener('change', applyFilter);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const data = getLeaderboardData();
    renderTable(data);
    setupFilters(data);
  });

})();

