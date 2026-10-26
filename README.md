# Green Tower SmartBuilding (BTL-36) • Nhóm 01 - CSE122

Dự án Bài tập lớn học phần **Phát triển ứng dụng Web cơ bản – CSE122**  
**Đơn vị đào tạo**: Khoa Công nghệ thông tin – Trường Đại học Thủy Lợi (TLU)  
**Giảng viên giảng dạy & chấm điểm**: ThS. Kiều Tuấn Dũng – ThS. Tạ Chí Hiếu  
**Đề tài**: **BTL-36: SmartBuilding - Hệ thống Giám sát & Quản trị Tòa nhà Thông minh**  
**Quy chuẩn đánh giá**: Tuân thủ 100% Barem Chấm Điểm & Quy Chế Vấn Đáp BTL CSE122 V2 (Thang điểm 10.0 + Bonus 1.0)

---

## 1. Thông tin Nhóm 01 & Phân công Lát cắt dọc (Vertical Slice)

Hệ thống được thiết kế theo kiến trúc đa vai trò hoàn chỉnh (Multi-Role) gồm 4 vai trò tác nghiệp thực tế. Mỗi thành viên đảm nhiệm trọn vẹn từ Mockup Figma, HTML5, CSS3, JavaScript tương tác, CRUD dữ liệu, tính năng AI UX 6 bước đến Video OBS và bảo vệ vấn đáp:

- **La Ngọc Quang**:
  - **Vai trò phụ trách**: **Building Operator (Kỹ sư Vận hành Kỹ thuật tòa nhà)**.
  - **Màn hình phụ trách**: Giám sát phụ tải năng lượng thời gian thực (`operator-energy-monitor.html`), Trung tâm xử lý cảnh báo sự cố IoT (`operator-alert-center.html`), Điều phối hành động tiết kiệm điện năng (`operator-saving-actions.html`).
  - **Tính năng AI**: **AI-2 Saving Actions Dispatcher** (Điều phối cắt giảm phụ tải khẩn cấp tự động chuẩn 6 bước).
  - **Trách nhiệm chéo (Cross-Responsibility)**: Chuẩn hóa hệ thống thiết kế Design System & Biến CSS (`:root`, Dark Mode đồng bộ), Thanh điều hướng chung (Sidebar, Navigation, Header Role Switcher) và Khả năng tiếp cận (Accessibility - A11y).

- **Lê Văn Trí**:
  - **Vai trò phụ trách**: **Office Occupant (Cư dân & Nhân viên Văn phòng)**.
  - **Màn hình phụ trách**: Tổng quan năng lượng căn hộ & Bảng xếp hạng cư dân (`occupant-dashboard.html`), Thử thách sống xanh Eco (`occupant-energy-challenge.html`), Phản hồi tiện nghi nhiệt & ánh sáng (`occupant-comfort-feedback.html`).
  - **Tính năng AI**: **AI-1 Comfort Assistant** (Đề xuất tối ưu hóa điều hòa và chiếu sáng cá nhân hóa chuẩn 6 bước kèm kịch bản AI Failure / Uncertainty UX).
  - **Trách nhiệm chéo (Cross-Responsibility)**: Kiến trúc JavaScript phân lớp, Tầng quản trị dữ liệu tập trung & LocalStorage (`storage.js`, `mock-building.json`), liên thông dữ liệu thời gian thực đa vai trò.

- **Tô Hồng Anh**:
  - **Vai trò phụ trách**: **Facility Manager (Nhà Quản lý Vận hành Năng lượng) & System Administrator (Quản trị viên Hệ thống)**.
  - **Màn hình phụ trách**: 
    - *Manager*: Bảng điều khiển KPI năng lượng cấp cao (`manager-energy-kpis.html`), So sánh hiệu suất năng lượng đa Zone (`manager-zone-comparison.html`), Báo cáo tiêu thụ điện định kỳ tháng (`manager-monthly-report.html`).
    - *Admin*: Quản trị danh mục phân vùng Zone (`admin-zone-management.html`), Quản trị mạng lưới 248 cảm biến IoT (`admin-sensor-management.html`), Quản trị người dùng & phân quyền RBAC (`admin-user-management.html`).
    - *Dùng chung*: Đăng nhập hệ thống đa vai trò (`login.html`), Hồ sơ cá nhân & bảo mật (`profile.html`), Trang lỗi (`404.html`).
  - **Tính năng AI**: **AI-3 What-if Scenario Simulator** (Mô phỏng kịch bản cắt giảm phụ tải dự báo tức thì theo thời gian thực).
  - **Trách nhiệm chéo (Cross-Responsibility)**: Đảm bảo thiết kế đáp ứng Responsive trên mọi kích thước màn hình (Mobile 320px–375px, Tablet 768px, Desktop 1024px+), Quản lý quy trình Git/GitHub (Branching, PR Review, Merge dev → main), Triển khai Live Deployment và Kiểm thử chất lượng (QA).

