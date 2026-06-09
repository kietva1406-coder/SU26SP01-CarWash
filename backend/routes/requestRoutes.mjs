import express from "express";

import {
    getAllRequestsController,
    getRequestByIdController,
    createRequestController
} from "../controllers/requestController.mjs";

const router = express.Router();


router.post("/", createRequestController);


router.get("/", getAllRequestsController);


router.get("/:id", getRequestByIdController);

export default router;