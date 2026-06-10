import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 1. Nạp cấu hình môi trường bảo mật từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware bắt buộc để Express đọc được dữ liệu dạng JSON từ Client gửi lên
app.use(express.json());

// 2. Khởi tạo Singleton Instance cho Prisma Client kết nối đâm thẳng xuống SQL Server
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Xuất câu lệnh SQL thực tế ra console phục vụ chấm điểm đồ án
});

// Hàm Tiện ích: Kiểm tra nhanh chuỗi gửi lên có phải định dạng UUIDv4 chuẩn hay không
const isInvalidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return !regex.test(uuid);
};

// ========================================================
// PHẦN 5: API THỰC HIỆN THỦ TỤC CHECK-IN (POST /api/checkin)
// Đáp ứng nghiêm ngặt luật: BR-A13, BR-A14, BR-A19, BR-A52
// ========================================================
app.post('/api/checkin', async (req, res) => {
  const { taskId, staffId, notes } = req.body;

  // Lớp Validation: Chặn đứng dữ liệu rác thiếu trường ngay tại cửa ngõ
  if (!taskId || !staffId) {
    return res.status(400).json({ success: false, message: "Lỗi dữ liệu: Trường taskId và staffId là bắt buộc không được để trống!" });
  }

  if (isInvalidUUID(taskId) || isInvalidUUID(staffId)) {
    return res.status(400).json({ success: false, message: "Lỗi định dạng: Mã taskId hoặc staffId phải tuân thủ định dạng chuẩn UUIDv4!" });
  }

  try {
    // Tìm kiếm Task kèm theo trạng thái đơn hàng Booking tổng (Eager Loading)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { booking: true }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Lỗi hệ thống: Không tìm thấy thông tin Task này trên SQL Server!" });
    }

    // [BR-A14] Chốt chặn: Nếu lịch hẹn đã bị khách hàng hủy, cấm check-in tiếp nhận xe
    if (task.booking.status === 'CANCELED') {
      return res.status(400).json({ success: false, message: "Nghiệp vụ thất bại [BR-A14]: Lịch đặt của xe này đã bị CANCELED từ trước!" });
    }

    // [BR-A13] Chốt chặn: Nếu lịch đặt đã quá giờ hệ thống chuyển sang EXPIRED, cấm check-in
    if (task.booking.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: "Nghiệp vụ thất bại [BR-A13]: Lịch hẹn đã quá hạn phục vụ và đã bị chuyển sang EXPIRED!" });
    }

    // Chốt chặn luồng Workflow tuần tự: Chỉ cho phép Check-In khi trạng thái hiện tại là ASSIGNED
    if (task.status !== 'ASSIGNED') {
      return res.status(400).json({ success: false, message: "Lỗi luồng: Công việc này không ở trạng thái ASSIGNED (Có thể đang rửa hoặc đã làm xong)!" });
    }

    // [BR-A19] Lấy mốc mốc thời gian thực của máy chủ để ghi nhận thời điểm xe vào bãi
    const serverCheckInTime = new Date();

    // THỰC THI KHỐI DATABASE TRANSACTION ĐỒNG BỘ TRẠNG THÁI SANG IN_PROGRESS
    const checkinRecord = await prisma.$transaction([
      // Hành động A: Tạo bản ghi CheckIn lưu vết
      prisma.checkIn.create({
        data: { taskId, staffId, notes, checkinAt: serverCheckInTime }
      }),
      // Hành động B: Đẩy trạng thái Task chi tiết sang IN_PROGRESS (Đang làm)
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' }
      }),
      // Hành động C: Đẩy trạng thái Booking tổng sang IN_PROGRESS để thông báo lên Dashboard hiển thị
      prisma.booking.update({
        where: { id: task.bookingId },
        data: { status: 'IN_PROGRESS' }
      }),
      // [BR-A52] Ghi nhật ký bảo mật hệ thống Audit Log
      prisma.auditLog.create({
        data: {
          userId: staffId,
          action: 'VEHICLE_CHECK_IN',
          details: `Nhân viên ID ${staffId} duyệt Check-In thành công cho Task ${taskId}.`
        }
      })
    ]);

    // Trả phản hồi thành công chuẩn RESTful API (201 Created)
    return res.status(201).json({
      success: true,
      message: "Làm thủ tục tiếp nhận Check-In xe vào tiệm thành công!",
      data: checkinRecord[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "SQL Server gặp sự cố hệ thống!", error: error.message });
  }
});

