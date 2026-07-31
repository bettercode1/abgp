# Akhil Bhartiya Grahak Panchayat (ABGP) Portal

Official web portal for **Akhil Bhartiya Grahak Panchayat (ABGP)** — a multilingual, government-style platform for public outreach, membership, donations, petitions, and role-based admin operations.

**Live site:** [https://abgpindia.in](https://abgpindia.in)

---

## What this project delivers

### Public portal
- Home and informational pages (About, Activities, Membership, Media, Contact, FAQ, Constitution, Court Decisions, Gallery, and more)
- Multilingual support (English, Hindi, and additional Indian languages)
- Accessibility controls (font size, contrast, keyboard-friendly navigation)
- Responsive design for desktop and mobile
- Header actions: **Donate**, **Become a Member**, **Login**

### Membership
- New member registration with online payment (₹100)
- Existing member login / lookup
- Membership renewal flow
- Payment success and failure pages
- Membership records linked to payment status

### Donations
- Online donation form and Razorpay checkout
- Donation payment verification and status tracking
- Admin visibility of donation records

### Petitions
- Public petition listing and support
- Director create / update / delete petitions

### Complaints & content
- Public complaint submission
- Director-side complaint management
- Content management for news and related sections

### Role-based access
| Role | Entry | Purpose |
|------|--------|---------|
| **Admin (Director)** | `/login/admin` | Full dashboard — members, payments, donations, petitions, prants, reports, PDFs |
| **Prant** | `/login/prant` | Prant-scoped dashboard — relevant members, reports, allowed content |
| **Member** | `/login` | Existing member sign-in / renewal |

### Prant & Director operations
- Prant contacts and management
- Annual report submission (Prant) and review (Director)
- PDF upload with title/subject (Director) and controlled visibility
- Payment overview for memberships

---

## Tech overview

| Layer | Stack |
|-------|--------|
| Frontend | React 18, TypeScript, Vite, Material UI, i18next |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | Firebase Authentication (Director / Prant) |
| Payments | Razorpay (membership + donations) |

---

## Getting started (local)

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL access (or VPS DB via allowed network / tunnel)
- Configured `.env` files (see below)

### Install

```bash
npm install
cd backend && npm install && cd ..
```

### Environment

1. Copy examples and fill values:
   - Root: `.env.example` → `.env` (Firebase web config / optional `VITE_API_URL`)
   - Backend: `backend/.env.example` → `backend/.env` (Database, Firebase Admin, Razorpay)

2. For **local frontend**, leave `VITE_API_URL` unset so Vite proxies `/api` → `localhost:3001`.

3. Never commit `.env` or `backend/.env`. Secrets stay on the server / local only.

### Run

```bash
# Frontend + backend together
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

Useful scripts:
```bash
npm run build      # production frontend build
npm run preview    # preview production build
npm run lint
```

---

## Important routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/donate` | Donation form |
| `/login` | Member login |
| `/login?tab=register` | New member registration (**Become a Member**) |
| `/login/admin` | Director / Admin login |
| `/login/prant` | Prant login |
| `/panel` | Authenticated dashboard (Director / Prant) |
| `/payment/success` | Payment success |
| `/payment/failure` | Payment failure |

---

## Backend API (high level)

Base URL (local): `http://localhost:3001`

| Area | Paths |
|------|--------|
| Health | `/health`, `/api/payment/health`, `/api/donation/health` |
| Auth | `/api/auth/*`, member login/lookup |
| Payments | `/api/payment/*` |
| Donations | `/api/donation/*` |
| Petitions | `/api/petitions/*` |
| Prants | `/api/prants/*` |
| Content | `/api/content` |
| Complaints | `/api/complaints` |
| Annual reports | `/api/prant-annual-reports` |

Director/Prant protected routes require a Firebase Bearer token.

More database/API detail: see `backend/README.md`.

---

## Production deploy (Contabo VPS)

App path on server: `/home/deploy/apps/ABGP/abgp`

```bash
cd /home/deploy/apps/ABGP/abgp
git pull origin main
npm install          # if dependencies changed
npm run build
# Backend (if API code changed):
sudo pm2 restart abgp-backend
sudo pm2 save
```

Verify:
```bash
curl -s http://127.0.0.1:3001/health
curl -s http://127.0.0.1:3001/api/payment/health
```

---

## Project structure (simplified)

```
├── src/                 # Frontend (pages, components, layouts, i18n, theme)
├── backend/             # Express API, payments, donations, migrations
├── public/              # Static assets
├── package.json         # Frontend + concurrent dev scripts
└── .env.example         # Frontend env template
```

---

## Accessibility & browser support

- WCAG-oriented contrast, focus, and semantic structure
- Font size and language controls in the UI
- Supported: latest Chrome, Firefox, Safari, Edge

---

## License / ownership

Created for **Akhil Bhartiya Grahak Panchayat (ABGP)**.

---

## Notes

- Membership fee is configured server-side (default ₹100).
- Razorpay Key ID / Secret must be a matching Live pair on production.
- Admin and Prant accounts are managed in Firebase; do not store live passwords in this README.
