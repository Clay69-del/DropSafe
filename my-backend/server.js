import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';

dotenv.config();

// Encryption configuration
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');

if (key.length !== 32 || iv.length !== 16) {
  throw new Error('Encryption key must be 32 bytes and IV must be 16 bytes.');
}


const getContentType = (ext) => {
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
};
// Helper functions
const encryptText = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const encryptFile = async (inputPath, outputPath) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  
  await pipeline(input, cipher, output);
};
const decryptFile = async (inputPath, res) => {
  try {
    const stats = await fs.promises.stat(inputPath);
    if (stats.size > 50 * 1024 * 1024) { // 50MB limit for streaming
      throw new Error('File too large for streaming');
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const input = fs.createReadStream(inputPath);

    // Error handlers
    const handleError = (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.status(500).end();
      input.destroy();
      decipher.destroy();
    };

    input.on('error', handleError);
    decipher.on('error', handleError);
    res.on('close', handleError);

    // Set timeout
    res.setTimeout(30000, () => {
      handleError(new Error('Stream timeout'));
    });

    await pipeline(input, decipher, res);
  } catch (err) {
    console.error('Decryption failed:', err);
    if (!res.headersSent) {
      res.status(500).send(err.message);
    }
  }
};
// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads dir if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Express setup
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Google Authentication
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

// Google authentication endpoint
app.post('/api/auth/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'No credential provided' });
    }

    const payload = await verifyGoogleToken(credential);
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// MySQL connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Upload Route
app.post('/api/uploads', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const userEmail = req.body.userEmail;
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email is required' });
    }

    const encryptedEmail = encryptText(userEmail);
    const encryptedPath = path.join(uploadDir, `enc-${req.file.filename}`);

    await encryptFile(req.file.path, encryptedPath);
    fs.unlinkSync(req.file.path); // delete original file

    await db.execute(
      'INSERT INTO uploads (filename, encrypted_email, mimetype, size) VALUES (?, ?, ?, ?)',
      [`enc-${req.file.filename}`, encryptedEmail, req.file.mimetype, req.file.size]
    );

    res.json({
      success: true,
      message: 'File uploaded and encrypted successfully',
      file: { 
        filename: `enc-${req.file.filename}`, 
        size: req.file.size, 
        mimetype: req.file.mimetype 
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Upload failed', 
        message: error.message 
      });
    }
  }
});

// View file endpoint
app.get('/api/files/view/:filename', async (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).send('File not found');
    }

    const ext = path.extname(req.params.filename).toLowerCase();
    const contentType = getContentType(ext);
    
    res.setHeader('Content-Type', contentType);
    
    // Special handling for different file types
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`);
    }

    // Check file size to determine approach
    const stats = fs.statSync(filepath);
    if (stats.size < 10 * 1024 * 1024) { // 10MB threshold
      // Buffer approach for smaller files
      const encryptedData = fs.readFileSync(filepath);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      res.send(decrypted);
    } else {
      // Stream approach for larger files
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const input = fs.createReadStream(filepath);
      
      // Error handling
      input.on('error', (err) => {
        console.error('Input stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });
      
      decipher.on('error', (err) => {
        console.error('Decipher error:', err);
        if (!res.headersSent) res.status(500).end();
      });
      
      res.on('close', () => {
        console.log('Client closed connection prematurely');
        input.destroy();
        decipher.destroy();
      });
      
      await pipeline(input, decipher, res);
    }
    
  } catch (err) {
    console.error('View error:', err);
    if (!res.headersSent) {
      res.status(500).send('Error processing file');
    }
  }
});
// List files by user
app.post('/api/files/files', async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const encryptedEmail = encryptText(userEmail);

    const [rows] = await db.execute(
      'SELECT id, filename, mimetype, size, created_at FROM uploads WHERE encrypted_email = ?',
      [encryptedEmail]
    );

    const files = rows.map(row => ({
      id: row.id,
      name: row.filename,
      type: row.mimetype.split('/')[1] || row.mimetype,
    size: row.size < 1024 * 1024 
  ? `${(row.size / 1024).toFixed(2)} KB` 
  : `${(row.size / (1024 * 1024)).toFixed(2)} MB`,
      uploaded: row.created_at,
      encrypted: true
    }));

    res.json(files);

  } catch (err) {
    console.error('Fetching files failed:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: 'Something went wrong!' });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
});

app.delete('/api/files/delete/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Validate file ID
    if (!fileId || isNaN(fileId)) {
      return res.status(400).json({ success: false, error: 'Invalid file ID' });
    }

    // 1. Get file info from DB
    const [rows] = await db.execute(
      'SELECT filename, user_email FROM uploads WHERE id = ?',
      [fileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'File not found in database' });
    }

    const { filename, user_email } = rows[0];
    const filePath = path.join(uploadDir, filename);

    // 2. Delete file from filesystem
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`File deleted from filesystem: ${filename}`);
      } else {
        console.log(`File not found in filesystem: ${filename}`);
      }
    } catch (deleteError) {
      console.error(`Error deleting file from filesystem: ${deleteError.message}`);
      // Continue with database deletion even if file deletion fails
    }

    // 3. Delete from DB
    await db.execute('DELETE FROM uploads WHERE id = ?', [fileId]);
    console.log(`File record deleted from database: ${filename}`);

    res.json({ 
      success: true, 
      message: 'File deleted successfully',
      details: {
        filename,
        user_email
      }
    });

  } catch (error) {
    console.error('Delete file error:', error);
    const errorMessage = error.message || 'Failed to delete file';
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: errorMessage,
        details: {
          fileId: req.params.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
});
