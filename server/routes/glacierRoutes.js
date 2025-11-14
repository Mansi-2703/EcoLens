// server/routes/glacierRoutes.js
import express from 'express';
import { getGlacierData } from '../controllers/glacierController.js';

const router = express.Router();

// GET /api/glacier
router.get('/', getGlacierData);

export default router;
