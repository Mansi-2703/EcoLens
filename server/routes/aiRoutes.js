import express from "express";
import { getSuggestions, chatQuery } from "../controllers/aiController.js";
const router = express.Router();

router.post("/suggestions", getSuggestions);
router.post("/chat", chatQuery);

export default router;
