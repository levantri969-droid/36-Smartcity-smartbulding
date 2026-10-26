/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * manager-monthly-report.js - Báo cáo năng lượng tháng & Nhận định AI (SV3 - Manager)
 */

// Dữ liệu mô phỏng 12 kỳ báo cáo
const monthlyReportsData = [
  {
    id: "rep-2026-09",
    month: "Tháng 09/2026",
    kwh: "286.420 kWh",
    cost: "518,1 triệu",
    co2: "136,8 tấn",
    statusLabel: "Đã duyệt",
    badgeBg: "#ECFDF5",
    badgeColor: "#047857",
    dotColor: "#10B981",
    aiReview: "Hiệu suất tăng 8,4%. Tầng 2 vẫn có phụ tải nền cao ngoài giờ; tiềm năng giảm thêm 18.600 kWh/tháng.",
    mgmtConclusion: "Duy trì lịch Chiller mới và triển khai khuyến nghị chiếu sáng Tầng 3 trong tháng 10."
  },
  {
    id: "rep-2026-08",
    month: "Tháng 08/2026",
    kwh: "312.150 kWh",
    cost: "565,3 triệu",
    co2: "149,1 tấn",
    statusLabel: "Đã duyệt",
    badgeBg: "#ECFDF5",
    badgeColor: "#047857",
    dotColor: "#10B981",
    aiReview: "Đỉnh nhiệt độ ngoài trời 38°C làm HVAC tiêu thụ kỷ lục. Đã áp dụng Pre-cooling giảm 4,2% chi phí giờ cao điểm.",
    mgmtConclusion: "Khen thưởng đội kỹ thuật vận hành linh hoạt hệ thống chiller mùa cao điểm."
  },
  {
    id: "rep-2026-07",
    month: "Tháng 07/2026",
    kwh: "305.800 kWh",
    cost: "553,8 triệu",
    co2: "146,2 tấn",
    statusLabel: "Đã duyệt",
    badgeBg: "#ECFDF5",
    badgeColor: "#047857",
    dotColor: "#10B981",
    aiReview: "Tỷ lệ sai lệch giữa mô hình dự báo AI và thực tế đạt 2,1% (độ chính xác 97,9%).",
    mgmtConclusion: "Chấp thuận mở rộng hệ thống IoT cảm biến tầng 8 & 9."
  },
  {
    id: "rep-2026-06",
    month: "Tháng 06/2026",
    kwh: "298.400 kWh",
    cost: "539,2 triệu",
    co2: "142,5 tấn",
    statusLabel: "Lưu kho",
    badgeBg: "#F1F5F9",
    badgeColor: "#64748B",
    dotColor: "#94A3B8",
    aiReview: "Bắt đầu mùa hè, nhu cầu làm mát tăng vọt 22% so với tháng 5.",
    mgmtConclusion: "Phê duyệt kế hoạch bảo trì bảo dưỡng toàn bộ 3 chiller trạm máy."
  }
];

let selectedReportId = "rep-2026-09";

document.addEventListener("DOMContentLoaded", () => {
  initReportSelection();
  initActionButtons();
  renderReportView();
});

// Tương tác chọn báo cáo
function initReportSelection() {
  const listContainer = document.getElementById("monthlyReportsList");
  if (!listContainer) return;

  listContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".report-list-item");
    if (!item) return;

    selectedReportId = item.dataset.reportId;
    renderReportView();
  });
}

// Khởi tạo các nút thao tác (Tạo mới, PDF, Excel)
function initActionButtons() {
  const btnCreate = document.getElementById("btnCreateReport");
  const btnPdf = document.getElementById("btnExportPdf");
  const btnExcel = document.getElementById("btnExportExcel");

  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      showToast("Khởi tạo báo cáo mới cho Tháng 10/2026...");
      setTimeout(() => {
        showToast("Đã tổng hợp dữ liệu 248 cảm biến cho kỳ Tháng 10!");
      }, 1000);
    });
  }

  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      showToast("Đang chuẩn bị trang in / Xuất PDF Báo cáo...");
      setTimeout(() => {
        window.print();
      }, 400);
    });
  }

  if (btnExcel) {
    btnExcel.addEventListener("click", handleExportExcel);
  }
}

