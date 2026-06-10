import express from "express";
import * as c from "../controllers/requestController.mjs";
import { requireManager, requireCustomer, requireStaff } from "../middleware/authMiddleware.mjs";
import { validateCreateRequest } from "../middleware/validateRequest.mjs";

const router = express.Router();

router.post("/", requireCustomer, validateCreateRequest, c.create);

router.get("/", requireManager, c.getAll);

router.get("/assigned", requireStaff, c.getAssigned);

router.get("/status/:status", requireManager, c.getByStatus);

router.get("/:id", c.getById);

router.put("/:id", requireCustomer, validateCreateRequest, c.update);

router.delete("/:id", requireCustomer, c.remove);

router.post("/:id/assign", requireManager, c.assign);

router.put("/:id/approve", requireManager, c.approve);

router.put("/:id/reject", requireManager, c.reject);

export default router;