import express from "express";
import { crearReporte } from "../controllers/reportes.controller.js";

const router = express.Router();

router.post("/", crearReporte);

export default router;