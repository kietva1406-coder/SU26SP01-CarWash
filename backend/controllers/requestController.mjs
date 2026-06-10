import * as service from "../services/requestService.mjs";

export const create = async (req, res) => {
    const data = {
        customerId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority || "MEDIUM"
    };

    const result = await service.createRequest(data);

    res.status(201).json(result);
};

export const getAll = async (req, res) => {
    const data = await service.getAllRequests();
    const parsed = data.map(r => ({
        ...r,
        assignedStaff: r.assignedStaffString ? r.assignedStaffString.split(',') : []
    }));
    res.json(parsed);
};

export const getById = async (req, res) => {
    const data = await service.getRequestById(req.params.id);
    res.json(data);
};

export const approve = async (req, res) => {
    await service.approveRequest(req.params.id, req.user.id);
    res.json({ message: "Approved" });
};

export const reject = async (req, res) => {
    await service.rejectRequest(
        req.params.id,
        req.user.id,
        req.body.notes
    );

    res.json({ message: "Rejected" });
};

export const update = async (req, res) => {
    try {
        const result = await service.updateRequest(
            req.params.id,
            req.body.title,
            req.body.description,
            req.body.priority || "MEDIUM",
            req.user.id
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await service.deleteRequest(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getByStatus = async (req, res) => {
    const data = await service.getRequestsByStatus(req.params.status.toUpperCase());
    res.json(data);
};

export const assign = async (req, res) => {
    try {
        await service.assignStaff(
            req.params.id,
            req.body.staffIds,
            req.user.id
        );
        res.json({ message: "Assigned successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAssigned = async (req, res) => {
    try {
        const data = await service.getRequestsAssignedToStaff(req.user.id);
        // data will have assignedStaffString, we parse it if we want to mimic frontend arrays or the frontend handles it
        const parsed = data.map(r => ({
            ...r,
            assignedStaff: r.assignedStaffString ? r.assignedStaffString.split(',') : []
        }));
        res.json(parsed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};