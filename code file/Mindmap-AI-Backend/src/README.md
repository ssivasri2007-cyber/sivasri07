# MindMap AI - Your Personal Learning Navigator (StudyBuddy API)

Backend API for a study assistant. Upload notes or PDFs, then generate mind maps, summaries, quizzes and study roadmaps with Gemini AI, and track your learning progress.

## Tech Stack
Node.js, Express, MongoDB (Mongoose), JWT auth, Multer, Google Gemini

## Setup
1. Install Node 18+ and MongoDB (or use MongoDB Atlas).
2. Open a terminal in VS Code and run:

```
cd Mindmap-ai-backend
npm install
```

3. Create a `.env` file (copy `.env.example`) and set:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mindmap_ai
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
ADMIN_EMAIL=admin@example.com
```

Get a Gemini key at https://aistudio.google.com/apikey

4. Start the server:

```
npm run dev
```

The API runs at http://localhost:5000

## Folder Structure
```
study buddy/
  controller/          (request handling logic)
    adminController.js
    aiController.js
    authController.js
    materialController.js
    progressController.js
  Mindmap-ai-backend/
    middleware/        (auth.js, upload.js)
    models/            (user.js, material.js, progress.js)
    routes/            (auth, materials, ai, progress, admin)
    src/
    utils/             (db.js, gemini.js, materialContext.js, tokens.js)
    .env
    .env.example
    .gitignore
    index.js
    package.json
    README.md
```

## API Endpoints
Send `Authorization: Bearer <token>` on every request except register and login.

### Auth
| Method | Path | Body |
|---|---|---|
| POST | /api/auth/register | name, email, password |
| POST | /api/auth/login | email, password |
| GET | /api/auth/me | - |

### Materials
| Method | Path | Notes |
|---|---|---|
| POST | /api/materials | form-data: title, subject, content OR file (.pdf/.txt/.md) |
| GET | /api/materials | list your materials (optional ?subject=) |
| GET | /api/materials/:id | get one |
| PUT | /api/materials/:id | update |
| DELETE | /api/materials/:id | delete |

### AI
| Method | Path | Body |
|---|---|---|
| POST | /api/ai/mindmap/:materialId | optional ?refresh=true |
| POST | /api/ai/summary/:materialId | - |
| POST | /api/ai/quiz/:materialId | count |
| POST | /api/ai/ask/:materialId | question |
| POST | /api/ai/explain | topic, level |
| POST | /api/ai/roadmap | topic, level, days, hoursPerDay |

### Progress
| Method | Path | Body |
|---|---|---|
| GET | /api/progress | dashboard overview |
| GET | /api/progress/:materialId | progress and mastery % |
| PUT | /api/progress/:materialId | completedTopics, uncompletedTopics, studyMinutes |
| POST | /api/progress/:materialId/quiz | score, total |

### Admin (admin role only)
| Method | Path | Body |
|---|---|---|
| GET | /api/admin/stats | - |
| GET | /api/admin/users | - |
| PATCH | /api/admin/users/:id/role | role ("user" or "admin") |
| DELETE | /api/admin/users/:id | - |

The user who registers with the email set in `ADMIN_EMAIL` becomes admin.

## Quick Test
1. `POST /api/auth/register` with `{"name":"Ravi","email":"a@a.com","password":"123456"}`
2. Copy the token from the response.
3. `POST /api/materials` with a title and content.
4. `POST /api/ai/mindmap/<materialId>` to generate the mind map.

## Notes
- Controllers live in `study buddy/controller`, outside the backend folder. They import only from the backend's own models and utils, so all packages resolve from `Mindmap-ai-backend/node_modules`.
- Uploaded files are stored in `Mindmap-ai-backend/uploads` (created automatically, ignored by git).