# Atlanta Food Consortium

This project is developed by students at Georgia Tech in the [Computing for Good Program](https://c4g.gatech.edu/).

## Live Deployments

| Environment    | URL                                                                                         | Branch    |
| -------------- | ------------------------------------------------------------------------------------------- | --------- |
| **Production** | [atlanta-food-consortium.c4g.dev](https://atlanta-food-consortium.c4g.dev/)                 | `main`    |
| **Staging**    | [atlanta-food-consortium-staging.c4g.dev](https://atlanta-food-consortium-staging.c4g.dev/) | `staging` |

## Getting Started - Running Locally

Follow these steps to set up and run the Atlanta Food Consortium application on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v20.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node -v`

2. **Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Ensure Docker is running before proceeding

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Docker Database**

   ```bash
   docker compose up -d
   ```

   This will start a PostgreSQL database container on port 5434.

3. **Run Database Migrations**

   ```bash
   npm run migrate:dev
   ```

   This applies all Prisma migrations to set up your database schema.

4. **Open Prisma Studio** (Optional - in a separate terminal)

   ```bash
   npx prisma studio
   ```

   This opens a browser-based database GUI at `http://localhost:5555`

5. **Start Development Server** (in a separate terminal)
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Environment Variables

The project requires a `.env` file in the root directory. Key variables include:

```env
DATABASE_URL="postgresql://atlanta_food_user:dev_password_change_in_production@localhost:5434/atlanta_food_consortium?schema=public"
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

> **Note:** Docker Compose also loads the `.env` file and uses `DATABASE_USER`, `DATABASE_PW`, and `DATABASE_NAME` to configure the PostgreSQL container. You can either:
>
> - Hard-code these values directly in `docker-compose.yml`, or
> - Add them to your `.env` file so they're shared between Docker and your application
>
> The `DATABASE_URL` in your `.env` file should match the credentials set in Docker Compose to ensure your application can connect to the database.

### Stopping the Application

To stop the Docker database:

```bash
docker compose down
```

## Documentation

Developer documentation is available on the live site at [`/documentation/features`](https://atlanta-food-consortium.c4g.dev/documentation/features). Key pages:

| Page                        | URL                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Features overview           | [`/documentation/features`](https://atlanta-food-consortium.c4g.dev/documentation/features)                                   |
| Getting started with docs   | [`/documentation/features/getting-started`](https://atlanta-food-consortium.c4g.dev/documentation/features/getting-started)   |
| Application flow diagram    | [`/documentation/features/application-flow`](https://atlanta-food-consortium.c4g.dev/documentation/features/application-flow) |
| Route map & access control  | [`/documentation/features/routes`](https://atlanta-food-consortium.c4g.dev/documentation/features/routes)                     |
| Announcements feature       | [`/documentation/features/announcements`](https://atlanta-food-consortium.c4g.dev/documentation/features/announcements)       |
| Discussions feature         | [`/documentation/features/discussions`](https://atlanta-food-consortium.c4g.dev/documentation/features/discussions)           |
| Markdown / schema reference | [`/documentation/features/schema-reference`](https://atlanta-food-consortium.c4g.dev/documentation/features/schema-reference) |

> **Tip:** Documentation pages are driven by Markdown files in `content/docs/`. Add a `.md` file there to instantly create a new doc page — no code changes needed.

## Contributors

The Atlanta Food Consortium application has been developed by:

- Abhishek Karkar
- Akram Alsamarae
- Akrem Elfatih Abdelwahab
- Jun Siang Neo
- Justin McLellan
- Mika Yoshimura
- Mitchell Rysavy
- Taisiia Bahbouche
