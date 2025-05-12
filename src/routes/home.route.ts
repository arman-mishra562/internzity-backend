import { Router } from 'express';
import { getCarouselData } from '../controllers/home.controller';

const router = Router();
router.get('/carousel', getCarouselData);
export default router;
