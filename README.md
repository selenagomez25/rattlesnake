# rattlesnake

A fast, modern Minecraft mod (JAR) scanner using YARA rules, with a Rust backend and a Next.js (TypeScript, Tailwind, Bun) frontend.

---

## Features

- Scan Minecraft mod JARs for suspicious or malicious code using YARA rules
- Modern web UI (Next.js, Tailwind, Bun)
- High-performance Rust backend
- Customizable rule set (edit/add YARA rules)
- S3 support for file storage
- OAuth login (GitHub)

---

## Project Structure

```
rattlesnake/
├── frontend/   # Next.js 15 app (TypeScript, Tailwind, Bun)
│   └── scripts/worker.ts   # The worker process (must be running in order to scan)
├── scanner/    # Rust backend (YARA-based JAR scanner)
```

---

## Quick Start

For full setup and self-hosting instructions, see [SELFHOSTING.md](frontend/SELFHOSTING.md).

1. Copy and edit your environment variables:  
   See [ENVIRONMENT.md](frontend/ENVIRONMENT.md) and `frontend/env.example`.
2. Start the scanner backend (`scanner/`)
3. Start the frontend (`frontend/`)
4. Start the worker (`frontend/scripts/worker.ts`)

---

## Documentation

- [Self-Hosting Guide](frontend/SELFHOSTING.md)
- [Environment Variables Reference](frontend/ENVIRONMENT.md)

---

For issues or contributions, open a PR or issue on GitHub.