import { Router } from 'express';
import multer from 'multer';
import {
	uploadMedia,
	getSignedMediaUrl,
} from '../controllers/media.controller';

const upload = multer(); // in-memory

const router = Router();

// Upload endpoint – returns { key, url }
router.post('/upload', upload.single('file'), uploadMedia);

// Signed URL endpoint – returns { url }
router.get('/sign', getSignedMediaUrl);

export default router;
