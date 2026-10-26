# BẢNG PHÂN TÍCH VAI TRÒ & LUỒNG NGƯỜI DÙNG (ROLES & USER FLOWS)
**Học phần**: Phát triển ứng dụng Web cơ bản – CSE122  
**Dự án**: Green Tower SmartBuilding (BTL-36) • Nhóm 01  
**Quy chuẩn đánh giá**: Barem chấm điểm & Quy chế vấn đáp BTL CSE122 V2 (Thang điểm 10.0)

---

## 1. Danh sách 4 Vai trò Người dùng (User Roles) & Phân công Thành viên
Hệ thống **Green Tower SmartBuilding** thiết kế đa vai trò hoàn chỉnh (Multi-Role) gồm 4 vai trò tác nghiệp đặc thù, phân công theo lát cắt dọc (Vertical Slice) và trách nhiệm chéo (Cross-Responsibility) nghiêm ngặt theo quy chế BTL:

1. **Building Operator (Kỹ sư Vận hành Kỹ thuật tòa nhà)**
   - **Sinh viên đảm nhiệm**: **La Ngọc Quang** (La Ngọc Quang).
   - **Trách nhiệm dọc**: Phụ trách toàn diện phân hệ Operator từ Mockup Figma, HTML5 ngữ nghĩa, CSS3/Responsive, JavaScript xử lý sự kiện/DOM, tích hợp AI-2 đến kiểm thử.
   - **Trục trách nhiệm chéo**: Hệ thống thiết kế Design System & Biến CSS (`:root`, Dark Mode) + Thanh điều hướng chung (Navigation / Header Role Switcher) + Chuẩn tiếp cận Accessibility (A11y).
   - **Nhiệm vụ chính**:
     - Giám sát phụ tải điện năng và tình trạng thiết bị HVAC/chiếu sáng thời gian thực theo từng tầng/khu vực.
     - Tiếp nhận, phân loại và xử lý cảnh báo quá tải, bất thường cảm biến tức thời (Alert Center).
     - Điều phối các hành động cắt giảm tiết kiệm điện năng kết hợp mô hình AI gợi ý tự động.

2. **Office Occupant (Cư dân & Nhân viên Văn phòng)**
   - **Sinh viên đảm nhiệm**: **Lê Văn Trí** (Lê Văn Trí).
   - **Trách nhiệm dọc**: Phụ trách toàn diện phân hệ Occupant từ Mockup Figma, HTML5, CSS3, JavaScript tương tác, mô phỏng CRUD, tích hợp AI-1 đến kiểm thử.
   - **Trục trách nhiệm chéo**: Kiến trúc JavaScript + Tầng dữ liệu trung tâm & LocalStorage (`storage.js`, `mock-building.json`) + Chuẩn hóa luồng tương tác AI UX 6 bước.
   - **Nhiệm vụ chính**:
     - Theo dõi chỉ số năng lượng căn hộ, điểm tích lũy Eco cá nhân và bảng xếp hạng thi đua tiết kiệm toàn tòa nhà.
     - Tham gia các thử thách sống xanh (Eco Energy Challenges) để tích lũy điểm thưởng xanh và nâng cao thứ hạng thi đua.
     - Gửi phản hồi tiện nghi nhiệt độ/ánh sáng/chất lượng không khí trực tiếp kèm phân tích AI cá nhân hóa.

3. **Facility Manager (Nhà Quản lý Năng lượng & Vận hành Tòa nhà)**
   - **Sinh viên đảm nhiệm**: **Tô Hồng Anh** (Tô Hồng Anh).
   - **Trách nhiệm dọc**: Phụ trách phân hệ Manager từ thiết kế, giao diện bảng biểu KPI, thuật toán dự báo What-if đến báo cáo tổng hợp.
   - **Trục trách nhiệm chéo**: Kiểm thử Responsive đa thiết bị (320px–1920px) + Quản lý kho mã nguồn Git/GitHub (Branching, PR Review, Merge dev → main) + Triển khai Live Deployment & Đảm bảo chất lượng (QA).
   - **Nhiệm vụ chính**:
     - Theo dõi các chỉ số KPI cấp điều hành: Tổng tiêu thụ (kWh), Chi phí vận hành (VNĐ), Hệ số sử dụng năng lượng EUI ($kWh/m^2/năm$), Giảm phát thải $CO_2$.
     - Khai thác công cụ **AI-3 What-if Simulator** để dự báo kịch bản điều chỉnh nhiệt độ điều hòa và công suất chiếu sáng trước khi ban hành chính sách.
     - So sánh hiệu suất năng lượng đa Zone để phát hiện lãng phí và xem/xuất báo cáo định kỳ tháng.

