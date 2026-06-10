import * as repo from "../repositories/requestRepository.mjs";
import { v4 as uuidv4 } from "uuid";

export const getAllRequests = () => repo.getAllRequests();

export const getRequestById = (id) => repo.getRequestById(id);

export const createRequest = async (data) => {
    const request = { id: uuidv4(), ...data };
    await repo.createRequest(request);
    return request;
};

export const approveRequest = async (id, managerId) => {
    await repo.approveRequest(id, managerId);
    // Mock trigger cho Backend 2
    console.log(`[TRIGGER] Creating task assignment for request ${id} in Backend 2...`);
};

export const rejectRequest = (id, managerId, notes) =>
    repo.rejectRequest(id, managerId, notes);

export const updateRequest = async (id, title, description, priority, customerId) => {
    const req = await repo.getRequestById(id);
    if (!req) throw new Error("Request not found");
    if (req.customerId !== customerId) throw new Error("Forbidden: Not your request");
    if (req.status !== 'PENDING') throw new Error("Cannot update request that is not PENDING");
    
    await repo.updateRequest(id, title, description, priority);
    return { ...req, title, description, priority };
};

export const deleteRequest = async (id, customerId) => {
    const req = await repo.getRequestById(id);
    if (!req) throw new Error("Request not found");
    if (req.customerId !== customerId) throw new Error("Forbidden: Not your request");
    if (req.status !== 'PENDING') throw new Error("Cannot delete request that is not PENDING");
    
    await repo.deleteRequest(id);
};

export const getRequestsByStatus = (status) => repo.getRequestsByStatus(status);

export const assignStaff = async (requestId, staffIds, managerId) => {
    const req = await repo.getRequestById(requestId);
    if (!req) throw new Error("Request not found");
    if (req.status !== 'APPROVED' && req.status !== 'ASSIGNED') {
        throw new Error("Only APPROVED or ASSIGNED requests can be assigned to staff");
    }
    await repo.assignStaffToRequest(requestId, staffIds, managerId);
    return { success: true };
};

export const getRequestsAssignedToStaff = (staffId) => repo.getRequestsAssignedToStaff(staffId);