# Masters Tracker (Vercel-ready)

A phone-friendly Masters pool tracker built with Next.js.

## What it does
- Tracks 10 people with 2 golfers each
- Pulls live scores server-side
- Ranks everyone automatically
- Looks good on phones
- Ready for free deployment on Vercel

## Before you deploy
This starter uses **sample picks** inside `app/api/tracker/route.ts`.

Change the `PICKS` array there to your group's real names and golfers.

## Local run
```bash
npm install
npm run dev
```

Then open:
```bash
http://localhost:3000
```

## Deploy free on Vercel
1. Create a GitHub account if needed
2. Upload this folder to a new GitHub repo
3. Create a free Vercel account
4. Import the GitHub repo into Vercel
5. Click Deploy

Vercel should detect Next.js automatically.

## Important note
This app scrapes a public leaderboard page server-side. If ESPN changes its page structure, the parser in `app/api/tracker/route.ts` may need a quick update.
