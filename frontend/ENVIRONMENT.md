# Environment Variables Reference

This file documents all environment variables used in the frontend `.env` file. Use this as a reference when setting up your own instance.

---

## MongoDB
- `MONGODB_URI` (required): MongoDB connection string. Used to store scan data and user info.
- `MONGODB_DB` (required): Database name (default: `scanapp`).

## AWS S3 (Required)
- `AWS_ACCESS_KEY_ID` (required): AWS access key for S3 uploads. Required for file storage.
- `AWS_SECRET_ACCESS_KEY` (required): AWS secret key for S3 uploads.
- `AWS_REGION` (required): AWS region for your S3 bucket.
- `AWS_S3_BUCKET` (required): Name of your S3 bucket.

## Github OAuth
- `GITHUB_CLIENT_ID` (required): GitHub OAuth app client ID for login.
- `GITHUB_CLIENT_SECRET` (required): GitHub OAuth app client secret.

## Next.js Auth
- `NEXTAUTH_SECRET` (required): Secret for NextAuth.js session encryption. Generate a random string.
- `NEXTAUTH_URL` (required): The base URL of your frontend (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (required): Cloudflare Turnstile site key for anti-bot protection.

## Scanner Backend
- `SCANNER_WS_URL` (required): WebSocket URL for the Rust scanner backend. Default: `ws://localhost:8081/ws`.

## Upstash Redis (Optional)
- `UPSTASH_REDIS_REST_URL` (optional): Upstash Redis REST URL. Used for rate limiting and session storage.
- `UPSTASH_REDIS_REST_TOKEN` (optional): Upstash Redis REST token.

> Upstash is not required for basic operation, but recommended for production deployments.

---

For a template, see `env.example` in the frontend directory.

---

**Note:** The worker (`frontend/scripts/worker.ts`) must be running for scanning to work. 