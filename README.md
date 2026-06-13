# FoodQR

A restaurant management platform with QR-based ordering. Built with NestJS (backend) and Angular (frontend).

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [Docker](https://www.docker.com/) and Docker Compose (for PostgreSQL)

---

## Project Structure

```
foodqr/
├── foodqr-backend/    # NestJS REST API (port 3000)
└── foodqr-frontend/   # Angular 17 app (port 4200)
```

---

## Getting Started

### 1. Start the Database

From the `foodqr-backend/` directory, spin up PostgreSQL with Docker:

```bash
cd foodqr-backend
docker compose up -d postgres
```

This starts a PostgreSQL 16 instance on port `5432` with:
- **User**: `postgres`
- **Password**: `password`
- **Database**: `foodqr_db`

---

### 2. Run the Backend

```bash
cd foodqr-backend

# Install dependencies
npm install

# Copy environment file and configure values
cp .env.example .env

# Start in development mode (with hot reload)
npm run start:dev
```

The API will be available at `http://localhost:3000`.

**Other backend scripts:**

| Command | Description |
|---|---|
| `npm run start` | Start without hot reload |
| `npm run start:debug` | Start with debugger |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run migration:run` | Run database migrations |
| `npm run seed` | Seed default users into the database |

### Seed Users

After the backend is running, seed the database with one user per role:

```bash
cd foodqr-backend
npm run seed
```

This creates the following users (all with password `Admin@123`):

| Role | Email |
|---|---|
| Admin (Super Admin) | admin@foodqr.com |
| Branch Manager | manager@foodqr.com |
| Waiter | waiter@foodqr.com |
| Chef | chef@foodqr.com |
| POS Operator | pos@foodqr.com |
| Staff | staff@foodqr.com |
| Customer | customer@foodqr.com |

> The seed is idempotent — running it again skips users that already exist.

---

### 3. Run the Frontend

Open a new terminal:

```bash
cd foodqr-frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`.

**Other frontend scripts:**

| Command | Description |
|---|---|
| `npm run build` | Build for production |
| `npm run build:prod` | Build with production configuration |
| `npm test` | Run unit tests |

---

## Environment Variables

Copy `foodqr-backend/.env.example` to `foodqr-backend/.env` and fill in the required values:

| Variable | Description | Required |
|---|---|---|
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port (default: `5432`) | Yes |
| `DB_USERNAME` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_DATABASE` | Database name | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `MAIL_HOST` | SMTP host for emails | Optional |
| `FIREBASE_PROJECT_ID` | Firebase project for push notifications | Optional |
| `AWS_S3_BUCKET` | S3 bucket for file uploads | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret for payments | Optional |

---

## Running with Docker (Full Stack)

To run both the API and database together via Docker:

```bash
cd foodqr-backend
docker compose up -d
```

This starts:
- **postgres** on port `5432`
- **api** on port `3000`

> The frontend must still be run locally with `npm start` inside `foodqr-frontend/`.

---

## API Documentation

Once the backend is running, Swagger docs are available at:

```
http://localhost:3000/api
```
