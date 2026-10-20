# Velocity Rentals — Local Setup & Database Guide

This document covers everything you need to run this project on your own machine,
manage its database, and (optionally) rebuild the data layer in C# / SQL Server.

---

## TABLE OF CONTENTS

1. [Dependencies — what to install](#1-dependencies)
2. [Running the project in VS Code (recommended)](#2-running-the-project-in-vs-code)
3. [Creating & linking the PostgreSQL database](#3-creating--linking-the-postgresql-database)
4. [Using the project in Visual Studio 2022](#4-using-the-project-in-visual-studio-2022-nextjs)
5. [SQL Server + SSMS path (for the C# version)](#5-sql-server--ssms-path-c)
6. [Rebuilding the app in C# / ASP.NET Core](#6-rebuilding-the-app-in-c--aspnet-core)
7. [Useful commands reference](#7-command-reference)

---

## 1. DEPENDENCIES

### Required software (this project)

| Tool | Version | Where to get it |
|---|---|---|
| **Node.js LTS** | 20.x or 22.x | https://nodejs.org (includes `npm`) |
| **Git** | any recent | https://git-scm.com |
| **VS Code** | latest | https://code.visualstudio.com |
| **PostgreSQL** | 16 or 17 | https://www.postgresql.org/download (or Docker) |
| **pgAdmin** *(bundled with the PostgreSQL installer)* | 4.x | included — the PostgreSQL equivalent of SSMS |

### Recommended VS Code extensions

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier** (`esbenp.prettier-vscode`)
- **PostgreSQL** (`cweijan.vscode-postgresql-client2`) — browse tables inside VS Code
- **Docker** (`ms-azuretools.vscode-docker`) — only if you run Postgres in Docker

### Project npm dependencies (already declared in `package.json`)

Installed automatically with `npm install` — nothing extra to download:

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | Application framework (Next.js 16, React 19) |
| `drizzle-orm`, `pg` | SQL ORM + PostgreSQL driver |
| `drizzle-kit` *(dev)* | Schema migrations (`push`) |
| `tsx` *(dev)* | Runs the TypeScript seed script |
| `tailwindcss` v4 | Styling |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `zod` | API input validation |
| `clsx`, `tailwind-merge` | Class-name utilities |
| `typescript`, `eslint` *(dev)* | Tooling |

---

## 2. RUNNING THE PROJECT IN VS CODE

```bash
# 1. Get the code onto your machine
git clone <your-repo-url> velocity-rentals
cd velocity-rentals          # or just download/unzip and open the folder

# 2. Open it in VS Code
code .

# 3. Install dependencies (reads package.json automatically)
npm install

# 4. Create your environment file (see section 3 for the connection string)
#    In VS Code: New File → ".env" in the project root with this line:
#    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"

# 5. Create the database tables
npx drizzle-kit push

# 6. Load the demo data (20 vehicles, 8 customers, 14 bookings)
npx tsx src/db/seed.ts

# 7. Run it
npm run dev
```

Open http://localhost:3000 — the admin portal is at **http://localhost:3000/admin**.

> Tip: keep the dev server running while you edit — Next.js hot-reloads every change.

---

## 3. CREATING & LINKING THE POSTGRESQL DATABASE

Pick **one** of these two options.

### Option A — PostgreSQL installer (Windows/macOS/Linux)

1. Run the EDB installer from postgresql.org.
2. During install:
   - Set the `postgres` superuser password to **`postgres`** (or remember your own and adjust the URL below).
   - Keep the default port **5432**.
   - Include **pgAdmin 4** when asked about components.
3. Open pgAdmin → right-click **Databases** → **Create → Database…** → name it **`app_db`** → Save.

### Option B — Docker (fastest, nothing permanent on your machine)

```bash
docker run --name velocity-pg ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=app_db ^
  -p 5432:5432 -d postgres:17
```

### Link the database to the app

The whole link is **one line** in `.env` at the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
#              └─ user: password @ host    : port / database
```

> **This is the only file you ever edit for DB credentials.** The Next.js app,
> `drizzle-kit push` and the seed script all read `DATABASE_URL` from `.env`.
>
> **Troubleshooting — `password authentication failed for user "postgres"`:**
> you chose a custom password during the PostgreSQL install (e.g. `1234`).
> Put that password in the `.env` line, e.g.
> `DATABASE_URL="postgresql://postgres:1234@localhost:5432/app_db"`,
> then re-run `npx drizzle-kit push` and `npx tsx src/db/seed.ts`.
> If you installed on a different port, change `5432` the same way.

Then push the schema and seed:

```bash
npx drizzle-kit push     # creates vehicles, customers, bookings tables + indexes
npx tsx src/db/seed.ts   # inserts the demo data
```

### Browse/edit the data (SSMS equivalent)

- **pgAdmin 4** — expand `app_db → Schemas → public → Tables` → right-click `vehicles` → **View/Edit Data → All Rows**.
- Or the **PostgreSQL extension in VS Code** — connect with the same URL and run queries side-by-side with your code.

Note: **SSMS itself cannot connect to PostgreSQL** — it is a SQL Server–only tool. For SSMS, use the SQL Server script in the next section.

---

## 4. USING THE PROJECT IN VISUAL STUDIO 2022 (Next.js)

Visual Studio 2022 can open this folder (it has Node.js tooling), but **VS Code is the
recommended editor** for Next.js — better terminal integration, extensions and speed.

If you prefer Visual Studio 2022 anyway:

1. Install **Visual Studio 2022 Community** (free) with the **"Node.js development"** workload.
2. File → Open → Folder… → select the project folder.
3. Open **View → Terminal**, then run the same commands as section 2
   (`npm install` → `npx drizzle-kit push` → `npx tsx src/db/seed.ts` → `npm run dev`).
4. The `.env` file and everything else work identically.

Use Visual Studio 2022 proper for the **C# version** below — that's where it shines.

---

## 5. SQL SERVER + SSMS PATH (C#)

A complete, ready-to-run T-SQL script ships with this project:

```
database/sqlserver-schema.sql
```

It creates a `VelocityRentals` database with all three tables, foreign keys,
indexes and the full seed dataset (same vehicles, customers and bookings).

### Steps

1. Install **SQL Server 2022 Developer** (free) and **SQL Server Management Studio (SSMS)**.
2. Open SSMS → connect to `localhost` (Windows Authentication).
3. File → Open → File… → select `database/sqlserver-schema.sql`.
4. Press **Execute** (F5). The script:
   - drops/creates the `VelocityRentals` database,
   - creates `Vehicles`, `Customers`, `Bookings`,
   - inserts all seed data,
   - creates indexes + a sample reporting query at the bottom.
5. Refresh the Databases node — browse, edit and query everything in SSMS.

Money is stored as `DECIMAL(12,2)` rand values (idiomatic SQL Server), and the script
ends with example queries (revenue by month, fleet status, booking joins) you can run
immediately.

---

## 6. REBUILDING THE APP IN C# / ASP.NET CORE

With the SSMS database from section 5 in place, generate the C# data layer automatically
(database-first):

1. Visual Studio 2022 → **Create new project** → **ASP.NET Core Web App (Model-View-Controller)** → .NET 8 → name `VelocityRentals`.
2. Install NuGet packages (Tools → NuGet Package Manager → Package Manager Console):

   ```powershell
   Install-Package Microsoft.EntityFrameworkCore.SqlServer
   Install-Package Microsoft.EntityFrameworkCore.Tools
   ```

3. Add the connection string to `appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=VelocityRentals;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

4. Scaffold the models + DbContext straight from the SSMS database:

   ```powershell
   Scaffold-DbContext "Server=localhost;Database=VelocityRentals;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
   ```

   This generates `Vehicle.cs`, `Customer.cs`, `Booking.cs` and `VelocityRentalsContext.cs`
   matching the SSMS tables exactly.

5. Register the context in `Program.cs` and scaffold admin CRUD:

   ```csharp
   builder.Services.AddDbContext<VelocityRentalsContext>(o =>
       o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
   ```

   Then: right-click **Controllers → Add → New Scaffolded Item → MVC Controller with
   views, using Entity Framework** → pick `Vehicle` → repeat for `Booking` and `Customer`.
   You now have the same admin portal (list/create/edit/delete) generated for you.

6. Currency: format with `string.Format(new CultureInfo("en-ZA"), "{0:C}", value)`.

---

## 7. COMMAND REFERENCE

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Production server | `npm run start` |
| Type-check | `npx tsc --noEmit` |
| Create/update tables | `npx drizzle-kit push` |
| Seed demo data | `npx tsx src/db/seed.ts` |
| Wipe & re-seed | `npx tsx src/db/seed.ts --force` |
| Connect to DB via CLI | `psql postgresql://postgres:postgres@localhost:5432/app_db` |
