import express from 'express';
import { getMarine } from '../controllers/marineController.js';

const router = express.Router();

router.get('/', getMarine);

export default router;
