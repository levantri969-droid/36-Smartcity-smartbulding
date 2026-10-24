/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * manager-zone-comparison.js - So sánh công suất tiêu thụ giữa các Zone (SV3 - Manager)
 */

// Dữ liệu mô phỏng 24 giờ của các Zone (kW)
const zoneDataStore = [
  {
    id: "zone-1",
    name: "Tầng 1",
    sub: "Sảnh & Lễ tân",
    color: "#10B981",
    checked: true,
    points: [40, 38, 42, 55, 65, 78, 82, 75, 68, 52, 45, 41, 39], // 00h -> 24h
    peakTime: "14:00",
    peakVal: 82,
    variance: "6,4%"
  },
  {
    id: "zone-2",
    name: "Tầng 2",
    sub: "Căn-tin & Nghỉ ngơi",
    color: "#3B82F6",
    checked: true,
    points: [45, 96, 68, 50, 62, 70, 74, 69, 58, 54, 48, 46, 44],
    peakTime: "02:00",
    peakVal: 96,
    variance: "14,8%"
  },
  {
    id: "zone-server",
    name: "Server Room",
    sub: "Tầng 12 (Data Center)",
    color: "#F59E0B",
    checked: true,
    points: [88, 89, 90, 89, 91, 90, 92, 91, 90, 89, 90, 89, 88],
    peakTime: "12:00",
    peakVal: 92,
    variance: "3,2%"
  },
  {
    id: "zone-8",
    name: "Tầng 8",
    sub: "Hội nghị & Họp",
    color: "#8B5CF6",
    checked: false,
    points: [20, 18, 19, 22, 35, 48, 55, 52, 44, 30, 24, 21, 20],
    peakTime: "14:00",
    peakVal: 55,
    variance: "8,9%"
  },
  {
    id: "zone-base",
    name: "Khối đế",
    sub: "Khu tiện ích thương mại",
    color: "#EC4899",
    checked: false,
    points: [30, 28, 26, 32, 45, 58, 64, 60, 50, 42, 36, 32, 30],
    peakTime: "13:00",
    peakVal: 64,
    variance: "7,5%"
  }
];

const timeStamps = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"];

document.addEventListener("DOMContentLoaded", () => {
  initZoneSelectors();
  renderComparisonView();
});

// Tương tác chọn/bỏ chọn Zone
function initZoneSelectors() {
  const container = document.getElementById("zoneSelectorList");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const item = e.target.closest(".zone-check-item");
    if (!item) return;

    const zoneId = item.dataset.zoneId;
    const zone = zoneDataStore.find(z => z.id === zoneId);
    if (!zone) return;

    // Giữ ít nhất 1 zone được chọn
    const checkedCount = zoneDataStore.filter(z => z.checked).length;
    if (zone.checked && checkedCount <= 1) {
      if (window.showToast) {
        window.showToast("Cần giữ ít nhất 1 Zone để so sánh");
      }
      return;
    }

    zone.checked = !zone.checked;
    renderComparisonView();
  });
}

