# BẢNG PHÂN TÍCH VAI TRÒ & LUỒNG NGƯỜI DÙNG (ROLES & USER FLOWS)

## 1. Danh sách Vai trò (User Roles)
1. **Quản trị viên hệ thống (Admin)**
   - Quản lý cấu hình tòa nhà, danh mục tầng/khu vực (Zones).
   - Quản lý hạ tầng cảm biến (Sensors IoT), giám sát tình trạng kết nối.
   - Quản lý danh sách người dùng, cấp phát vai trò và trạng thái tài khoản.
2. **Nhà quản lý vận hành / Năng lượng (Manager)**
   - Theo dõi các chỉ số KPI tiêu thụ điện năng tổng thể, hệ số phát thải CO2, chỉ số EUI.
   - Tương tác với mô hình **AI-3 What-if Simulator**: dự báo lượng điện và chi phí tiết kiệm khi thay đổi nhiệt độ hoặc công suất chiếu sáng.
   - So sánh trực quan tiêu thụ năng lượng giữa các Zone để phát hiện lãng phí.
   - Xuất và xem báo cáo tháng.
3. **Kỹ sư vận hành (Operator - SV1 phụ trách)**
   - Theo dõi trạng thái cảm biến thời gian thực, bảng điều khiển HVAC, xử lý cảnh báo quá tải/sự cố.
4. **Cư dân / Nhân viên văn phòng (Occupant - SV2 phụ trách)**
   - Giám sát chất lượng không khí, nhiệt độ phòng làm việc, tham gia phong trào giảm phát thải.

## 2. Ma trận phân quyền tính năng (RBAC Matrix)

| Chức năng | Admin | Manager | Operator | Occupant |
|:---|:---:|:---:|:---:|:---:|
| Đăng nhập & Đổi mật khẩu | Có | Có | Có | Có |
| Xem KPI Năng lượng & AI What-if Simulator | Có | **Chính** | Xem | Không |
| So sánh năng lượng đa Zone | Có | **Chính** | Xem | Không |
| Xem & Xuất báo cáo tháng | Có | **Chính** | Không | Không |
| Quản lý danh mục Zone (Thêm/Sửa/Xóa) | **Chính** | Xem | Không | Không |
| Quản lý Cảm biến Sensor (Thêm/Sửa/Xóa) | **Chính** | Xem | Không | Không |
| Quản lý Người dùng (Thêm/Sửa/Khóa) | **Chính** | Không | Không | Không |

## 3. Luồng người dùng chính (User Flows)
### Luồng 1: Manager đánh giá kịch bản AI What-if
1. Đăng nhập với vai trò **Manager**.
2. Điều hướng vào trang **Manager Energy KPIs**.
3. Xem các thẻ KPI hiện tại (Điện năng tiêu thụ, Chi phí, EUI, Cắt giảm CO2).
4. Tương tác thanh trượt trong bộ **AI-3 What-if Simulator**:
   - Tăng/giảm nhiệt độ mục tiêu HVAC (°C).
   - Điều chỉnh mức công suất đèn LED chiếu sáng (%).
5. Quan sát dự báo tức thì: Số kWh tiết kiệm/ngày, Số tiền dự kiến tiết kiệm (VNĐ), Tỷ lệ giảm tải lưới điện.

### Luồng 2: Admin thiết lập hạ tầng cảm biến
1. Đăng nhập với vai trò **Admin**.
2. Điều hướng vào trang **Admin Sensor Management**.
3. Lọc danh sách cảm biến theo Zone hoặc loại thiết bị.
4. Nhấn **Thêm cảm biến mới** -> Nhập thông tin (Mã, Tên, Zone, Tần suất đo).
5. Lưu và kiểm tra bảng dữ liệu cập nhật.
