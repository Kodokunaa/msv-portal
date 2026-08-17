# Mindoro Supporting Varsitarian Member Portal

A secure member-only web application built with Laravel 12, React 19, TypeScript, Inertia.js, Tailwind CSS, and MySQL.

## Implemented access levels

- **Guest** — public landing page, registration, login, and password reset.
- **Applicant** — account is Pending by default, can verify email and update their profile while waiting.
- **Member** — views published financial records, permitted disciplinary records, and only their own payment history.
- **Provincial Admin** — an Admin with an active council assignment; manages applications, members, payments, and disciplinary records only in that council.
- **Manager** — organization-wide access, financial management, role administration, council assignments, and audit logs.

Admins have organization-wide member, payment, and disciplinary management access. Managers have those permissions plus exclusive financial CRUD, role administration, council assignments, and audit logs.

## Included modules

- Registration with Pending status
- Email verification
- Login, logout, password reset, and password updates
- Admin approval and rejection with required reasons
- Suspension, reactivation, and deactivation without deleting historical data
- Role assignment history and Provincial Admin scope history
- Financial income, expense, and balance reporting
- Published and draft financial records
- Member-specific payment history
- Payment statuses: Paid, Unpaid, Pending, and Partially Paid
- Disciplinary cases with organization, affected-member, or private visibility
- Search, filters, and server-side pagination
- Safe record voiding instead of permanent deletion
- Append-only audit logging
- Email and database notifications for membership decisions and account-status changes
- Responsive MSV-branded interface

## Technology

- PHP 8.2 or newer
- Laravel 12
- MySQL 8 or MariaDB
- React 19 and TypeScript
- Inertia.js
- Tailwind CSS 4
- Node.js 20 or newer

Required PHP extensions include PDO MySQL, OpenSSL, Mbstring, XML/DOM, Ctype, JSON, Fileinfo, and Tokenizer.

## Local setup

1. Create a MySQL database named `msv_portal` using `utf8mb4_unicode_ci`.
2. Install dependencies:

```bash
composer install
npm install
```

3. Create the environment file:

```bash
cp .env.example .env
php artisan key:generate
```

4. Update the database and mail values in `.env`.
5. Build and seed the database:

```bash
php artisan migrate:fresh --seed
php artisan storage:link
```

6. Start the application:

```bash
composer run dev
```

7. Open `http://127.0.0.1:8000`.

## Local demonstration accounts

These are created only in `local` and `testing` environments.

| Role | Email | Password |
|---|---|---|
| Manager | `manager@msv.local` | Value of `MSV_MANAGER_PASSWORD`, or local fallback `ChangeMe123!` |
| Provincial Admin | `admin@msv.local` | `Password123!` |
| Member | `member@msv.local` | `Password123!` |
| Pending applicant | `pending@msv.local` | `Password123!` |

Never use the demonstration passwords in production.

## Main routes

| Page | Route |
|---|---|
| Landing | `/` |
| Login | `/login` |
| Registration | `/register` |
| Pending approval | `/account/pending` |
| Dashboard | `/dashboard` |
| Financial records | `/financial-records` |
| Payment records | `/payments` |
| Disciplinary records | `/disciplinary-records` |
| Member management | `/management/members` |
| Audit logs | `/audit-logs` |
| Profile | `/settings/profile` |
| Password | `/settings/password` |

## REST API

The application includes a Laravel Sanctum token API under `/api`:

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/register` | Public; creates a Pending application |
| POST | `/api/login` | Public; active accounts only |
| POST | `/api/logout` | Authenticated |
| POST | `/api/approve-user` | Admin or Manager |
| GET/POST/PUT/DELETE | `/api/payments` | Member read-own; Admin/Manager manage |
| GET/POST/PUT/DELETE | `/api/financial-records` | Approved members read; Manager manages |
| GET/POST/PUT/DELETE | `/api/disciplinary-records` | Approved members read; Admin/Manager manage |

DELETE operations require a `reason` and retain the record as voided for audit history.

## Production configuration

Set at minimum:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
SESSION_DRIVER=redis
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
QUEUE_CONNECTION=database
REDIS_CLIENT=phpredis
MSV_MANAGER_EMAIL=manager@your-domain.example
MSV_MANAGER_PASSWORD=use-a-strong-unique-password
```

The production seeder refuses to create a new Manager unless `MSV_MANAGER_PASSWORD` is set.

Deploy with:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Configure a queue worker and the Laravel scheduler. Point the web server document root to the project’s `public` directory.

## Validation commands

```bash
php artisan route:list --except-vendor
php artisan test
npm run typecheck
npm run lint:check
npm run format:check
npm run build
```

Before production deployment, replace all local demonstration credentials, configure real mail delivery, enable secure cookies, and run the complete validation command set above.
