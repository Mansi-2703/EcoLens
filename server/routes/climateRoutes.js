import express from "express";
import { getClimate } from "../controllers/climateController.js";

const router = express.Router();
router.get("/", getClimate);

export default router;
