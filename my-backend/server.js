import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { OAuth2Client } from 'google-auth-library';
import { createRequire } from 'module';
import { sequelize, User, File } from './models/index.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';

// Create require for ES modules
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

dotenv.config();

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DropSafe API',
      version: packageJson.version,
      description: 'Secure file storage and sharing API with end-to-end encryption',
      contact: {
        name: 'DropSafe Support',
        email: 'support@dropsafe.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.dropsafe.com/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the file'
            },
            originalName: {
              type: 'string',
              description: 'Original name of the file'
            },
            name: {
              type: 'string',
              description: 'Encrypted file name on the server'
            },
            type: {
              type: 'string',
              description: 'File extension without dot'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type of the file'
            },
            size: {
              type: 'number',
              description: 'File size in megabytes'
            },
            uploaded: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp when file was uploaded'
            },
            encrypted: {
              type: 'boolean',
              description: 'Whether the file is encrypted'
            },
            downloadUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to download the file'
            },
            previewUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to preview the file (if available)',
              nullable: true
            }
          }
        },
        FileUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'File uploaded and encrypted successfully.'
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                name: {
                  type: 'string',
                  example: 'document.pdf'
                },
                type: {
                  type: 'string',
                  example: 'pdf'
                },
                size: {
                  type: 'number',
                  example: 2.5
                },
                uploaded: {
                  type: 'string',
                  format: 'date-time'
                },
                encrypted: {
                  type: 'boolean',
                  example: true
                },
                downloadUrl: {
                  type: 'string',
                  example: '/api/files/download/123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message describing what went wrong'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Express setup
const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Serve API documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DropSafe API Documentation',
    customfavIcon: '/favicon.ico'
  })
);

// API routes
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve API specification
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle file upload errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Google Authentication - Already imported at the top of the file

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
    console.error('Error verifying Google token:', error);
    throw new Error(error.message || 'Invalid Google token');
  }
};

// Google authentication endpoint
app.post('/api/auth/google-auth', async (req, res) => {
  try {
    console.log('Google auth request received');
    console.log('Request body:', req.body);
    
    const { credential } = req.body;
    if (!credential) {
      console.error('No credential provided');
      return res.status(400).json({ success: false, error: 'No credential provided' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not set');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    console.log('Verifying Google token...');
    let payload;
    try {
      payload = await verifyGoogleToken(credential);
      console.log('Token verified, payload:', payload);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid Google token',
        details: error.message 
      });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

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

    const responseData = {
      success: true,
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      },
      token: jwtToken
    };

    console.log('Sending success response');
    res.json(responseData);
  } catch (error) {
    console.error('Unexpected error in Google auth:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred during authentication',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Sync Sequelize models
await sequelize.sync();

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

// Removed direct business logic from server.js. See fileRoutes.js