---

## 2. Cấu trúc Thư mục Dự án Chuẩn Hiện tại

Cấu trúc mã nguồn được tổ chức sạch sẽ, tường minh, phân tách rành mạch giữa các tầng Tài nguyên (Assets), Giao diện (Pages), Kiểu dáng (CSS), Nghiệp vụ (JS) và Tài liệu minh chứng (Docs):

```text
cse122-smartbuilding-team01/
├── .gitignore                          # Danh sách loại trừ tệp nhị phân và rác môi trường
├── README.md                           # Tài liệu tổng quan dự án, hướng dẫn chạy và thông tin nhóm
├── index.html                          # Landing Page giới thiệu tổng quan hệ thống tòa nhà Green Tower
├── 404.html                            # Trang thông báo lỗi 404 cấp thư mục gốc
├── assets/                             # Tài nguyên tĩnh của hệ thống
│   ├── data/
│   │   └── mock-building.json          # Cơ sở dữ liệu JSON mẫu phong phú (Building, KPIs, Zones, Sensors, Alerts, Challenges, Users)
│   └── images/                         # Hình ảnh minh họa tòa nhà, biểu tượng và avatar người dùng
│       ├── profilepic.webp             # Ảnh đại diện tài khoản chuẩn
│       ├── smartbuiding.jpg            # Ảnh phối cảnh công trình
│       └── smartbuilding.jpg           # Ảnh tổng thể kiến trúc tòa nhà thông minh
├── css/                                # Hệ thống bảng kiểu CSS3 & Design System đồng bộ
│   ├── style.css                       # Design System trung tâm (:root, Layout, Typography, Modal, Toast, Footer, Dark Mode)
│   ├── responsive.css                  # Tối ưu hóa đa thiết bị (Breakpoint Mobile 320px-768px, Tablet, Desktop)
│   ├── admin-manager.css               # Phong cách giao diện phân hệ Admin & Facility Manager
│   ├── responsive-admin-manager.css    # Responsive riêng cho bảng dữ liệu và form điều hành Admin/Manager
│   ├── operator-energy-monitor.css     # Giao diện Giám sát năng lượng thời gian thực (Operator)
│   ├── operator-alert-center.css       # Giao diện Trung tâm xử lý cảnh báo sự cố IoT (Operator)
│   ├── operator-saving-actions.css     # Giao diện Điều phối hành động tiết kiệm điện & AI-2 (Operator)
│   ├── user-pages.css                  # Giao diện chung cho phân hệ người dùng cư dân (Occupant)
│   ├── occupant-dashboard.css          # Giao diện Tổng quan căn hộ & Bảng xếp hạng cư dân (Occupant)
│   ├── occupant-energy-challenge.css   # Giao diện Thử thách sống xanh Eco (Occupant)
│   ├── occupant-comfort-feedback.css   # Giao diện Phản hồi tiện nghi nhiệt & AI-1 Assistant (Occupant)
│   ├── login-404.css                   # Định dạng riêng cho trang Đăng nhập và trang 404
│   └── responsive-login-404.css        # Responsive chuyên biệt cho form đăng nhập trên màn hình nhỏ
├── js/                                 # Mã nguồn JavaScript xử lý tương tác DOM, sự kiện & dữ liệu
│   ├── storage.js                      # Data Access Layer trung tâm (DB wrapper, LocalStorage CRUD, Event Broadcast)
│   ├── main.js                         # Điều hướng chung, Mobile Drawer toggle, Quản lý Dark/Light Mode, Toast toàn cục
│   ├── login.js                        # Xử lý xác thực đăng nhập, ghi nhớ phiên và phân quyền truy cập
│   ├── user.js                         # Tiện ích quản lý phiên người dùng và trạng thái đăng nhập
│   ├── profile.js                      # Quản lý hồ sơ cá nhân, đổi mật khẩu, đồng bộ đa vai trò vào DB
│   ├── ai-engine.js                    # Mô-đun toán học hỗ trợ phân tích và tính toán cho các mô hình AI
│   ├── operator-energy-monitor.js      # Biểu đồ và xử lý dữ liệu năng lượng thời gian thực (Operator)
│   ├── operator-alert-center.js        # Lọc, cập nhật trạng thái và xử lý cảnh báo IoT (Operator)
│   ├── operator-saving-actions.js      # Thuật toán điều phối năng lượng & tương tác 6 bước AI-2 (Operator)
│   ├── occupant-dashboard.js           # Bảng xếp hạng cư dân động, tự động tăng hạng khi có điểm xanh (Occupant)
│   ├── occupant-energy-challenge.js    # Nghiệp vụ tham gia thử thách Eco, tích lũy điểm xanh (Occupant)
│   ├── occupant-comfort-feedback.js    # Tương tác khảo sát tiện nghi & gợi ý AI-1 cá nhân hóa (Occupant)
│   ├── manager-kpis.js                 # Thuật toán mô phỏng What-if AI-3 và tính toán chỉ số KPI (Manager)
│   ├── manager-zone-comparison.js      # So sánh tương quan tiêu thụ năng lượng giữa các Zone (Manager)
│   ├── manager-monthly-report.js       # Bộ lọc kỳ báo cáo và hỗ trợ xuất/in dữ liệu in ấn chuẩn (Manager)
│   ├── admin-zone-management.js        # CRUD quản lý danh mục phân vùng Zone kèm lọc & Modal (Admin)
│   ├── admin-sensor-management.js      # CRUD quản lý 248 cảm biến IoT, kiểm tra pin & kết nối (Admin)
│   └── admin-user-management.js        # CRUD quản trị tài khoản người dùng, phân quyền RBAC (Admin)
├── pages/                              # Các màn hình chức năng của hệ thống (HTML5 Ngữ nghĩa)
│   ├── login.html                      # [Dùng chung] Trang đăng nhập phân quyền cho 4 vai trò
│   ├── profile.html                    # [Dùng chung] Trang hồ sơ người dùng & lịch sử hoạt động
│   ├── 404.html                        # [Dùng chung] Trang báo lỗi liên kết không tồn tại
│   ├── operator-energy-monitor.html    # [Operator - La Ngọc Quang] Giám sát năng lượng thời gian thực
│   ├── operator-alert-center.html      # [Operator - La Ngọc Quang] Trung tâm cảnh báo sự cố IoT
│   ├── operator-saving-actions.html    # [Operator - La Ngọc Quang] Điều phối tiết kiệm & AI-2 Dispatcher
│   ├── occupant-dashboard.html         # [Occupant - Lê Văn Trí] Tổng quan căn hộ & Bảng xếp hạng cư dân
│   ├── occupant-energy-challenge.html  # [Occupant - Lê Văn Trí] Thử thách sống xanh Eco & Điểm xanh
│   ├── occupant-comfort-feedback.html  # [Occupant - Lê Văn Trí] Phản hồi tiện nghi & AI-1 Comfort Assistant
│   ├── manager-energy-kpis.html        # [Manager - Tô Hồng Anh] KPI năng lượng & AI-3 What-if Simulator
│   ├── manager-zone-comparison.html    # [Manager - Tô Hồng Anh] So sánh mức tiêu thụ năng lượng đa Zone
│   ├── manager-monthly-report.html     # [Manager - Tô Hồng Anh] Báo cáo năng lượng định kỳ tháng
│   ├── admin-zone-management.html      # [Admin - Tô Hồng Anh] Quản lý danh mục phân vùng Zone
│   ├── admin-sensor-management.html    # [Admin - Tô Hồng Anh] Quản lý mạng lưới cảm biến IoT
│   └── admin-user-management.html      # [Admin - Tô Hồng Anh] Quản lý tài khoản người dùng & RBAC
├── docs/                               # Tài liệu học thuật và minh chứng quy trình BTL
│   ├── roles-and-features.md           # Bảng phân tích vai trò, ma trận RBAC & kịch bản User Flow
│   ├── screen-inventory.md             # Bảng kiểm kê màn hình 12 cột chuẩn theo quy chế BTL
│   ├── ai-usage-report.md              # Báo cáo minh bạch sử dụng AI (Phụ lục F Barem CSE122)
│   └── obs-evidence.md                 # Danh mục link video OBS minh chứng quá trình thực hiện
└── design/                             # Tài liệu thiết kế giao diện
    ├── figma-link.txt                  # Đường dẫn truy cập Figma Wireframe & Mockup công khai
    └── mockups/                        # Bản vẽ thiết kế mẫu, sơ đồ và kiến trúc
```

