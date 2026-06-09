import repo from "../repositories/requestRepository.mjs";
import { v4 as uuidv4 } from "uuid";

export const getAllRequests = async () => {
    return await repo.getAll();
};

export const getRequestById = async (id) => {
    return await repo.getById(id);
};

export const createRequest = async (data) => {
    const request = {
        id: uuidv4(),
        ...data
    };

    await repo.create(request);
    return request;
};