# Tasty

[English](#english) | [Română](#română)

<a id="english"></a>

## English

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

```mermaid
erDiagram
    chefs ||--o| chef_profiles : has
    chefs ||--o{ recipes : publishes
    chefs ||--o{ recipe_favorites : saves
    chefs ||--o{ recipe_reviews : writes
    recipes ||--o{ recipe_ingredients : contains
    ingredients ||--o{ recipe_ingredients : appears_in
    recipes ||--o{ recipe_favorites : receives
    recipes ||--o{ recipe_reviews : receives

    chefs {
        bigint id PK
        text username UK
        text email UK
        text password
        timestamptz created_at
    }
    chef_profiles {
        bigint id PK
        bigint chef_id FK,UK
        text bio
        text profile_image
        text location
        int years_experience
    }
    recipes {
        bigint id PK
        bigint chef_id FK
        text title
        text description
        text image
        text instructions
        int cooking_time
        text difficulty
        text category
        int servings
        timestamptz created_at
    }
    ingredients {
        bigint id PK
        text name UK
        text unit
    }
    recipe_ingredients {
        bigint id PK
        bigint recipe_id FK
        bigint ingredient_id FK
        text quantity
    }
    recipe_favorites {
        bigint id PK
        bigint chef_id FK
        bigint recipe_id FK
        timestamptz created_at
    }
    recipe_reviews {
        bigint id PK
        bigint chef_id FK
        bigint recipe_id FK
        int rating
        text comment
        timestamptz created_at
        timestamptz updated_at
    }
```

The database enforces valid categories (`breakfast`, `lunch`, `dinner`, `dessert`), difficulty levels (`easy`, `medium`, `hard`), positive cooking times and servings, ratings between 1 and 5, and non-empty required text fields. Passwords are stored as hashes, never as plain text.

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

---

<a id="română"></a>

## Română

Tasty este o comunitate full-stack de rețete în care vizitatorii pot descoperi rețete și bucătari, iar bucătarii autentificați își pot publica și administra propriul conținut.

> Versiunea publică va fi disponibilă în curând. Repository-ul nu conține credențiale de producție sau chei private.

## Funcționalități

- Catalog public de rețete și profiluri de bucătari
- Căutare după titlul rețetei sau ingredient, inclusiv căutare tolerantă la greșeli
- Filtrare după categorie, dificultate, porții, bucătar și ingrediente
- Sortare după timpul de preparare, dificultate și data publicării
- Autentificare și protejarea acțiunilor rezervate autorului
- Adăugarea, editarea și ștergerea rețetelor cu verificarea proprietarului
- Rețete salvate și pagină dedicată favoritelor
- Evaluări și recenzii
- Editarea profilului, schimbarea parolei și ștergerea contului
- Încărcarea imaginilor prin Supabase Storage
- Interfață dark responsive, cu stări de focus accesibile
- Notificări și ferestre de confirmare integrate în design

## Tehnologii

- Nuxt 4, Vue 3 și TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL și Supabase
- Rute server Nitro
- Docker și Docker Compose

## Structura proiectului

```text
components/          Componente reutilizabile de interfață
composables/         Starea autentificării și a notificărilor
layouts/             Structura comună a paginilor
middleware/          Protecția rutelor private
pages/               Pagini Nuxt și rute dinamice
prisma/              Schema Prisma și migrările SQL
public/              Fișiere statice
scripts/             Utilitare pentru verificarea bazei de date
server/api/          Endpoint-uri API executate pe server
server/utils/        Autentificare, bază de date și stocare
```

## Modelul bazei de date

Baza de date conține bucătari, profiluri, rețete, ingrediente, legăturile dintre rețete și ingrediente, favorite și recenzii. Diagrama ER completă se află în [secțiunea în engleză](#database-model).

Cheile externe folosesc ștergerea în cascadă acolo unde înregistrările dependente nu trebuie să existe fără proprietar. Constrângerile unice compuse împiedică repetarea aceluiași ingredient într-o rețetă, salvarea repetată a aceleiași rețete și publicarea mai multor recenzii de același bucătar pentru aceeași rețetă.

Baza de date acceptă numai categoriile `breakfast`, `lunch`, `dinner` și `dessert`, dificultățile `easy`, `medium` și `hard`, timpi și porții pozitive, evaluări între 1 și 5 și texte obligatorii care nu sunt goale. Parolele sunt stocate sub formă de hash, niciodată ca text simplu.

Migrările SQL se află în `prisma/migrations`. Acestea configurează și imaginile rețetelor, Supabase Storage și indexurile PostgreSQL trigram pentru căutarea tolerantă la greșeli.

Tabelul intern `_prisma_migrations` nu apare în diagramă deoarece este administrat automat de Prisma și nu face parte din modelul funcțional al aplicației.

## Instalare locală

Cerințe:

- Node.js 24 LTS (este recomandată versiunea 24.20)
- O bază de date PostgreSQL sau un proiect Supabase

Instalează dependențele și creează fișierul local de configurare:

```powershell
npm ci
Copy-Item .env.example .env
```

Completează `.env` cu propriile valori:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
NUXT_AUTH_SECRET="o-valoare-lunga-si-aleatorie"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_cheia-ta-folosita-doar-pe-server"
```

`SUPABASE_SECRET_KEY` trebuie folosită numai pe server. Nu îi adăuga prefixul `NUXT_PUBLIC_` și nu publica niciodată fișierul `.env`. Variabila veche `SUPABASE_SERVICE_ROLE_KEY` rămâne compatibilă cu proiectele Supabase mai vechi.

Generează Prisma Client și pornește aplicația:

```powershell
npx prisma generate
npm run dev
```

Deschide `http://localhost:3000`.

## Configurarea bazei de date

Aplică migrările SQL într-un proiect Supabase nou, în ordine cronologică, apoi verifică toate constrângerile:

```powershell
npm run db:audit
```

Scriptul de audit citește adresa bazei de date din mediul local și nu modifică datele.

## Docker

Docker Compose citește valorile sensibile din fișierul local `.env`:

```powershell
docker compose up --build
```

Fișierul `docker-compose.yml` și contextul imaginii construite nu conțin adrese ale bazei de date sau credențiale.

## Verificare

```powershell
npm audit
npm run typecheck
npm run build
npm run db:audit
```

## Capturi de ecran

### Descoperirea rețetelor

Vizitatorii pot căuta în catalog și pot restrânge rezultatele după categorie, dificultate, timp de preparare, porții, bucătar sau ingredient.

![Pagina Tasty pentru descoperirea și filtrarea rețetelor](docs/screenshots/home1.png)

![Cardurile responsive din catalogul de rețete](docs/screenshots/home2.png)

### Detaliile rețetei

Fiecare pagină reunește informațiile de preparare, ingredientele și instrucțiunile pas cu pas.

![Detaliile unei rețete, ingredientele și instrucțiunile](docs/screenshots/recipe-details1.png)

### Profilurile bucătarilor

Profilurile publice prezintă informațiile personale și toate rețetele publicate de bucătar.

![Profil de bucătar cu biografie și rețete publicate](docs/screenshots/chef-profile.png)

### Administrarea rețetelor

Bucătarii autentificați pot publica rețete și le pot actualiza detaliile, imaginile, ingredientele și instrucțiunile.

![Formularul de editare a unei rețete](docs/screenshots/recipe-editor1.png)

### Experiența pe mobil

Navigația, instrumentele de căutare și formularele se adaptează ecranelor mici fără eliminarea funcționalităților importante.

<p align="center">
  <img src="docs/screenshots/mobile-home.png" width="357" alt="Pagina Tasty pentru descoperirea rețetelor pe mobil">
</p>

## Cont demonstrativ

După publicarea aplicației poate fi adăugat un cont demonstrativ cu permisiuni limitate. Datele sale trebuie să fie create special pentru publicare și nu trebuie reutilizate pentru un cont personal sau de administrator.

## Licență

Acest proiect este disponibil sub [licența MIT](LICENSE).
