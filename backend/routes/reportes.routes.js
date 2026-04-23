import express from "express";
import { crearReporte, getReportes, updateReporte, deleteReporte } from "../controllers/reportes.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roleAuth.js";

const router = express.Router();

// Aplicar middlewares a todas las rutas
router.use(verifyToken);
router.use(requireAdmin);

router.get("/", getReportes);
router.post("/", crearReporte);
router.put("/:id", updateReporte);
router.delete("/:id", deleteReporte);

export default router;