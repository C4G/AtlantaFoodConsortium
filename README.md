# Atlanta Food Consortium

This project is developed by students at Georgia Tech in the [Computing for Good Program](https://c4g.gatech.edu/).

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

### Stopping the Application

To stop the Docker database:

```bash
docker compose down
```

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