function renderZoneSelectors() {
  const container = document.getElementById("zoneSelectorList");
  if (!container) return;

  container.innerHTML = zoneDataStore.map(z => {
    const isSelected = z.checked;
    return `
      <div class="zone-check-item ${isSelected ? 'selected' : ''}" data-zone-id="${z.id}" style="${isSelected ? `border-color: ${z.color}; background: #FFFFFF;` : ''}">
        <div class="zone-check-box" style="${isSelected ? `background: ${z.color}; border: none;` : 'background: white; border: 1px #CBD5E1 solid;'}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="zone-check-label">${z.name} <span class="zone-check-sub">(${z.sub})</span></div>
      </div>
    `;
  }).join("");

  // Update mobile summary text
  const mobileSummaryText = document.getElementById("mobileSelectedZonesText");
  if (mobileSummaryText) {
    const checkedNames = zoneDataStore.filter(z => z.checked).map(z => z.name);
    mobileSummaryText.textContent = checkedNames.length > 0 ? checkedNames.join(", ") : "Chưa chọn Zone nào";
  }
}

// Render Master Comparison View
function renderComparisonView() {
  renderZoneSelectors();
  renderChart();
  renderSummaryStats();
}

// Render Biểu đồ đa tuyến SVG (Multi-line SVG Chart)
function renderChart() {
  const legendContainer = document.getElementById("chartLegendContainer");
  const svgLayer = document.getElementById("chartSvgLayer");
  const tooltip = document.getElementById("chartTooltipBubble");
  if (!svgLayer) return;

  const activeZones = zoneDataStore.filter(z => z.checked);

  // Render Legend
  if (legendContainer) {
    legendContainer.innerHTML = activeZones.map(z => `
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="width: 18px; height: 3px; background: ${z.color}; border-radius: 2px;"></div>
        <div style="color: var(--text-muted); font-size: 11px;">${z.name}</div>
      </div>
    `).join("");
  }

  // Toạ độ SVG: viewBox 0 0 1000 250
  const width = 1000;
  const height = 250;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maxKW = 120; // 0 -> 120 kW

  // Gridlines Y (40kW, 80kW, 120kW)
  let svgContent = `
    <!-- Background Gridlines -->
    <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" class="chart-grid-line" />
    <line x1="${paddingX}" y1="${paddingY + plotHeight * 0.333}" x2="${width - paddingX}" y2="${paddingY + plotHeight * 0.333}" class="chart-grid-line" />
    <line x1="${paddingX}" y1="${paddingY + plotHeight * 0.666}" x2="${width - paddingX}" y2="${paddingY + plotHeight * 0.666}" class="chart-grid-line" />
    <line x1="${paddingX}" y1="${paddingY + plotHeight}" x2="${width - paddingX}" y2="${paddingY + plotHeight}" stroke="#E2E8F0" stroke-width="1.5" />
  `;

  // Draw lines & dots
  activeZones.forEach(z => {
    const coords = z.points.map((val, idx) => {
      const x = paddingX + (idx / (z.points.length - 1)) * plotWidth;
      const y = paddingY + plotHeight - (val / maxKW) * plotHeight;
      return { x, y, val, time: timeStamps[idx] };
    });

    // Tạo SVG Path cong mềm
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    svgContent += `
      <path d="${pathD}" class="chart-path-line" stroke="${z.color}" stroke-width="3" />
    `;

    // Dots for tooltip interaction
    coords.forEach(pt => {
      svgContent += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#FFFFFF" stroke="${z.color}" stroke-width="2.5" class="chart-point-dot"
                data-zone="${z.name}" data-kw="${pt.val}" data-time="${pt.time}" />
      `;
    });
  });

  svgLayer.innerHTML = svgContent;

  // Add Hover tooltip listener via Event Delegation (Single delegated listener on svgLayer)
  if (!svgLayer._hasTooltipListener) {
    svgLayer._hasTooltipListener = true;
    svgLayer.addEventListener("mouseover", (e) => {
      const dot = e.target.closest(".chart-point-dot");
      if (!dot || !tooltip) return;
      const zone = dot.dataset.zone;
      const kw = dot.dataset.kw;
      const time = dot.dataset.time;
      tooltip.innerHTML = `<strong>${zone}</strong>: ${kw} kW lúc ${time}`;
      tooltip.style.display = "block";

      const rect = svgLayer.getBoundingClientRect();
      const dotX = parseFloat(dot.getAttribute("cx"));
      const dotY = parseFloat(dot.getAttribute("cy"));
      const pixelX = (dotX / width) * rect.width;
      const pixelY = (dotY / height) * rect.height;

      tooltip.style.left = `${pixelX}px`;
      tooltip.style.top = `${pixelY}px`;
    });

    svgLayer.addEventListener("mouseout", (e) => {
      const dot = e.target.closest(".chart-point-dot");
      if (dot && tooltip) {
        tooltip.style.display = "none";
      }
    });
  }
}

// Cập nhật thẻ tổng kết (Cao nhất & Ổn định nhất)
function renderSummaryStats() {
  const activeZones = zoneDataStore.filter(z => z.checked);
  if (activeZones.length === 0) return;

  // Tìm zone đạt công suất đỉnh cao nhất
  let maxZone = activeZones[0];
  activeZones.forEach(z => {
    if (z.peakVal > maxZone.peakVal) {
      maxZone = z;
    }
  });

  // Tìm zone ổn định nhất (độ lệch nhỏ nhất)
  let minVarZone = activeZones[0];
  activeZones.forEach(z => {
    const numVar = parseFloat(z.variance.replace(",", "."));
    const currentMin = parseFloat(minVarZone.variance.replace(",", "."));
    if (numVar < currentMin) {
      minVarZone = z;
    }
  });

  // Cập nhật DOM
  const peakValEl = document.getElementById("peakZoneValue");
  const peakSubEl = document.getElementById("peakZoneSub");
  if (peakValEl) peakValEl.textContent = `${maxZone.name} • ${maxZone.peakVal} kW`;
  if (peakSubEl) peakSubEl.textContent = `Lúc ${maxZone.peakTime} • Đỉnh công suất`;

  const stableValEl = document.getElementById("stableZoneValue");
  const stableSubEl = document.getElementById("stableZoneSub");
  if (stableValEl) stableValEl.textContent = minVarZone.name;
  if (stableSubEl) stableSubEl.textContent = `Độ lệch chỉ ${minVarZone.variance}`;
}