4. **System Administrator (Quản trị viên Hệ thống Tòa nhà)**
   - **Sinh viên đảm nhiệm**: **Tô Hồng Anh** (Tô Hồng Anh phụ trách song song).
   - **Nhiệm vụ chính**:
     - Quản trị danh mục Khu vực / Phân vùng tòa nhà (Zone Management: Khối văn phòng, Khối kỹ thuật, Căn hộ, Bãi đỗ xe).
     - Quản trị mạng lưới cảm biến IoT (Sensor Management: Giám sát trạng thái Online/Offline, pin, ngưỡng cảnh báo).
     - Quản trị tài khoản, phân quyền vai trò (User Management & RBAC) và bảo mật hồ sơ toàn hệ thống.

---

## 2. Ma trận Phân quyền Tính năng (RBAC Matrix)

| Nhóm chức năng nghiệp vụ | Màn hình tương ứng | Building Operator<br>*(La Ngọc Quang)* | Office Occupant<br>*(Lê Văn Trí)* | Facility Manager<br>*(Tô Hồng Anh)* | System Admin<br>*(Tô Hồng Anh)* |
|:---|:---|:---:|:---:|:---:|:---:|
| **Đăng nhập & Chuyển đổi vai trò nhanh** | `pages/login.html` | Có | Có | Có | Có |
| **Hồ sơ cá nhân & Bảo mật tài khoản** | `pages/profile.html` | Có | Có | Có | Có |
| **Giám sát năng lượng thời gian thực** | `pages/operator-energy-monitor.html` | **Chính** | Không | Xem | Xem |
| **Trung tâm cảnh báo sự cố IoT** | `pages/operator-alert-center.html` | **Chính** | Không | Xem | Xem |
| **Điều phối tiết kiệm & AI-2 Dispatch** | `pages/operator-saving-actions.html` | **Chính** | Không | Không | Không |
| **Tổng quan căn hộ & Bảng xếp hạng cư dân**| `pages/occupant-dashboard.html` | Không | **Chính** | Không | Không |
| **Thử thách Eco & Tích lũy điểm xanh** | `pages/occupant-energy-challenge.html` | Không | **Chính** | Không | Không |
| **Phản hồi tiện nghi nhiệt & AI-1 phân tích**| `pages/occupant-comfort-feedback.html` | Xem | **Chính** | Không | Không |
| **KPI Năng lượng & AI-3 What-if Simulator**| `pages/manager-energy-kpis.html` | Không | Không | **Chính** | Xem |
| **So sánh năng lượng đa Zone trực quan** | `pages/manager-zone-comparison.html` | Không | Không | **Chính** | Xem |
| **Báo cáo tiêu thụ năng lượng tháng** | `pages/manager-monthly-report.html` | Không | Không | **Chính** | Xem |
| **Quản trị Zone (Thêm / Sửa / Xóa)** | `pages/admin-zone-management.html` | Không | Không | Xem | **Chính** |
| **Quản trị Cảm biến IoT (CRUD)** | `pages/admin-sensor-management.html` | Xem | Không | Không | **Chính** |
| **Quản trị Người dùng & Phân quyền (CRUD)**| `pages/admin-user-management.html` | Không | Không | Không | **Chính** |

---

## 3. Kiến trúc 3 Tính năng AI & Luồng tương tác 6 bước chuẩn AI UX
Theo Tiêu chí 6 của Barem CSE122, dự án triển khai đủ 3 tính năng AI đặc thù, tuân thủ nghiêm ngặt quy chuẩn 6 bước: **Input → Processing → Output → Explainability → User Control → Save/Apply** kèm kịch bản **AI Uncertainty / Failure UX**:

