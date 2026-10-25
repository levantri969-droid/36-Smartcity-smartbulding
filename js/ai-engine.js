/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * js/ai-engine.js - Động cơ AI Frontend & Chuẩn hóa Trải nghiệm AI UX 6 Bước
 * Hiện thực hóa 3 Tính năng AI đặc thù + Kịch bản AI Failure / Uncertainty UX
 */

const AIEngine = {
  /**
   * TÍNH NĂNG AI-1: Gợi ý Tối ưu Tiện nghi & Lịch trình Tiết kiệm Năng lượng (Dành cho Cư dân - SV2)
   * Tuân thủ chuẩn 6 bước: Input -> Processing -> Output -> Explainability -> User Control -> Save
   */
  async recommendComfort(params = {}) {
    const { currentTemp = 24, targetTemp = 25, outdoorTemp = 36, mode = 'eco' } = params;

    // 1. Kịch bản AI Failure / Uncertainty UX (Bắt buộc theo Barem Mục 6.3)
    if (targetTemp < 18 || targetTemp > 30) {
      // Giả lập độ trễ AI phân tích
      await new Promise(r => setTimeout(r, 600));
      return {
        success: false,
        confidence: 38,
        status: 'uncertainty',
        title: 'AI chưa đủ dữ liệu tin cậy để đề xuất',
        message: `Mức nhiệt độ cài đặt ${targetTemp}°C nằm ngoài giới hạn tối ưu sinh học (18°C – 30°C). Chênh lệch với nhiệt độ ngoài trời (${outdoorTemp}°C) quá lớn dễ gây sốc nhiệt hoặc quá tải máy nén.`,
        factors: [
          'Nhiệt độ ngoài trời hiện tại: 36°C (Nắng nóng)',
          'Tiêu chuẩn tiện nghi ASHRAE 55: 23.5°C – 26.0°C',
          'Độ tin cậy mô hình: 38% (Dưới ngưỡng an toàn 75%)'
        ],
        promptChips: [
          'Thử đề xuất ở mức 25°C',
          'Thử chế độ Eco Ban trưa',
          'Chuyển sang cấu hình thủ công'
        ]
      };
    }

    // 2. Trạng thái AI Processing bình thường (Mô phỏng xử lý 800ms)
    await new Promise(r => setTimeout(r, 800));

    // 3. Kết quả AI Output Card + Explainability (Độ tin cậy cao)
    const delta = outdoorTemp - targetTemp;
    const savingPercent = Math.min(25, Math.max(8, Math.round((targetTemp - 22) * 5)));
    const monthlySavingKwh = Math.round(savingPercent * 18.5);
    const monthlySavingVnd = (monthlySavingKwh * 2850).toLocaleString('vi-VN') + ' đ';

    return {
      success: true,
      confidence: 94,
      status: 'optimal',
      title: `Phương án Điều hòa & Chiếu sáng Tối ưu (${savingPercent}% Tiết kiệm)`,
      data: {
        recommendedTemp: targetTemp,
        recommendedFan: 'Auto (Chế độ tuần hoàn gió)',
        recommendedLight: mode === 'eco' ? 70 : 85,
        savingPercent: savingPercent,
        savingKwh: monthlySavingKwh,
        savingVnd: monthlySavingVnd,
        co2ReducedKg: Math.round(monthlySavingKwh * 0.72)
      },
      explainability: {
        why: `AI phân tích từ 3.500 bản ghi cảm biến kết hợp dự báo thời tiết Hà Nội (${outdoorTemp}°C). Khi duy trì phòng ở ${targetTemp}°C và giảm 15% đèn gần cửa kính, phòng vừa đạt chuẩn tiện nghi vừa giảm đáng kể công suất đỉnh (Peak Shaving).`,
        factors: [
          `Nhiệt độ ngoài trời ${outdoorTemp}°C phù hợp làm mát đệm`,
          'Ánh sáng tự nhiên qua vách kính đạt 420 Lux',
          'Độ tin cậy thuật toán dự báo: 94%'
        ]
      }
    };
  },

  /**
   * TÍNH NĂNG AI-2: Phát hiện Bất thường & Cảnh báo Rủi ro Cảm biến IoT (Dành cho Kỹ sư - SV1)
   */
  async detectSensorAnomalies(sensors = []) {
    await new Promise(r => setTimeout(r, 700));

    const anomalies = [];
    sensors.forEach(s => {
      // Phát hiện vượt ngưỡng hoặc mất kết nối
      if (s.status === 'disconnected') {
        anomalies.push({
          id: `ANOM-${s.id}`,
          sensorId: s.id,
          zone: s.zone,
          type: s.type,
          severity: 'HIGH',
          title: `Mất tín hiệu kết nối Gateway: ${s.id}`,
          confidence: 98,
          explainability: `Cảm biến ${s.id} không phản hồi tín hiệu Modbus RTU trong 4 chu kỳ quét liên tiếp. Nguy cơ lỏng cáp truyền thông hoặc nguồn Adapter 24VDC bị hỏng.`
        });
      } else if (s.value > s.threshold) {
        anomalies.push({
          id: `ANOM-${s.id}`,
          sensorId: s.id,
          zone: s.zone,
          type: s.type,
          severity: 'WARNING',
          title: `Chỉ số vượt ngưỡng an toàn: ${s.value} ${s.unit} (Ngưỡng: ${s.threshold} ${s.unit})`,
          confidence: 89,
          explainability: `Giá trị đo cao hơn ngưỡng cho phép ${((s.value - s.threshold) / s.threshold * 100).toFixed(1)}%. Cần kiểm tra hệ thống điều hòa phụ trợ tại ${s.zone}.`
        });
      }
    });

    return anomalies;
  },

  /**
   * TÍNH NĂNG AI-3: What-if Energy Simulator (Dành cho Quản lý - SV3)
   */
  async simulateWhatIf(reductionPercent = 12) {
    await new Promise(r => setTimeout(r, 600));

    const percent = parseFloat(reductionPercent);
    const baselineCost = 482.6; // triệu đồng
    const baselineCO2 = 128400; // kg CO2
    
    const savedCost = (baselineCost * (percent / 100)).toFixed(1);
    const savedCO2 = Math.round(baselineCO2 * (percent / 100));
    const savedKWh = Math.round(12450 * 30 * (percent / 100));

    return {
      success: true,
      confidence: 91,
      percent: percent,
      savedCostMillion: savedCost,
      savedCO2Kg: savedCO2,
      savedKWhTotal: savedKWh,
      explainability: `Dự báo dựa trên hệ số tải Chiller trung tâm (COP 4.8) và biểu giá điện bậc thang kinh doanh giờ cao điểm của EVN Hà Nội.`
    };
  }
};