// ========================================================
// PHẦN 6: API THỰC HIỆN THỦ TỤC CHECK-OUT (POST /api/checkout)
// Đáp ứng nghiêm ngặt luật: BR-A20, BR-A28, BR-A30, BR-A42, BR-A52, BR-A57
// ========================================================
app.post('/api/checkout', async (req, res) => {
  const { taskId, staffId, notes } = req.body;

  // Lớp Validation đầu vào
  if (!taskId || !staffId) {
    return res.status(400).json({ success: false, message: "Lỗi dữ liệu: Trường taskId và staffId là bắt buộc không được để trống!" });
  }

  if (isInvalidUUID(taskId) || isInvalidUUID(staffId)) {
    return res.status(400).json({ success: false, message: "Lỗi định dạng: Mã taskId hoặc staffId phải tuân thủ định dạng chuẩn UUIDv4!" });
  }

  try {
    // Đọc thông tin Task kèm lịch sử CheckIn đầu vào lên để kiểm tra đối chiếu
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { checkIn: true }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Lỗi hệ thống: Không tìm thấy thông tin Task này trên SQL Server!" });
    }

    // [BR-A42] Chốt chặn: Thợ kỹ thuật phải bấm hoàn thành công việc rửa xe (COMPLETED) mới cho thu ngân làm lệnh ra
    if (task.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: "Nghiệp vụ thất bại [BR-A42]: Xe chưa được thợ kỹ thuật xác nhận hoàn thành (COMPLETED), cấm xuất bãi!" });
    }

    if (!task.checkIn) {
      return res.status(400).json({ success: false, message: "Lỗi tính toàn vẹn: Phương tiện này chưa hề có dữ liệu Check-In đầu vào!" });
    }

    // [BR-A20] Ghi nhận mốc thời gian xuất xưởng thực tế của Server
    const serverCheckOutTime = new Date();

    // [BR-A57] Chốt chặn logic toán học: Giờ ra tuyệt đối không được nhỏ hơn giờ vào
    if (task.checkIn.checkinAt > serverCheckOutTime) {
      return res.status(400).json({ success: false, message: "Xung đột logic [BR-A57]: Thời gian làm thủ tục Check-Out đang nhỏ hơn thời gian đã Check-In!" });
    }

    // SỬ DỤNG PRISMA ADVANCED INTERACTIVE TRANSACTION ĐỂ ĐÓNG LUỒNG HỆ THỐNG AN TOÀN TRUYỆT ĐỐI
    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // Bước A: [BR-A20] Khởi tạo bản ghi hoàn chỉnh ở bảng CheckOut
      const newCheckOut = await tx.checkOut.create({
        data: { taskId, staffId, notes, checkoutAt: serverCheckOutTime }
      });

      // Bước B: [BR-A30] Đổi trạng thái Booking đơn tổng sang COMPLETED để mở khóa kích hoạt luồng cộng điểm Loyalty ở Backend 2
      await tx.booking.update({
        where: { id: task.bookingId },
        data: { status: 'COMPLETED' }
      });

      // Bước C: [BR-A28] Đóng băng lưu vết vĩnh viễn thông tin vào kho lịch sử tĩnh BookingHistory phục vụ báo cáo tài chính
      await tx.bookingHistory.create({
        data: {
          bookingId: task.bookingId,
          status: 'COMPLETED',
          completedAt: serverCheckOutTime,
          notes: notes || 'Phương tiện hoàn tất chu trình rửa xe tự động thông minh và xuất xưởng.'
        }
      });

      // Bước D: [BR-A52] Ghi nhật ký vết hệ thống Audit Log phục vụ giám sát nội bộ chống gian lận dòng tiền
      await tx.auditLog.create({
        data: {
          userId: staffId,
          action: 'VEHICLE_CHECK_OUT',
          details: `Thu ngân ID ${staffId} duyệt thủ tục xuất bãi thành công cho Task ${taskId}. Trạng thái đơn tổng chuyển sang COMPLETED.`
        }
      });

      return newCheckOut;
    });

    return res.status(201).json({
      success: true,
      message: "Thực hiện thủ tục Check-Out nghiệm thu và đóng đơn đặt lịch thành công!",
      data: transactionResult
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Hệ thống tự động thực hiện lệnh HỦY (Rollback) toàn bộ chuỗi do phát sinh lỗi!", details: error.message });
  }
});

// Endpoint test nhanh trạng thái kết nối
app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, message: "Hệ thống máy chủ All-In-One của Backend 3 đang hoạt động xanh mượt!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server Backend 3 đang hoạt động tại địa chỉ: http://localhost:${PORT}`);
});