import {
    getAllRequests,
    getRequestById,
    createRequest
} from "../services/requestService.js";

export const getAllRequestsController = async (req, res) => {
    try {
        const data = await getAllRequests();

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getRequestByIdController = async (req, res) => {
    try {
        const data = await getRequestById(req.params.id);

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const createRequestController = async (req, res) => {
    try {
        const data = await createRequest(req.body);

        res.status(201).json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};