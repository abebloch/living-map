# Anna's Living Map

A strategic landscape navigator with integrated Claude AI advisor. Built with Next.js, Supabase, and the Anthropic API.

## Setup (15 minutes)

### 1. Get an Anthropic API key

- Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- Create a new key
- Save it somewhere — you'll need it in step 4

### 2. Create a Supabase project

- Go to [supabase.com](https://supabase.com) and create a free account
- Create a new project (any name, pick a region close to you)
- Once it's ready, go to **SQL Editor** in the sidebar
- Paste the contents of `supabase-setup.sql` and click **Run**
- Go to **Settings → API** and copy:
  - **Project URL** (looks like `https://abc123.supabase.co`)
  - **anon public key** (starts with `eyJ...`)

### 3. Deploy to Vercel

The fastest path:

```bash
# Clone or copy this project to a new folder
# Then push to a GitHub repo

git init
git add .
git commit -m "initial"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/living-map.git
git push -u origin main
```

Then:
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- It will auto-detect Next.js

### 4. Set environment variables

In Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your key from step 1) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key from step 2) |

Redeploy after adding variables.

### 5. Done

Your map is live. Everything persists across devices via Supabase. Claude runs on Opus 4.6 through the secure API proxy.

## Local development

```bash
cp .env.example .env
# Fill in your actual values in .env

npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Architecture

```
app/
  page.js          → The full Living Map (client component)
  layout.js        → Root layout with fonts
  globals.css      → Minimal styles + animations
  api/
    claude/route.js   → Proxies requests to Anthropic (keeps API key server-side)
    storage/route.js  → CRUD for Supabase key-value store
lib/
  supabase.js      → Supabase client
```

## Cost notes

- **Anthropic API**: Opus 4.6 costs ~$15/M input tokens, ~$75/M output. Each Claude chat message costs roughly $0.02–0.05. Light usage = a few dollars/month.
- **Supabase**: Free tier covers this easily (500MB, 50K requests/month)
- **Vercel**: Free tier covers this (100GB bandwidth/month)

## What's next: Multi-user version

See the conversation notes for what's needed to open this up to others.
# living-map
