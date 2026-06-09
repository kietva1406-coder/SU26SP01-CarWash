import { v4 as uuidv4 } from 'uuid';
import { Request, RequestStatus } from '../types.js';
import { CreateRequestInput, UpdateRequestInput } from '../validation/request.js';
import { getDb } from '../db/db.js';

export class RequestService {
  private db = getDb();

  async createRequest(input: CreateRequestInput): Promise<Request> {
    // Validate customer exists
    const customer = await this.getCustomer(input.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO requests (id, customerId, title, description, status, priority, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, input.customerId, input.title, input.description, 'PENDING', input.priority, now],
        function (err) {
          if (err) reject(err);
          else {
            resolve({
              id,
              customerId: input.customerId,
              title: input.title,
              description: input.description,
              status: 'PENDING',
              priority: input.priority,
              createdAt: now,
            });
          }
        }
      );
    });
  }

  async getRequests(status?: RequestStatus): Promise<Request[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM requests';
      const params: any[] = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY createdAt DESC';

      this.db.all(query, params, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getRequestById(id: string): Promise<Request | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM requests WHERE id = ?', [id], (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  async updateRequest(id: string, input: UpdateRequestInput): Promise<Request> {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      params.push(input.description);
    }
    if (input.priority !== undefined) {
      updates.push('priority = ?');
      params.push(input.priority);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }

    if (updates.length === 0) {
      const request = await this.getRequestById(id);
      if (!request) throw new Error('Request not found');
      return request;
    }

    params.push(id);

    return new Promise((resolve, reject) => {
      const query = `UPDATE requests SET ${updates.join(', ')} WHERE id = ?`;
      this.db.run(query, params, async (err) => {
        if (err) reject(err);
        else {
          const request = await this.getRequestById(id);
          if (!request) reject(new Error('Request not found after update'));
          else resolve(request);
        }
      });
    });
  }

  async deleteRequest(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM requests WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  async approveRequest(id: string, managerId: string, notes?: string): Promise<Request> {
    const now = new Date().toISOString();

    return new Promise(async (resolve, reject) => {
      this.db.run(
        `UPDATE requests SET status = ?, approvedBy = ?, approvedAt = ?, notes = ? WHERE id = ?`,
        ['APPROVED', managerId, now, notes || null, id],
        async (err) => {
          if (err) {
            reject(err);
          } else {
            await this.createTaskAssignment(id);
            const request = await this.getRequestById(id);
            if (!request) reject(new Error('Request not found after approval'));
            else resolve(request);
          }
        }
      );
    });
  }

  async rejectRequest(id: string, managerId: string, notes: string): Promise<Request> {
    const now = new Date().toISOString();

    return new Promise(async (resolve, reject) => {
      this.db.run(
        `UPDATE requests SET status = ?, approvedBy = ?, approvedAt = ?, notes = ? WHERE id = ?`,
        ['REJECTED', managerId, now, notes, id],
        async (err) => {
          if (err) reject(err);
          else {
            const request = await this.getRequestById(id);
            if (!request) reject(new Error('Request not found after rejection'));
            else resolve(request);
          }
        }
      );
    });
  }

  private async createTaskAssignment(requestId: string): Promise<void> {
    const taskId = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO task_assignments (id, requestId, assignedTo, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [taskId, requestId, 'system', 'PENDING', now, now],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRequestsByStatus(status: RequestStatus): Promise<Request[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM requests WHERE status = ? ORDER BY createdAt DESC',
        [status],
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getRequestsByCustomer(customerId: string): Promise<Request[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM requests WHERE customerId = ? ORDER BY createdAt DESC',
        [customerId],
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  private async getCustomer(customerId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

export const requestService = new RequestService();
