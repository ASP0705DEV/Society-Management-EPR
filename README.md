# 🏢 AI Smartgate Estate OS (Gagellan Enterprise)

> **Next-Generation Society & Gated Community Operating System**  
> Integrated with Node.js Express, PostgreSQL 17, Prisma ORM, Socket.io Real-Time Comms, Argon2 Authentication, and Razorpay Payments.

---

## 🚀 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│              React 19 + TypeScript + Vite                │
│       Frontend (Tailwind CSS, Lucide, Socket.io Client)  │
└────────────────────────────┬─────────────────────────────┘
                             │ (Reverse Proxy / HTTP + WSS)
                             ▼
┌──────────────────────────────────────────────────────────┐
│             Node.js Express + Socket.io API              │
│       (Argon2 Auth, HttpOnly JWT, Twilio SMS, Razorpay)   │
└────────────────────────────┬─────────────────────────────┘
                             │ (Prisma 6.4 ORM)
                             ▼
┌──────────────────────────────────────────────────────────┐
│               PostgreSQL 17 Database                     │
│         19 Domain Models (Users, Gates, Visitors, etc.)   │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** v20+ or v24+
- **PostgreSQL 17** running locally on port `5432` with a database named `smartgate`

### 2. Environment Configuration
Ensure `.env` exists in the project root:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/smartgate?connection_limit=25&pool_timeout=20"
PORT=8080
JWT_SECRET="ai-smartgate-jwt-secret-key-2026"
NODE_ENV="development"

# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_SsI9IqT5Be0Iqp"
RAZORPAY_KEY_SECRET="KtnF0aMqZQ4dGndnAlrrC2fT"
VITE_RAZORPAY_KEY_ID="rzp_test_SsI9IqT5Be0Iqp"

# SMTP / Email OTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="saiprithvi0705@gmail.com"
SMTP_PASS="brytuohojhsfblwt"
SMTP_FROM="\"AI Smartgate Estate OS\" <saiprithvi0705@gmail.com>"
```

### 3. Database Migration & Push
```bash
npm run db:push
```

### 4. Running the Development Stack

**Frontend (Vite UI):**
```bash
npm run dev
# Running on http://localhost:3100
```

**Backend (Express API + WebSockets):**
```bash
npm run server
# Running on http://localhost:8080
```

> **Note on `EADDRINUSE: 8080`**:  
> If port `8080` is already in use by a background process, run this in PowerShell to free it before launching manually:
> ```powershell
> Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -Force
> ```

---

## 🔐 Default Seed Credentials

All passwords are encrypted with high-security **Argon2id** hashes.

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** (Gagellan) | `saiprithvi0705@gmail.com` | `SuperAdmin@2026` | Global metrics, customer societies, plans, tickets |
| **Society Admin** | `saiggs62@gmail.com` | `SocietyAdmin@2026` | Silverwood Heights management, residents, gates |
| **Resident** | `saiggs055@gmail.com` | `Resident@2026` | Flat A-101: Visitor approvals, parcels, notices |
| **Gatekeeper** | `saiggs739@gmail.com` | `GateGuard@2026` | North Gate desk: Visitor check-in, parcel drop |

---

## 📡 API Endpoints

### 🔐 Authentication & Session
- `POST /api/auth/login` — Sign in and receive HttpOnly JWT cookie (`smartgate_token`)
- `POST /api/auth/demo-login` — Instant role switch for testing
- `POST /api/auth/register-resident` — Onboarding with unit selection & pending admin approval
- `GET /api/auth/me` — Verify session and fetch authenticated user profile
- `POST /api/auth/logout` — Clear session cookies

### 📲 OTP & Telephony
- `POST /api/otp/send` — Dispatches 6-digit OTP via Twilio SMS or Gmail SMTP
- `POST /api/otp/verify` — Validates OTP within 5-minute expiry window

### 💳 Payments & Razorpay
- `POST /api/payments/create-order` — Generates server-side order with receipt
- `POST /api/payments/verify` — Validates client payment with HMAC-SHA256
- `POST /api/payments/webhook` — Real-time webhook handler for `payment.captured` & `order.paid`

### 📸 Photos & Media
- `POST /api/upload/photo` — Multer disk storage for visitor/guard badges (max 10MB)
- `GET /uploads/photos/:filename` — Static photo file delivery

### 📊 Real-Time & Monitoring
- `GET /api/metrics` — Prometheus metrics (uptime, DB status, sockets, HTTP durations)
- `GET /api/data/snapshot` — Complete synchronized snapshot of society data
- `POST /api/data/sync` — Bulk state sync

---

## 🧪 Automated Testing

Execute the Vitest test suite:
```bash
npm test
```
Tests cover:
- Argon2 password hashing & verification
- JWT session generation & decoding
- Twilio / OTP generation and expiry validation
- Razorpay HMAC-SHA256 signature calculation & fraud prevention
- Webhook HMAC-SHA256 payload verification

---

## 🚢 Production Deployment

### Option A: Docker Compose
Run the entire production stack (PostgreSQL + Express + Nginx Client):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Option B: Vercel (Frontend)
1. Import the repository on [Vercel](https://vercel.com/new).
2. Set Environment Variable:
   - `VITE_API_URL` = Your backend domain (e.g. `https://api.yourdomain.com`)
   - `VITE_RAZORPAY_KEY_ID` = `rzp_test_SsI9IqT5Be0Iqp`
3. Vercel automatically respects `vercel.json` rewrites for SPA routing.

---

## 📦 Git Repository
- GitHub Repository: [https://github.com/ASP0705DEV/Society-Management-EPR](https://github.com/ASP0705DEV/Society-Management-EPR)
