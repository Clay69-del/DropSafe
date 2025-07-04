import express from 'express';
import { upload, uploadFile, fetchFiles } from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/files/upload', protect, upload.single('file'), uploadFile); // ✅ Protect this route
router.get('/', protect, fetchFiles);

export default router;
