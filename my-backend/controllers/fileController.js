// File: controllers/fileController.js

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import db from '../config/db.js';

const UPLOAD_DIR = path.join('uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// AES Encryption Config
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const iv = crypto.randomBytes(16);

const encryptFile = (filePath, outputFilePath) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(outputFilePath);
  input.pipe(cipher).pipe(output);
};

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload Handler
const uploadFile = async (req, res) => {
  try {
    const user = req.user; // Assume user is authenticated via passport
    const file = req.file;

    const encryptedFileName = 'enc-' + file.filename;
    const encryptedFilePath = path.join(UPLOAD_DIR, encryptedFileName);

    // Encrypt the file
    encryptFile(file.path, encryptedFilePath);

    // Delete original file
    fs.unlinkSync(file.path);

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    await db.execute(
      'INSERT INTO uploaded_files (user_name, user_email, file_name, original_name, file_type, file_size_mb, file_path, encrypted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.name, user.email, encryptedFileName, file.originalname, path.extname(file.originalname).slice(1), fileSizeMB, encryptedFilePath, true]
    );

    res.status(200).json({ message: 'File uploaded and encrypted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed.' });
  }
};

// Fetch Handler
// Fetch Handler for backend (Node.js)
const fetchFiles = async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Query DB for files belonging to this user
    const [rows] = await db.execute(
      'SELECT id, original_name AS name, file_type AS type, file_size_mb AS size, uploaded_at AS uploaded, encrypted FROM uploaded_files WHERE user_email = ? ORDER BY uploaded_at DESC',
      [userEmail]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

export { upload, uploadFile, fetchFiles };
