# Self-Hosting Guide

This guide will help you set up and run your own instance of rattlesnake.

---

## 1. Prerequisites

- [Bun](https://bun.sh/) (for the frontend)
- [Rust](https://rust-lang.org/) (for the scanner backend)
- (Optional) [Node.js](https://nodejs.org/) if you want to use npm
- AWS S3 credentials (required for file storage)

---

## 2. Environment Variables

Copy `frontend/env.example` to `frontend/.env` and fill in the required values:

```sh
cp frontend/env.example frontend/.env
```

- **MongoDB**: Required for storing scan data.
- **Github OAuth**: Required for login (or use your own OAuth provider).
- **NEXTAUTH_SECRET**: Generate a random string for session security.
- **SCANNER_WS_URL**: URL for the Rust scanner backend (default: ws://localhost:8081/ws).
- **Upstash Redis**: Optional, for rate limiting/session. Not required for basic operation.
- **AWS S3**: Required for file storage. You must fill in all S3 variables.

---

## 3. Running the Services

### Scanner Backend (Rust)

```sh
cd scanner
cargo build --release
cargo run
```

### Frontend (Next.js + Bun)

```sh
cd frontend
bun install
bun run dev
```

### Worker

- **You must also run the worker (`frontend/scripts/worker.ts`) in order to scan files.**
- Start it with Bun:

```sh
cd frontend
bun run scripts/worker.ts
```

---

## 4. Accessing the App

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Upload a Minecraft mod JAR and view the scan results.

---