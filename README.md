# VitaCare Backend (Vercel-ready)

Real API for the VitaCare Android app: Express + MongoDB (Mongoose) + JWT.
Replaces the earlier mock `server.js` (which had no database and no /api/users, /api/health, /api/metrics routes).

## Deploy to Vercel
1. Create a free MongoDB Atlas cluster. Database Access: create a user. Network Access: allow `0.0.0.0/0`.
   Copy the connection string (Connect > Drivers).
2. Replace the files of your GitHub repo `vitacare-backend` with the files in this folder and push.
3. Vercel > your project > Settings > Environment Variables, add (Production):
   - `MONGO_URI`  = your Atlas connection string (add a DB name, e.g. `/vitacare`)
   - `JWT_SECRET` = a long random string
   - `ANTHROPIC_API_KEY` = your Claude API key (for the AI assistant tab)
   - `ANTHROPIC_MODEL` = optional, defaults to `claude-haiku-5-5`
4. Deployments > Redeploy.

## Check
- `/`            -> {"status":"success", ...}
- `/api/ping`    -> {"status":"ok","app":"VitaCare API"}
- `/api/metrics` -> 401 {"code":"AUTH_REQUIRED"} (means routes + auth work)

## Endpoints
POST /api/auth/register, POST /api/auth/login, GET|PUT /api/users/profile,
GET|POST /api/health/logs, DELETE /api/health/logs/:id,
GET|POST /api/metrics, DELETE /api/metrics/:id,
PUT /api/users/password   { currentPassword, newPassword },
POST /api/ai/chat         { messages:[{role,content}], profile?:{age,heightCm,weightKg}, language?:'en'|'si'|'ta' } -> { reply }