---

## 3. Công nghệ & Kỹ thuật Nổi bật trong Dự án
- **HTML5 Semantic**: 100% trang sử dụng đúng ngữ nghĩa `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<dialog>`, chuẩn W3C Validator, hỗ trợ screen-reader.
- **CSS3 Hiện đại**: Tổ chức kiến trúc Design Tokens biến CSS tập trung tại `:root`, kết hợp nhuần nhuyễn CSS Grid và Flexbox, **Chế độ Tối (Dark Mode)** đồng bộ chuẩn công thái học 100% giữa cả 4 vai trò (`#0B0F17` nền, `#151D2A` thẻ card).
- **Thiết kế Đáp ứng (Responsive)**: Tương thích hoàn hảo mọi kích thước màn hình từ điện thoại di động nhỏ nhất (320px–375px), máy tính bảng (768px) đến màn hình lớn (1024px–1920px). Hỗ trợ phóng to 200% không vỡ khung.
- **Khả năng tiếp cận (Accessibility - A11y)**: Hỗ trợ điều hướng bằng phím Tab trực quan với viền focus rõ ràng (`:focus-visible`), phím `Esc` đóng mở Modal/Drawer, đầy đủ nhãn `aria-label` và `<label for="...">`.
- **JavaScript Tinh giản (Vanilla ES6+)**: Lập trình hướng mô-đun, hàm xử lý an toàn chống XSS, cơ chế Debounce tìm kiếm từ khóa kết hợp bộ lọc đa tiêu chí, phân trang và sắp xếp.
- **Tầng dữ liệu Client-side trung tâm (`storage.js`)**: Quản lý CRUD thực chất trên `LocalStorage`, hỗ trợ đồng bộ dữ liệu thời gian thực đa tab / đa vai trò thông qua CustomEvent và sự kiện `storage`.
- **Trải nghiệm Sản phẩm AI (AI Product UX)**: Triển khai đủ 3 tính năng AI đặc thù (**AI-1 Comfort Assistant**, **AI-2 Saving Actions Dispatcher**, **AI-3 What-if Simulator**) tuân thủ nghiêm ngặt 6 bước tương tác có giải thích (Explainable) và có quyền kiểm soát (Controllable), kèm kịch bản xử lý ngoại lệ **AI Uncertainty / Failure UX**.
- **Footer Chuẩn hóa Đồng nhất**: Toàn bộ các trang của 4 vai trò sở hữu semantic footer đồng bộ 100% theo mẫu trang Quản trị Zone của Admin (hiển thị *Green Tower SmartBuilding* bên trái, *Nhóm 01 – CSE122 BTL-36* ở giữa và chấm trạng thái mạng *Online* bên phải).

