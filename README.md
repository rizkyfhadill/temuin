# Temuin - AI Lost & Found Indonesia

> **Barang hilang? Temuin aja.**

Temuin is an AI-powered Lost & Found platform designed for Indonesia. Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Google Gemini**, it provides a secure and modern solution for reporting, searching, and recovering lost items through intelligent matching and real-time communication.

## Features

- AI-assisted report creation with image analysis
- Smart Match recommendation system
- Public search and report browsing
- Email & Google Authentication
- Role-based access control (User & Admin)
- Realtime chat and notifications
- Admin verification and moderation dashboard
- Gamification with points, badges, and leaderboard
- Progressive Web App (PWA) with offline support
- Responsive interface with Light & Dark mode

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth, Database, Realtime, Storage) |
| AI | Google Gemini |
| Deployment | Vercel |

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Configure the required Supabase environment variables, execute the SQL schema and seed files, then start the development server.

## Project Structure

```
app/
components/
lib/
supabase/
public/
middleware.ts
```

## Security

- Protected user and admin routes
- PostgreSQL Row Level Security (RLS)
- Server-side role validation
- Secure internal messaging
- Service Role for privileged operations

## License

This project was developed for educational and portfolio purposes.
