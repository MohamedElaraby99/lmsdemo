import { Router } from "express";
import { 
    registerDevice,
    checkDeviceAuthorization,
    getUserDevices,
    getAllUsersDevices,
    resetUserDevices,
    removeDevice,
    getDeviceStats
} from "../controllers/deviceManagement.controller.js";
import { isLoggedIn, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Routes for authenticated users
router.post("/register", isLoggedIn, registerDevice);
router.post("/check-authorization", isLoggedIn, checkDeviceAuthorization);

// Admin routes - require admin authentication
router.get("/users", isLoggedIn, requireAdmin, getAllUsersDevices);
router.get("/users/:userId/devices", isLoggedIn, requireAdmin, getUserDevices);
router.put("/users/:userId/reset", isLoggedIn, requireAdmin, resetUserDevices);
router.delete("/devices/:deviceId", isLoggedIn, requireAdmin, removeDevice);
router.get("/stats", isLoggedIn, requireAdmin, getDeviceStats);

export default router;
