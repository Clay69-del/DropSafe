# DropSafe

## Overview
DropSafe is a secure, end-to-end encrypted cloud storage and file sharing platform. It enables users to upload, manage, and share files with strong privacy guarantees, leveraging modern encryption and authentication standards. The project consists of a React + Vite frontend and a Node.js/Express backend with Sequelize ORM and Google OAuth integration.

---

## Features
- **End-to-End Encryption:** Files are encrypted before storage; only users can decrypt their data.
- **Google OAuth & Email Authentication:** Secure login with Google or email/password.
- **File Upload & Management:** Upload, download, preview, and delete files (up to 50MB each).
- **User Dashboard:** Manage files, view storage usage, and update profile.
- **Profile Management:** Update user info and profile picture.
- **Password Reset:** Secure password reset via email.
- **Rate Limiting:** Protects against brute-force and abuse.
- **Responsive UI:** Modern, mobile-friendly interface with Bootstrap and custom styles.

---

## Tech Stack
- **Frontend:** React 19, Vite, React Router, Axios, React Icons, Bootstrap, Tailwind (via CDN)
- **Backend:** Node.js, Express, Sequelize (PostgreSQL/MySQL/SQLite), Multer, Passport.js, Google OAuth
- **Security:** AES-256-CBC encryption, JWT, bcrypt, helmet, CORS

---

## Project Structure
```
DropSafe/
  dropsafe-frontend/   # React + Vite frontend
  my-backend/          # Node.js/Express backend
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL/MySQL/SQLite (for production; SQLite works for dev)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/DropSafe.git
cd DropSafe
```

### 2. Setup the Backend
```bash
cd my-backend
npm install
# Copy and edit environment variables
cp .env.example .env
# Edit .env with your DB, JWT, and ENCRYPTION_KEY
# Run migrations (if using Sequelize CLI)
# npx sequelize-cli db:migrate
npm start
```

#### Backend Environment Variables (`my-backend/.env`)
- `PORT=5000`
- `DATABASE_URL=...` (or DB config variables)
- `JWT_SECRET=your_jwt_secret`
- `ENCRYPTION_KEY=your_64_char_hex_key` (use `openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `EMAIL_USER=...` (for password reset)
- `EMAIL_PASS=...`

### 3. Setup the Frontend
```bash
cd ../dropsafe-frontend
npm install
npm run dev
```

#### Frontend Environment Variables (`dropsafe-frontend/.env`)
- `VITE_BACKEND_URL=http://localhost:5000`
- `VITE_GOOGLE_CLIENT_ID=...`

---

## Usage
- Visit `http://localhost:5173` (or as shown in terminal)
- Register or login (Google or email)
- Upload, preview, download, and delete files from the dashboard
- Update your profile and password

---

## API Overview (Backend)
- `POST   /api/auth/register` — Register new user
- `POST   /api/auth/login` — Login with email/password
- `POST   /api/auth/google-auth` — Login with Google
- `POST   /api/auth/request-password-reset` — Request password reset
- `POST   /api/auth/reset-password` — Reset password
- `GET    /api/files` — List user files
- `POST   /api/files/upload` — Upload file (multipart/form-data)
- `GET    /api/files/view/:id` — View/decrypt file (inline or download)
- `DELETE /api/files/:id` — Delete file
- `GET    /api/user/profile` — Get user profile
- `PUT    /api/user/profile` — Update profile
- `POST   /api/user/profile-picture` — Upload profile picture

> All file and user routes require authentication (JWT in `Authorization: Bearer ...` header).

---

## Security Notes
- **Encryption:** Files are encrypted with AES-256-CBC using a per-file IV and a server-side key. Only authenticated users can access their files.
- **Authentication:** JWT tokens for session management; Google OAuth supported.
- **Rate Limiting:** Prevents brute-force and abuse.
- **Input Validation:** All user input is validated and sanitized.

---

## Deployment
- Frontend can be deployed to Vercel, Netlify, or any static host.
- Backend can be deployed to any Node.js server (Heroku, Render, etc.).
- Set environment variables for production in both frontend and backend.

---

## Contribution
1. Fork the repo and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## License
MIT License. See [LICENSE](LICENSE) for details.