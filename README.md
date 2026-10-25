# cse122-smartbuilding-team01 - SmartBuilding BTL-36

Dự án Bài tập lớn học phần **CSE122 - Thiết kế và Lập trình Web**  
Đề tài: **BTL-36: SmartBuilding - Hệ thống Giám sát & Quản trị Tòa nhà Thông minh** 

## 1. Thông tin Nhóm 01
- **Nhóm thực hiện**: Team 01
- **Phân công thành viên**:
  - **SV1 (Engineer / Kỹ thuật viên)**: Giám sát vận hành thời gian thực, bảng điều khiển thiết bị, quản lý cảnh báo IoT.
  - **SV2 (Occupant / Cư dân & Nhân viên)**: Bảng điều khiển cá nhân hóa tiện nghi, điều khiển điều hòa/ánh sáng, thử thách tiết kiệm năng lượng.
  - **SV3 (Manager & Admin - Hiện hành)**: Giám sát hiệu suất năng lượng (KPIs), AI What-if Simulator, So sánh tiêu thụ theo Zone, Báo cáo năng lượng định kỳ, Quản trị hệ thống (Zones, Sensors, Users).

## 2. Cấu trúc thư mục dự án
```text
cse122-smartbuilding-team01/
├── .gitignore
├── README.md
├── index.html                    # Trang Landing Page giới thiệu hệ sinh thái SmartBuilding
├── docs/
│   ├── screen-inventory.md       # Bảng kiểm kê màn hình chuẩn BTL-36
│   ├── roles-and-features.md     # Ma trận phân quyền & kịch bản người dùng
│   ├── ai-usage-report.md        # Báo cáo cam kết và sử dụng AI (Phụ lục F)
│   └── obs-evidence.md           # Nhật ký link video minh chứng OBS
├── design/
│   ├── figma-link.txt            # Liên kết thiết kế Figma & Prototype
│   └── mockups/                  # Ảnh chụp màn hình bản vẽ / Wireframes
├── css/
│   ├── style.css                 # Hệ thống Design System & Layout chính
│   └── responsive.css            # Tối ưu giao diện đa màn hình (Mobile / Tablet)
├── js/
│   ├── main.js                   # Xử lý dùng chung (Sidebar toggle, Session, Logout)
│   ├── login.js                  # Cơ chế giả lập đăng nhập phân quyền đa vai trò
│   └── manager-kpis.js           # Xử lý tính toán cho AI-3 What-if Simulator
├── assets/
│   ├── data/
│   │   └── mock-building.json    # Cơ sở dữ liệu mẫu dạng JSON
│   └── images/                   # Hình ảnh minh họa, icon
└── pages/
    ├── login.html                # Trang Đăng nhập chung
    ├── manager-energy-kpis.html  # [SV3] Dashboard KPI & AI What-if Simulator
    ├── manager-zone-comparison.html # [SV3] So sánh năng lượng đa khu vực
    ├── manager-monthly-report.html  # [SV3] Báo cáo tổng hợp tiêu thụ điện
    ├── admin-zone-management.html   # [SV3] Quản trị danh mục Khu vực (Zones)
    ├── admin-sensor-management.html # [SV3] Quản trị Cảm biến IoT (Sensors)
    └── admin-user-management.html   # [SV3] Quản trị Người dùng & Phân quyền
```

## 3. Công nghệ sử dụng
- **Ngôn ngữ**: HTML5 Semantic, CSS3 (Modern Flexbox, Grid, CSS Variables), JavaScript (ES6+ Vanilla).
- **Thiết kế**: Mobile-First, Responsive Design System.
- **Dữ liệu**: Mock Data JSON (Client-side Simulation / Fetch API).

## 4. Hướng dẫn khởi chạy
1. Mở trực tiếp file `index.html` hoặc `pages/login.html` trên trình duyệt web.
2. Hoặc sử dụng extension **Live Server** trên VS Code để trải nghiệm tốt nhất các tính năng tải dữ liệu qua Fetch API.

## 5. Link figma
https://www.figma.com/design/GxyxWCHGyobvm2KCDMrdoJ/H%25C3%25ACnh-%25E1%25BA%25A3nh-tr%25E1%25BB%25B1c-quan?node-id=0-1&p=f&t=DneHZK8jYEBvCjtd-0

## 6. Link Youtube
https://youtu.be/eNDMW9z6fJY

## 7. Link github

- Cá nhân: https://github.com/hanhhong2208-gif/BaiGiuaKy_ToHongAnh_67CNTT1

- Nhóm: https://github.com/levantri969-droid/36-Smartcity-smartbulding
