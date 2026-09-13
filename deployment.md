# Deployment Guide: AI Attendance V2

This guide explains how to deploy the AI Attendance V2 application to a production environment. 

The application is structured as a unified deployment: the FastAPI backend serves both the REST API and the static, pre-compiled React frontend files. This means you only need to deploy **one** container or application instance.

## Prerequisites
- A Supabase project with all SQL migrations applied (001 through 008).
- Docker and Docker Compose installed on your server (if deploying via Docker).

## Environment Variables

### Backend Configuration
The backend requires the following environment variables to communicate with Supabase securely:
- `SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Found in Project Settings -> API)

*Note: The frontend does NOT need environment variables injected during runtime because it accesses the API at the same origin (`/api/v1` and `/ws/ai`).*

---

## Deployment Option 1: Docker Compose (Recommended)

1. **Clone the repository** to your server.
2. **Create a `.env` file** in the root directory:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. **Build and start the container:**
   ```bash
   docker-compose up -d --build
   ```
4. **Access the application:**
   Navigate to `http://<your-server-ip>:8000`.

---

## Deployment Option 2: Render / Railway / Heroku

Because this project uses a standard `Dockerfile`, it can be deployed to modern PaaS providers with zero configuration.

1. **Connect your GitHub repository** to Render/Railway.
2. **Select "Deploy from Dockerfile"**.
3. **Add Environment Variables** in the provider's dashboard (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).
4. **Deploy**. The platform will automatically run the multi-stage Docker build and expose the web server on port 8000.

## Security Notes
- **Do not** commit your `.env` files or Supabase Service Role keys to public repositories.
- The React frontend is completely decoupled from Supabase secrets. All Supabase interactions are safely handled by the FastAPI backend using JWT verification.
- Ensure your production domain has HTTPS enabled, as browser camera access (`getUserMedia`) requires a secure context (HTTPS). If you deploy behind a reverse proxy (like Nginx), ensure SSL termination is properly configured.
