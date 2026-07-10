import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";

const settingsRouter = express.Router();

settingsRouter.get("/",  getSettings);
settingsRouter.put("/",  adminAuthMiddleware, superAdminOnly, updateSettings);

export default settingsRouter;
