# GitSummarizer — AI + Data Starter

A beginner-friendly Node.js + Express API for summarizing public GitHub repositories with OpenAI and storing the results in PostgreSQL.

## Requirements
- Node.js 20 or newer
- PostgreSQL
- OpenAI API key
- Optional GitHub token (helps avoid low unauthenticated API limits)

## Setup
1. Extract the ZIP and open this folder in VS Code.
2. Install packages: `npm install`
3. Create a PostgreSQL database named `gitsummarizer`.
4. Copy `.env.example` to `.env` and set `DATABASE_URL` and `OPENAI_API_KEY`.
5. Apply schema: `npm run db:migrate`
6. Start server: `npm run dev`
7. Visit `http://localhost:5000/api/health`; expect `{"status":"ok"}`.

## API
- `GET /api/health`
- `POST /api/summaries` with JSON body `{"repositoryUrl":"https://github.com/facebook/react"}`
- `GET /api/summaries/:id`
- `PATCH /api/summaries/:id/save` with `{"isSaved":true}` or `{"isSaved":false}`
- `GET /api/history`
- `GET /api/history/saved`
- `DELETE /api/history/:id`

## Tests
Run `npm test`.

## Important limitations
- This is an anonymous MVP: authentication and per-user authorization are not implemented. Do not deploy it for private/personal history until those protections are added.
- The summary uses repository metadata, README content, and recent commit messages; it does not analyze every source file.
- Validate provider API costs and model availability in your OpenAI account.
- Never commit `.env` or expose `OPENAI_API_KEY` to the browser.
