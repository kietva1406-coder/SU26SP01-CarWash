import { v4 as uuidv4 } from 'uuid';
import { getDb, initializeDatabase } from './db.js';

const seedDatabase = async () => {
  await initializeDatabase();
  const db = getDb();

  const customerId1 = uuidv4();
  const customerId2 = uuidv4();
  const userId1 = uuidv4();
  const userId2 = uuidv4();

  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Insert sample customers
      db.run(
        `INSERT INTO customers (id, name, email, phone, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [customerId1, 'Nguyễn Văn A', 'customer1@example.com', '0901234567']
      );

      db.run(
        `INSERT INTO customers (id, name, email, phone, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [customerId2, 'Trần Thị B', 'customer2@example.com', '0912345678']
      );

      // Insert sample users
      db.run(
        `INSERT INTO users (id, name, email, password, role, createdAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [userId1, 'Lý Quản Lý', 'manager@example.com', 'hashed_password_1', 'MANAGER']
      );

      db.run(
        `INSERT INTO users (id, name, email, password, role, createdAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [userId2, 'Nhân Viên C', 'staff@example.com', 'hashed_password_2', 'STAFF']
      );

      // Insert sample requests
      const requestId1 = uuidv4();
      const requestId2 = uuidv4();
      const requestId3 = uuidv4();

      db.run(
        `INSERT INTO requests (id, customerId, title, description, status, priority, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          requestId1,
          customerId1,
          'Yêu cầu rửa xe đặc biệt',
          'Muốn rửa xe với gói cao cấp',
          'PENDING',
          'HIGH',
        ]
      );

      db.run(
        `INSERT INTO requests (id, customerId, title, description, status, priority, createdAt, approvedBy, approvedAt)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'))`,
        [requestId2, customerId2, 'Yêu cầu vệ sinh nội thất', 'Cần vệ sinh toàn bộ nội thất xe', 'APPROVED', 'MEDIUM', userId1]
      );

      db.run(
        `INSERT INTO requests (id, customerId, title, description, status, priority, createdAt, approvedBy, approvedAt, notes)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'), ?)`,
        [
          requestId3,
          customerId1,
          'Yêu cầu bảo dưỡng định kỳ',
          'Bảo dưỡng định kỳ 6 tháng',
          'REJECTED',
          'LOW',
          userId1,
          'Ngoài phạm vi dịch vụ của chúng tôi',
        ]
      );

      db.run(
        `INSERT INTO task_assignments (id, requestId, assignedTo, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [uuidv4(), requestId2, userId2, 'PENDING'],
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✓ Database seeded successfully');
            console.log(`  - 2 customers created`);
            console.log(`  - 2 users created (1 manager, 1 staff)`);
            console.log(`  - 3 requests created (1 PENDING, 1 APPROVED, 1 REJECTED)`);
            console.log(`  - 1 task assignment created`);
            resolve();
          }
        }
      );
    });
  });
};

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  });