1. **AI-1: Trợ lý Đề xuất Tiện nghi Cá nhân hóa (Occupant Comfort AI Assistant)**
   - **Tích hợp tại**: `pages/occupant-comfort-feedback.html` (Lê Văn Trí đảm nhiệm).
   - **Đầu vào (Input)**: Mức nhiệt cảm nhận thực tế, độ sáng mong muốn, không gian làm việc.
   - **Xử lý (Processing)**: Animation phân tích AI 3 bước (Đọc lịch sử → Đối chiếu chuẩn ASHRAE 55 → Tính toán tối ưu).
   - **Đầu ra (Output)**: Thẻ gợi ý nhiệt độ điều hòa lý tưởng và kịch bản rèm/đèn.
   - **Giải thích (Explainability)**: Hiển thị thanh độ tin cậy (Confidence Score %), lý do đề xuất dựa trên mức chênh nhiệt độ ngoài trời và thói quen làm việc.
   - **Kiểm soát (Control)**: Nút "Chấp nhận áp dụng", "Tự tinh chỉnh", "Thử lại", "Bỏ qua".
   - **Lưu trữ (Save)**: Khi bấm áp dụng, kịch bản được lưu vào LocalStorage và phản ánh vào nhật ký tiện nghi.
   - **Failure UX**: Khi dữ liệu nhập mâu thuẫn (vừa quá lạnh vừa yêu cầu hạ sâu nhiệt độ), AI phát cảnh báo bất thường kèm khuyến nghị điều chỉnh thủ công.

2. **AI-2: Bộ điều phối Cắt giảm Năng lượng Tự động (Operator Saving Actions AI Dispatcher)**
   - **Tích hợp tại**: `pages/operator-saving-actions.html` (La Ngọc Quang đảm nhiệm).
   - **Đầu vào (Input)**: Mức công suất phụ tải đỉnh (Peak Load), khu vực ưu tiên và thời gian cao điểm.
   - **Xử lý (Processing)**: Thuật toán phân bổ công suất, tính toán giảm tải theo mức độ khẩn cấp.
   - **Đầu ra (Output)**: Danh mục 5 hành động điều phối cụ thể (giảm 15% quạt thông gió, tăng 1.5°C điều hòa hành lang, tắt 50% đèn trang trí...).
   - **Giải thích (Explainability)**: Thống kê chi tiết số kWh dự kiến cắt giảm, tác động đến người dùng và mức độ an toàn kỹ thuật.
   - **Kiểm soát (Control)**: Kỹ sư có quyền bật/tắt từng đề xuất trước khi ban hành lệnh thực thi.
   - **Lưu trữ (Save)**: Lệnh điều phối được kích hoạt, cập nhật trạng thái thời gian thực và ghi vào nhật ký vận hành.
   - **Failure UX**: Trạng thái "Thiếu dữ liệu cảm biến đo xa" hiển thị hộp thoại cảnh báo rủi ro kỹ thuật, yêu cầu kỹ sư chuyển sang chế độ điều phối thủ công an toàn.

3. **AI-3: Bộ mô phỏng Kịch bản Năng lượng What-if (Manager What-if Scenario Simulator)**
   - **Tích hợp tại**: `pages/manager-energy-kpis.html` (Tô Hồng Anh đảm nhiệm).
   - **Đầu vào (Input)**: Thanh trượt điều chỉnh nhiệt độ làm mát HVAC (22°C – 28°C) và tỷ lệ tiết giảm công suất chiếu sáng (0% – 50%).
   - **Xử lý (Processing)**: Mô hình hồi quy năng lượng tòa nhà ước lượng phụ tải tương quan.
   - **Đầu ra (Output)**: Dự báo điện năng tiết kiệm (kWh/ngày), chi phí tiết kiệm tương ứng (VNĐ/tháng) và tỷ lệ giảm phát thải $CO_2$.
   - **Giải thích (Explainability)**: Bảng phân rã công thức vật lý nhiệt và cơ sở định mức điện thương phẩm EVN.
   - **Kiểm soát (Control)**: Nút "Lưu kịch bản mục tiêu", "Khôi phục mặc định", "So sánh kịch bản".
   - **Lưu trữ (Save)**: Kịch bản được phê duyệt sẽ cập nhật vào chỉ tiêu KPI tháng lưu trong LocalStorage.

---

## 4. Các Luồng Nghiệp vụ Đầu - Cuối Xuyên suốt (End-to-End User Flows)

### Luồng 1: Điều phối Năng lượng & Cảnh báo Tức thời (Operator → Hệ thống)
1. **La Ngọc Quang** đăng nhập hệ thống với vai trò **Operator**.
2. Tại `operator-energy-monitor.html`, phát hiện Zone Tầng 5 có lượng điện tiêu thụ tăng vọt bất thường (vượt ngưỡng cảnh báo 85 kW).
3. Chuyển sang `operator-alert-center.html`, lọc cảnh báo mức độ **Khẩn cấp (Critical)**, kiểm tra mã thiết bị cảm biến phát sinh sự cố.
4. Điều hướng tới `operator-saving-actions.html`, sử dụng **AI-2 Saving Dispatcher** để sinh kế hoạch điều phối cắt giảm điện khẩn cấp.
5. Kiểm tra các bước giải thích, bấm **Thực thi lệnh điều phối**. Trạng thái được cập nhật tức thì vào hệ thống và đồng bộ dữ liệu thời gian thực.

### Luồng 2: Cư dân Tham gia Thử thách Eco & Tự động Nâng hạng Thi đua (Occupant Flow)
1. **Lê Văn Trí** đăng nhập vai trò **Occupant**, truy cập trang Tổng quan căn hộ `occupant-dashboard.html`.
2. Kiểm tra chỉ số tiêu thụ căn hộ P.1204, điểm Eco hiện tại (450 điểm) và vị trí xếp hạng thi đua toàn tòa nhà.
3. Nhấn banner AI gợi ý chuyển sang `occupant-energy-challenge.html` (Thử thách Eco).
4. Tham gia và hoàn thành thử thách "Tắt đèn khi rời phòng (+30 điểm)" hoặc "Tuần làm việc xanh (+100 điểm)".
5. Hệ thống kích hoạt sự kiện cộng điểm xanh tích lũy `smartbuilding_points_updated`.
6. Quay lại `occupant-dashboard.html`, điểm Eco được cộng dồn tự động. Bảng xếp hạng tự động tính toán lại và đưa căn hộ của **Lê Văn Trí** lên vị trí xếp hạng cao hơn mà không cần tải lại trang.

### Luồng 3: Ra Quyết định Kịch bản Năng lượng & Xuất Báo cáo (Manager Flow)
1. **Tô Hồng Anh** đăng nhập vai trò **Manager**, mở `manager-energy-kpis.html`.
2. Đánh giá các chỉ số EUI, điện năng tiêu hao tổng và chi phí phát sinh trong tháng.
3. Sử dụng thanh trượt tương tác **AI-3 What-if Simulator** để tính toán kịch bản nâng nhiệt độ điều hòa thêm 1°C và tiết giảm 20% đèn khu vực công cộng.
4. Chuyển sang `manager-zone-comparison.html` để so sánh mức tiêu thụ giữa 4 Zone (Khối VP, Khối Căn hộ, Khối KT, Bãi đỗ xe).
5. Mở `manager-monthly-report.html`, áp dụng bộ lọc dữ liệu theo kỳ báo cáo và nhấn in/xuất báo cáo định kỳ.

### Luồng 4: Quản trị Hạ tầng IoT & Đồng bộ Cư dân (Admin Flow)
1. **Tô Hồng Anh** chuyển đổi sang vai trò **Admin** qua thanh chuyển đổi nhanh Role Switcher trên Header.
2. Truy cập `admin-zone-management.html` để kiểm tra hoặc thêm mới phân vùng quản lý (Zone).
3. Truy cập `admin-sensor-management.html` để cấu hình, kiểm tra trạng thái hoạt động của 248 cảm biến IoT.
4. Mở `admin-user-management.html`, xem danh sách tài khoản. Khi cư dân **Lê Văn Trí** cập nhật hồ sơ cá nhân tại `profile.html`, thông tin tại danh sách quản trị của Admin tự động cập nhật đồng bộ tức thời nhờ tầng lưu trữ `storage.js` và CustomEvent `smartbuilding_db_sync`.
