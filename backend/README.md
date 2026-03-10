# ABGP Backend – Database & API

## 1. Database setup (PostgreSQL)

Run in order:

### 1. Create tables

```bash
psql -U postgres -d your_database_name -f schema.sql
```

Or from any SQL client (e.g. pgAdmin, DBeaver): open `schema.sql` and execute.

**Creates:**

- **users** – Auth (email, password_hash, role, prant, name, contact_number for prants)
- **content** – Director/Prant content per section (images, texts, videos)
- **members** – Panel members list (new/existing)
- **complaints** – Complaint form submissions
- **join_registrations** – Petition “Register / Join Us” form

### 2. Seed 38 prant logins + 1 director

```bash
psql -U postgres -d your_database_name -f seed-prants.sql
```

**Creates:**

- **1 director:** `director@abgpindia.com` — password: **Director-ABGP-2025**
- **38 prant accounts:** each with a **unique** password

**Password pattern (easy to remember):**

- Director: `Director-ABGP-2025`
- Prants: `Prant-<prantKey>-2025` (e.g. `Prant-gujarat-2025`, `Prant-maharashtraKonkan-2025`)

**Full list:** See **`prant-passwords.csv`** (email, password, prant) for all 39 accounts. Keep this file secure; do not commit to public repos.

---

## Prant keys (match frontend)

The `prant` column in `users` uses the same keys as `src/lib/prantKeys.ts`:

andhra, arunachal, assam, biharDakshin, biharUttar, chattisgarh, delhi, gujarat, haryana, himachal, jammuKashmir, jharkhand, karnataka, kerala, mpMadhyabharat, mpMahakaushal, mpMalwa, maharashtraDevgiri, maharashtraKonkan, madhyaMaharashtra, maharashtraVidharbh, meghalaya, odishaPashchim, odishaPurba, punjab, rajasthanChittor, rajasthanJaipur, rajasthanJodhpur, sikkim, tamilnaduDakshin, tamilnaduUttar, telangana, upAvadh, upBraj, upGoraksha, upKanpur, upKashi, upMeerut, uttarakhand

---

## Regenerating seed with different passwords

To regenerate `seed-prants.sql` and `prant-passwords.csv` (e.g. after changing the password pattern in the script):

```bash
cd backend && npm run generate-seed
```

Edit `scripts/generate-seed.js` to change the password pattern, then run the command again.

---

## Changing a password (bcrypt)

To generate a new hash (Node.js with bcrypt installed):

```js
const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync('YourNewPassword', 10));
```

Replace the hash in `seed-prants.sql` before running, or update `users.password_hash` in the database after seeding.

---

## 3. API server (dashboard support)

The API powers the dashboard: login, members, complaints, content, and prant list (name/number, change password).

### Setup

1. Copy env and set variables:
   ```bash
   cp .env.example .env
   # Edit .env: DATABASE_URL, and for Supabase auth (required for /api/prants):
   #   SUPABASE_URL, SUPABASE_JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY
   # Get JWT Secret: Supabase Dashboard → Project Settings → API → JWT Secret
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   API runs at `http://localhost:3001` (or `PORT` from `.env`).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Body: `{ email, password }` → `{ user, token }` |
| GET | `/api/members` | Director | List members |
| POST | `/api/members` | Director | Add member; body: `{ email, name?, role?, prant? }` |
| DELETE | `/api/members/:id` | Director | Delete member |
| GET | `/api/complaints` | Director | List complaints; query: `?member_email=` optional |
| POST | `/api/complaints` | Director | Submit complaint (e.g. from frontend) |
| GET | `/api/content?section=` | Director/Prant | Get content for section |
| PUT | `/api/content` | Director/Prant | Body: `{ section, content }`; Prant can only edit `news` |
| GET | `/api/prants` | Director | List prants (email, name, contactNumber) |
| PATCH | `/api/prants/:prantKey` | Director | Update prant name/contactNumber |
| POST | `/api/prants/:prantKey/change-password` | Director | Body: `{ newPassword }` (min 6 chars) |

Send the token in the `Authorization: Bearer <token>` header for protected routes.

### Migration (existing DBs)

If you created the schema before `contact_number` was added to `users`:

```bash
psql -U postgres -d your_database_name -f migrations/001_add_contact_number.sql
```