---

## 4. Hướng dẫn Khởi chạy Cục bộ (Local Run)
1. Clone mã nguồn về máy:
   ```bash
   git clone https://github.com/levantri969-droid/36-Smartcity-smartbulding.git
   cd cse122-smartbuilding-team01
   ```
2. Mở trực tiếp tệp `index.html` hoặc `pages/login.html` trên bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Firefox, Safari).
3. Hoặc khởi chạy bằng extension **Live Server** trên VS Code để tối ưu hóa trải nghiệm tải dữ liệu mẫu qua Fetch API:
   - Chuột phải vào `index.html` -> Chọn **Open with Live Server** (cổng mặc định `http://127.0.0.1:5500`).
4. Khám phá nhanh 4 vai trò trên Header bằng thanh **Role Switcher** mà không cần đăng nhập lại:
   - Chuyển **Admin**: `admin-zone-management.html`
   - Chuyển **Manager**: `manager-energy-kpis.html`
   - Chuyển **Operator**: `operator-energy-monitor.html`
   - Chuyển **Occupant**: `occupant-dashboard.html`

---

## 5. Liên kết Minh chứng Dự án & Báo vệ
- **Link Thiết kế Figma công khai**: [Figma Green Tower SmartBuilding UI/UX](https://www.figma.com/design/GxyxWCHGyobvm2KCDMrdoJ/H%25C3%25ACnh-%25E1%25BA%25A3nh-tr%25E1%25BB%25B1c-quan?node-id=0-1&p=f&t=DneHZK8jYEBvCjtd-0)
- **Link Video Demo & Minh chứng OBS**:
  - Danh mục Video OBS chi tiết từng màn hình: [docs/obs-evidence.md](docs/obs-evidence.md)
- **Kho lưu trữ GitHub Repository**:
  - Kho chính thức Nhóm 01: [https://github.com/levantri969-droid/36-Smartcity-smartbulding](https://github.com/levantri969-droid/36-Smartcity-smartbulding)
