import express from "express";
import { getAQI } from "../controllers/aqiController.js";


const router = express.Router();
router.get("/", getAQI);
export default router;