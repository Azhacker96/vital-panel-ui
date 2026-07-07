## Problem
App deployed on Vercel from GitHub shows no data because Vercel build doesn't have the Supabase environment variables. The `.env` file is gitignored, so Vercel builds with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as `undefined`, and the Supabase client can't reach the backend.

## Fix (Vercel Dashboard — no code changes needed)

1. Open your Vercel project → **Settings** → **Environment Variables**
2. Add these three variables (for **Production**, **Preview**, and **Development**):

   - `VITE_SUPABASE_URL` = `https://nuacnmzlshbwkxlmanyq.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YWNubXpsc2hid2t4bG1hbnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzgyMjEsImV4cCI6MjA5NzcxNDIyMX0.n2ImU1ZM09xtnlcbobYvi2h-HmcH5K57-X8RHInqC2o`
   - `VITE_SUPABASE_PROJECT_ID` = `nuacnmzlshbwkxlmanyq`

3. Go to **Deployments** → latest deployment → **⋯** → **Redeploy** (uncheck "use existing build cache")

4. Open the redeployed site → open browser DevTools → **Console** and **Network** tabs to confirm requests now go to `nuacnmzlshbwkxlmanyq.supabase.co` instead of `undefined`.

## Notes
- These values are public (anon key + project URL) — safe to expose in the browser bundle. RLS protects the data.
- Auth redirects: in the app's Auth settings, make sure your Vercel URL (e.g. `https://your-app.vercel.app`) is added to the allowed redirect URLs, otherwise login/signup will fail on the Vercel domain.
- Edge Functions (like `analyze-report`) run on Lovable Cloud, not Vercel — they continue to work regardless.
- No file changes required in this plan. If after redeploy data still doesn't appear, share a screenshot of the browser Console + Network tab so I can diagnose (likely CORS or auth redirect config).