// Render Master View
function renderReportView() {
  renderReportList();
  renderReportDetail();
}

function renderReportList() {
  const container = document.getElementById("monthlyReportsList");
  if (!container) return;

  container.innerHTML = monthlyReportsData.map(rep => {
    const isActive = rep.id === selectedReportId;
    const bg = isActive ? "var(--primary-green-light)" : "white";
    const border = isActive ? "1px var(--primary-green) solid" : "1px var(--border-color) solid";
    const iconColor = isActive ? "var(--primary-green)" : "var(--text-muted)";

    return `
      <div class="report-list-item" data-report-id="${rep.id}" style="padding: 12px; background: ${bg}; border-radius: 8px; border: ${border}; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: ${iconColor};">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div style="color: var(--text-dark); font-size: 14px; font-weight: 600;">${rep.month}</div>
        </div>
        <div class="badge" style="background: ${rep.badgeBg}; color: ${rep.badgeColor};">
          <span class="pill-dot" style="background: ${rep.dotColor}; width: 6px; height: 6px; border-radius: 50%;"></span>
          <span>${rep.statusLabel}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderReportDetail() {
  const rep = monthlyReportsData.find(r => r.id === selectedReportId) || monthlyReportsData[0];

  const detailTitle = document.getElementById("detailReportTitle");
  const detailKwh = document.getElementById("detailKwhVal");
  const detailCost = document.getElementById("detailCostVal");
  const detailCo2 = document.getElementById("detailCo2Val");
  const detailAiReview = document.getElementById("detailAiReviewText");
  const detailMgmt = document.getElementById("detailMgmtConclusionText");

  if (detailTitle) detailTitle.textContent = rep.month;
  if (detailKwh) detailKwh.textContent = rep.kwh;
  if (detailCost) detailCost.textContent = rep.cost;
  if (detailCo2) detailCo2.textContent = rep.co2;
  if (detailAiReview) detailAiReview.textContent = rep.aiReview;
  if (detailMgmt) detailMgmt.textContent = rep.mgmtConclusion;
}

// Xuất Excel/CSV
function handleExportExcel() {
  const rep = monthlyReportsData.find(r => r.id === selectedReportId) || monthlyReportsData[0];
  let csv = "\uFEFF";
  csv += `BÁO CÁO NĂNG LƯỢNG - ${rep.month}\n`;
  csv += `Tòa nhà: Green Tower (BTL-36) - Hà Nội\n`;
  csv += `Trạng thái: ${rep.statusLabel}\n\n`;
  csv += `Chỉ số,Giá trị\n`;
  csv += `Điện năng tiêu thụ,"${rep.kwh}"\n`;
  csv += `Chi phí tiền điện,"${rep.cost}"\n`;
  csv += `Phát thải CO2,"${rep.co2}"\n\n`;
  csv += `Đánh giá AI,"${rep.aiReview.replace(/"/g, '""')}"\n`;
  csv += `Kết luận BQL,"${rep.mgmtConclusion.replace(/"/g, '""')}"\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bao_Cao_${rep.id}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showToast(`Đã xuất báo cáo: Bao_Cao_${rep.id}.csv`);
}


// ============================================================
// Xuất báo cáo ra định dạng CSV (Điểm thưởng Mục IV Barem)
// ============================================================
function exportReportsToCSV() {
  const headers = ["ID", "Tháng", "Điện năng tiêu thụ", "Chi phí (VNĐ)", "Phát thải CO2", "Trạng thái", "Nhận định AI", "Kết luận BQL"];
  const rows = monthlyReportsData.map(r => [
    r.id,
    r.month,
    r.kwh,
    r.cost,
    r.co2,
    r.statusLabel,
    `"${(r.aiReview || '').replace(/"/g, '""')}"`,
    `"${(r.mgmtConclusion || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bao_Cao_Nang_Luong_SmartBuilding_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === "function") {
    showToast("✅ Đã xuất báo cáo CSV thành công!");
  } else {
    alert("✅ Đã xuất báo cáo CSV thành công!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("btnExportCSV");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportReportsToCSV);
  }
});
