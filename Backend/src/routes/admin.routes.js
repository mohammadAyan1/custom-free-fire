import express from "express";
import {
    adminLogin,
    adminGetAll,
    getSquadDetails,
    adminUpdateStatus,
    sendEmailToSquad,
    getDashboardStats
} from "../controller/admin.controller.js";

import { adminProtect } from "../middleware/adminProtect.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes
router.get("/dashboard/stats", adminProtect, getDashboardStats);
router.get("/squads", adminProtect, adminGetAll);
router.get("/squad/:id", adminProtect, getSquadDetails);
router.put("/squad/:id", adminProtect, adminUpdateStatus);
router.post("/squad/:squadId/send-email", adminProtect, sendEmailToSquad);

// Bulk operations
router.post("/squads/bulk-action", adminProtect, async (req, res) => {
    // Implementation for bulk actions
});

export default router;