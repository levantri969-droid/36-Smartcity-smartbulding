/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * js/storage.js - Tầng Quản trị Dữ liệu & Lưu trữ dùng chung (Data Access Layer)
 * Kết nối mock-building.json với LocalStorage, đảm bảo CRUD thực chất và liên thông đa vai trò.
 */

const STORAGE_KEY = 'SMART_BUILDING_DB_V2';

const DB = {
  /**
   * Khởi tạo cơ sở dữ liệu: Nạp từ file mock-building.json nếu LocalStorage chưa có
   */
  async init() {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) {
      try {
        // Tự động tìm đường dẫn phù hợp dù đang đứng ở trang root (index.html) hay trong thư mục pages/
        const fetchPath = window.location.pathname.includes('/pages/') 
          ? '../assets/data/mock-building.json' 
          : './assets/data/mock-building.json';

        const res = await fetch(fetchPath);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        let text = await res.text();
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const data = JSON.parse(text);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ [DB] Đã nạp thành công dữ liệu mẫu phong phú từ mock-building.json vào LocalStorage.');
        return data;
      } catch (err) {
        console.warn('⚠️ [DB] Không thể tải mock-building.json qua fetch, sử dụng fallback mặc định:', err);
        return this.getAll();
      }
    }
    return this.getAll();
  },

  /**
   * Lấy toàn bộ dữ liệu hiện tại trong LocalStorage
   */
  getAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { zones: [], sensors: [], alerts: [], challenges: [], users: [], occupantPreferences: {} };
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Lỗi phân tích JSON DB:', e);
      return { zones: [], sensors: [], alerts: [], challenges: [], users: [], occupantPreferences: {} };
    }
  },

  /**
   * Lấy danh sách theo thực thể (zones, sensors, alerts, challenges, users)
   */
  get(entity) {
    const data = this.getAll();
    return data[entity] || [];
  },

  /**
   * Thêm mới một bản ghi (Create)
   */
  insert(entity, record) {
    const data = this.getAll();
    if (!data[entity]) data[entity] = [];
    
    // Đảm bảo có ID duy nhất và thời gian khởi tạo
    if (!record.id) {
      const prefix = entity.substring(0, 3).toUpperCase();
      record.id = `${prefix}-${Date.now().toString().slice(-4)}`;
    }
    record.createdAt = record.createdAt || new Date().toISOString();
    
    data[entity].unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.broadcast(entity, 'INSERT', record);
    return record;
  },

  /**
   * Cập nhật bản ghi theo ID (Update)
   */
  update(entity, id, fields) {
    const data = this.getAll();
    if (!data[entity]) return null;
    
    const index = data[entity].findIndex(item => item.id === id);
    if (index !== -1) {
      data[entity][index] = { ...data[entity][index], ...fields, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.broadcast(entity, 'UPDATE', data[entity][index]);
      return data[entity][index];
    }
    return null;
  },

  /**
   * Xóa bản ghi theo ID (Delete)
   */
  delete(entity, id) {
    const data = this.getAll();
    if (!data[entity]) return false;
    
    const initialLen = data[entity].length;
    data[entity] = data[entity].filter(item => item.id !== id);
    if (data[entity].length !== initialLen) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.broadcast(entity, 'DELETE', { id });
      return true;
    }
    return false;
  },

  /**
   * Khôi phục dữ liệu mẫu ban đầu (phục vụ Live Modification)
   */
  async resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    return await this.init();
  },

  /**
   * Phát sự kiện đồng bộ khi dữ liệu thay đổi
   */
  broadcast(entity, action, payload) {
    window.dispatchEvent(new CustomEvent('smartbuilding_db_change', {
      detail: { entity, action, payload }
    }));
  }
};

// Điểm thưởng Bonus (+0.5đ): Lắng nghe sự kiện Storage để đồng bộ thời gian thực đa tab / đa vai trò
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    console.log('🔄 [DB Sync] Dữ liệu vừa được cập nhật từ một Tab/Role khác! Tự động làm mới UI...');
    window.dispatchEvent(new CustomEvent('smartbuilding_db_sync'));
  }
});

// Tự động khởi chạy init khi script được load
DB.init();
