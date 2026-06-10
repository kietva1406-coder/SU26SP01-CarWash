import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Đang quét sạch dữ liệu cũ phòng ngừa xung đột...');
  await prisma.auditLog.deleteMany({});
  await prisma.bookingHistory.deleteMany({});
  await prisma.checkOut.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👥 Đang chèn tài khoản nhân viên và khách hàng mẫu...');
  
  const staff = await prisma.user.create({
    data: {
      username: 'thanhphuoc',
      password: 'securepassword123',
      fullName: 'Hồ Thanh Phước (Staff)',
      role: 'STAFF'
    }
  });

  const customer = await prisma.customer.create({
    data: {
      fullName: 'Khách Hàng VIP 01',
      phoneNumber: '0988888888'
    }
  });

  console.log('🚗 Đang tạo các kịch bản kiểm thử dữ liệu...');

  // 1. Task hợp lệ để Check-In thành công (ASSIGNED)
  const bookingValid = await prisma.booking.create({ data: { customerId: customer.id, status: 'PENDING' } });
  await prisma.task.create({
    data: { id: '11111111-1111-1111-1111-111111111111', bookingId: bookingValid.id, staffId: staff.id, status: 'ASSIGNED' }
  });

  // 2. Lịch đặt đã bị hủy trước (CANCELED) -> Test lỗi BR-A14
  const bookingCanceled = await prisma.booking.create({ data: { customerId: customer.id, status: 'CANCELED' } });
  await prisma.task.create({
    data: { id: '22222222-2222-2222-2222-222222222222', bookingId: bookingCanceled.id, staffId: staff.id, status: 'ASSIGNED' }
  });

  // 3. Lịch đặt quá hạn (EXPIRED) -> Test lỗi BR-A13
  const bookingExpired = await prisma.booking.create({ data: { customerId: customer.id, status: 'EXPIRED' } });
  await prisma.task.create({
    data: { id: '33333333-3333-3333-3333-333333333333', bookingId: bookingExpired.id, staffId: staff.id, status: 'ASSIGNED' }
  });

  // 4. Task thợ đã rửa xong (COMPLETED) -> Test Check-Out thành công
  const bookingCompletedTask = await prisma.booking.create({ data: { customerId: customer.id, status: 'IN_PROGRESS' } });
  const taskReadyForCheckout = await prisma.task.create({
    data: { id: '44444444-4444-4444-4444-444444444444', bookingId: bookingCompletedTask.id, staffId: staff.id, status: 'COMPLETED' }
  });
  await prisma.checkIn.create({
    data: { taskId: taskReadyForCheckout.id, staffId: staff.id, checkinAt: new Date(Date.now() - 30 * 60 * 1000) }
  });

  console.log(`
  🚀 BƠM DỮ LIỆU MỒI THÀNH CÔNG! HÃY DÙNG CÁC ID DƯỚI ĐÂY ĐỂ COPIED VÀO POSTMAN TEST:
  ====================================================================================
  Mã Nhân Viên thực hiện (staffId): ${staff.id}
  
  1. ID Task Thử Nghiệm Ngon Lành (Check-In Success): 11111111-1111-1111-1111-111111111111
  2. ID Task Bị Hủy (Lỗi Chặn BR-A14):              22222222-2222-2222-2222-222222222222
  3. ID Task Quá Hạn (Lỗi Chặn BR-A13):             33333333-3333-3333-3333-333333333333
  4. ID Task Hoàn Thành Rửa (Check-Out Success):     44444444-4444-4444-4444-444444444444
  ====================================================================================
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });