# LBRCE Campus Food Court Order System

A web-based food ordering system for college students at LBRCE. Students browse menus, place orders, and track status. Admins manage orders and menus. Telegram notifications keep everyone updated.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Flask API     │      │   Supabase      │
│   (GitHub Pages)│─────▶│   (Docker)      │─────▶│   (DB + Auth +  │
│   HTML/CSS/JS   │      │   Port 5000     │      │    Storage)     │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Telegram Bot API│
                         │ (notifications) │
                         └─────────────────┘
```

- **Frontend**: Plain HTML + Bootstrap CDN + Supabase JS CDN → hosted on GitHub Pages
- **Backend**: Flask API in a single Docker container → runs on Ubuntu server
- **Database**: Supabase (PostgreSQL) — no local DB setup
- **Auth**: Supabase Auth — email/password
- **Storage**: Supabase Storage — menu item images
- **Notifications**: Telegram Bot API — called directly from Flask via `requests.post()`

## Team Structure

| Team   | Responsibility            | Folder                                  |
| ------ | ------------------------- | --------------------------------------- |
| Team 1 | Database + Infrastructure | `docs/`, Supabase dashboard, `ansible/` |
| Team 2 | Backend API               | `api/`                                  |
| Team 3 | Telegram Notifications    | `api/services/telegram.py`              |
| Team 4 | Frontend Dashboard        | `frontend/`                             |
| Team 5 | CI/CD + Deployment        | `.github/workflows/`, `ansible/`        |

## Quick Start (Local Development)

### Backend API

```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your Supabase + Telegram credentials
# Run with project root on PYTHONPATH so "api" package is found:
PYTHONPATH=.. python3 app.py
# API runs at http://localhost:5000
```

### Frontend

```bash
# Just open frontend/index.html in a browser
# Or use a simple server:
cd frontend
python -m http.server 8080
# Visit http://localhost:8080
```

### Deploy API to Server

```bash
cd api
docker build -t lbrce-api .
docker run -d -p 5000:5000 --env-file .env lbrce-api
```

## Project Structure

See [prompt.md](prompt.md) for the complete project specification including API docs, database schema, and team task breakdowns.

## Key Links

- **API Spec**: [docs/API_SPEC.md](docs/API_SPEC.md)
- **DB Schema**: [docs/DB_SCHEMA.md](docs/DB_SCHEMA.md)
- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Task Tracker**: [REQUIREMENTS.md](REQUIREMENTS.md)
