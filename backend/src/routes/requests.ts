import { Router, Request, Response, NextFunction } from 'express';
import { requestService } from '../services/requestService.js';
import { createRequestSchema, updateRequestSchema, approveRequestSchema, rejectRequestSchema } from '../validation/request.js';
import { ApiResponse } from '../types.js';

const router = Router();

// Middleware for error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/requests - Create a new request
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        success: false,
        error: validation.error.errors[0].message,
      } as ApiResponse<null>);
    }

    const request = await requestService.createRequest(validation.data);

    res.status(201).json({
      success: true,
      data: request,
    } as ApiResponse<typeof request>);
  })
);

// GET /api/requests - Get all requests or filter by status
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    let requests;
    if (status && typeof status === 'string') {
      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status filter',
        } as ApiResponse<null>);
      }
      requests = await requestService.getRequestsByStatus(status as any);
    } else {
      requests = await requestService.getRequests();
    }

    res.json({
      success: true,
      data: requests,
    } as ApiResponse<typeof requests>);
  })
);

// GET /api/requests/:id - Get a specific request
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const request = await requestService.getRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      data: request,
    } as ApiResponse<typeof request>);
  })
);

// PUT /api/requests/:id - Update a request
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const validation = updateRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        success: false,
        error: validation.error.errors[0].message,
      } as ApiResponse<null>);
    }

    const request = await requestService.updateRequest(req.params.id, validation.data);

    res.json({
      success: true,
      data: request,
    } as ApiResponse<typeof request>);
  })
);

// DELETE /api/requests/:id - Delete a request
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const success = await requestService.deleteRequest(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      } as ApiResponse<null>);
    }

    res.json({
      success: true,
      message: 'Request deleted successfully',
    } as ApiResponse<null>);
  })
);

// PUT /api/requests/:id/approve - Approve a request
router.put(
  '/:id/approve',
  asyncHandler(async (req: Request, res: Response) => {
    const validation = approveRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        success: false,
        error: validation.error.errors[0].message,
      } as ApiResponse<null>);
    }

    // Assuming managerId comes from auth context
    const managerId = (req as any).userId || 'system';

    const request = await requestService.approveRequest(req.params.id, managerId, validation.data.notes);

    res.json({
      success: true,
      data: request,
      message: 'Request approved successfully. Task assignment created.',
    } as ApiResponse<typeof request>);
  })
);

// PUT /api/requests/:id/reject - Reject a request
router.put(
  '/:id/reject',
  asyncHandler(async (req: Request, res: Response) => {
    const validation = rejectRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(422).json({
        success: false,
        error: validation.error.errors[0].message,
      } as ApiResponse<null>);
    }

    // Assuming managerId comes from auth context
    const managerId = (req as any).userId || 'system';

    const request = await requestService.rejectRequest(req.params.id, managerId, validation.data.notes);

    res.json({
      success: true,
      data: request,
      message: 'Request rejected successfully.',
    } as ApiResponse<typeof request>);
  })
);

// GET /api/requests/status/:status - Get requests by status (path parameter version)
router.get(
  '/status/:status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED',
      } as ApiResponse<null>);
    }

    const requests = await requestService.getRequestsByStatus(status as any);

    res.json({
      success: true,
      data: requests,
    } as ApiResponse<typeof requests>);
  })
);

// GET /api/requests/customer/:customerId - Get requests by customer
router.get(
  '/customer/:customerId',
  asyncHandler(async (req: Request, res: Response) => {
    const requests = await requestService.getRequestsByCustomer(req.params.customerId);

    res.json({
      success: true,
      data: requests,
    } as ApiResponse<typeof requests>);
  })
);

export default router;
