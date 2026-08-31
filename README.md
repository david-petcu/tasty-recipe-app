# Tasty

Tasty is a full-stack recipe community where visitors can discover recipes and chefs, while authenticated chefs can publish and manage their own content.

> Live demo: coming soon. No production credentials or private keys are stored in this repository.

## Features

- Public recipe catalogue and chef profiles
- Search by recipe title or ingredient, including typo-tolerant matching
- Filters for category, difficulty, servings, chef and ingredients
- Sorting by cooking time, difficulty and publication date
- Authentication with protected author actions
- Recipe creation, editing and deletion with ownership checks
- Saved recipes and a dedicated favorites page
- Ratings and reviews
- Chef profile editing, password changes and account deletion
- Image uploads through Supabase Storage
- Responsive dark interface with accessible focus states
- Integrated notifications and confirmation modals

## Technology

- Nuxt 4, Vue 3 and TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL and Supabase
- Nitro server routes
- Docker and Docker Compose

## Project structure

```text
components/          Reusable interface components
composables/         Authentication and notification state
layouts/             Shared application layout
middleware/          Protected-route middleware
pages/               Nuxt pages and dynamic routes
prisma/              Prisma schema and SQL migrations
public/              Static assets
scripts/             Database verification helpers
server/api/          Server-side API endpoints
server/utils/        Authentication, database and storage utilities
```

## Database model

The application uses chefs, chef profiles, recipes, ingredients, recipe ingredients, favorites and reviews. Foreign keys use cascading deletion where dependent records must not outlive their owner. Composite unique constraints prevent duplicate ingredients per recipe, duplicate favorites and multiple reviews by the same chef for one recipe.

SQL migrations are stored in `prisma/migrations`. They also configure recipe images, Supabase Storage and PostgreSQL trigram indexes for typo-tolerant search.

## Local setup

Requirements:

- Node.js 24 LTS (24.20 recommended)
- A PostgreSQL database or Supabase project

Install dependencies and create the local environment file:

```powershell
npm ci
Copy-Item .env.example .env
```

Fill in `.env` with your own values:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
NUXT_AUTH_SECRET="a-long-random-secret"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_your-server-only-key"
```

`SUPABASE_SECRET_KEY` is server-only. Never prefix it with `NUXT_PUBLIC_` and never commit `.env`. The legacy `SUPABASE_SERVICE_ROLE_KEY` variable remains supported for older Supabase projects.

Generate Prisma Client and start the application:

```powershell
npx prisma generate
npm run dev
```

Open `http://localhost:3000`.

## Database setup

Apply the SQL migrations to a new Supabase project in chronological order, then verify the constraints:

```powershell
npm run db:audit
```

The audit script reads the database URL from your local environment and does not modify data.

## Docker

Docker Compose reads its secrets from your local `.env` file:

```powershell
docker compose up --build
```

No database URL or credential is embedded in `docker-compose.yml` or the built image context.

## Verification

```powershell
npm audit
npm run typecheck
npm run build
npm run db:audit
```

## Screenshots

### Recipe discovery

Visitors can search the catalogue and narrow the results by category, difficulty, cooking time, servings, chef or ingredient.

![Tasty recipe discovery page with search and filtering controls](docs/screenshots/home1.png)

![Responsive recipe catalogue cards](docs/screenshots/home2.png)

### Recipe details

Each recipe brings preparation details, ingredients and step-by-step instructions together on one page.

![Recipe details with ingredients and cooking instructions](docs/screenshots/recipe-details1.png)

### Chef profiles

Public chef profiles present personal information and every recipe published by that chef.

![Chef profile with biography and published recipes](docs/screenshots/chef-profile.png)

### Recipe management

Authenticated chefs can publish recipes and update their details, images, ingredients and instructions.

![Recipe editing form for an authenticated chef](docs/screenshots/recipe-editor1.png)

### Mobile experience

The navigation, discovery tools and forms adapt to compact screens without removing core functionality.

<p align="center">
  <img src="docs/screenshots/mobile-home.png" width="357" alt="Tasty recipe discovery page on a mobile screen">
</p>

## Demo account

A limited demo account can be added after deployment. Its credentials should be intentionally public and must never be reused for an administrator or personal account.

## License

This project is available under the [MIT License](LICENSE).
