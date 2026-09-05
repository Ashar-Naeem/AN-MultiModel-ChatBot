# AN Multimodal AI Studio

A premium, full-stack AI chatbot powered by **Groq** (ultra-fast LPU inference) and **Google Gemini**, built with React + Vite frontend and Express.js backend. Features real-time streaming, multimodal image support, multi-user authentication via OTP email, and automatic seamless AI provider failover.

---

## ✨ Features

- ⚡ **Groq-first ultra-fast responses** — Powered by Groq LPU hardware (Qwen, Llama, GPT-OSS, and more)
- 🔄 **Automatic AI provider failover** — If one model fails, it silently switches to the next best alternative (no errors shown to users)
- 🖼️ **Multimodal support** — Upload images via click, drag-and-drop, or paste from clipboard
- 🌊 **Real-time streaming** — Token-by-token SSE streaming with stop generation support
- 💬 **Multi-chat sessions** — Create, rename, delete, and switch between separate conversations
- 👤 **User authentication** — Email OTP-based login/signup with JWT session management
- 📱 **Mobile-optimized** — Fully responsive UI with touch gestures and safe area support
- 🎨 **Premium dark UI** — Cosmic glassmorphism design with animated gradients
- 🔒 **Per-user data isolation** — Chat history scoped to each authenticated user's account
- 📤 **Export chats** — Download conversations as JSON

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Vanilla CSS |
| Backend | Express.js (Node.js) |
| AI APIs | Groq SDK, Google Gemini AI |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + Nodemailer OTP via Gmail |
| Deployment | Vercel (serverless functions) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Groq API key → [console.groq.com](https://console.groq.com)
- Google Gemini API key → [aistudio.google.com](https://aistudio.google.com)
- Gmail account with App Password enabled

### 1. Clone & Install

```bash
git clone https://github.com/your-username/an-ai-studio.git
cd an-ai-studio

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the **root directory**:

```env
# Groq AI (Primary Provider — ultra-fast)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_MODEL_FAST=qwen/qwen3.8-27b

# Google Gemini AI (Fallback Provider)
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ANchatbot?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Gmail SMTP for OTP emails
# 1. Enable 2FA on your Google Account
# 2. Go to myaccount.google.com/apppasswords → create a 16-char App Password
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Server port (optional, defaults to 5000)
PORT=5000
```

### 3. Run in Development

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend (with HMR proxy to backend)
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📦 Deploy to Vercel

### Prerequisites
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- Or deploy via [vercel.com](https://vercel.com) dashboard (GitHub import)

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2 — Import Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`

### Step 3 — Set Environment Variables

In the Vercel project dashboard → **Settings → Environment Variables**, add all variables from your `.env` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key |
| `GROQ_MODEL` | ✅ Yes | Primary Groq model ID |
| `GROQ_MODEL_FAST` | ✅ Yes | Fast fallback Groq model ID |
| `GEMINI_API_KEY` | ⬜ Optional | Google Gemini API key |
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | JWT signing secret |
| `EMAIL_USER` | ⬜ Optional | Gmail for OTP emails |
| `EMAIL_PASS` | ⬜ Optional | Gmail App Password |

### Step 4 — Deploy

```bash
vercel --prod
```

Or click **Deploy** on the Vercel dashboard. Your app will be live at `https://your-project.vercel.app`.

---

## 🔧 How AI Failover Works

The backend implements a **silent multi-provider failover chain**:

```
User Request
    ↓
Primary Model (e.g., Qwen 3.8 27B on Groq)
    ✓ Success → Stream to user
    ✗ Fail → 
        ↓
Fast Fallback Model (e.g., Qwen 3.8 27B Fast)
        ✓ Success → Stream to user
        ✗ Fail →
            ↓
Gemini Fallback (e.g., Gemini 3.5 Flash Lite)
                ✓ Success → Stream to user
                ✗ All failed → Error shown
```

- **No errors are shown** to users during automatic failovers
- Failover is **seamless and instant**
- Works for both streaming and non-streaming responses

---

## 📁 Project Structure

```
an-ai-studio/
├── api/
│   └── server.js          # Vercel serverless Express handler
├── frontend/
│   ├── src/
│   │   ├── components/    # React UI components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StarterCards.jsx
│   │   │   └── UserProfileMenu.jsx
│   │   ├── App.jsx        # Main app state & routing
│   │   ├── index.css      # Global styles & design tokens
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── middleware/            # Express middleware
├── models/               # Mongoose schemas
├── routes/
│   └── auth.js           # Login/signup/OTP routes
├── services/
│   └── emailService.js   # Nodemailer OTP service
├── server.js             # Local dev Express server
├── vercel.json           # Vercel deployment config
├── package.json
└── .env                  # Never commit this!
```

---

## 🤖 Supported AI Models

### Groq Models (Ultra-Fast LPU)
| Model ID | Description |
|----------|-------------|
| `qwen/qwen3.8-27b` | Qwen 3.8 27B — Recommended, fastest |
| `qwen/qwen3.6-27b` | Qwen 3.6 27B — Balanced |
| `openai/gpt-oss-120b` | GPT OSS 120B — Most capable |
| `openai/gpt-oss-20b` | GPT OSS 20B — Fast |
| `groq/compound` | Compound multi-agent system |

### Google Gemini Models (Multimodal)
| Model ID | Description |
|----------|-------------|
| `gemini-3.5-flash-lite` | Fastest Gemini, ~1s response |
| `gemini-3.6-flash` | Deep reasoning, higher latency |
| `gemini-pro-latest` | Complex logic & multimodal |

---

## 🔐 Authentication Flow

1. User enters email → Backend sends 6-digit OTP via Gmail
2. User enters OTP → JWT token issued (valid for 7 days)
3. JWT stored in `localStorage` → Auto-restored on page refresh
4. Chat history is **scoped per user** — different users see only their own chats

---

## 📱 Mobile Support

- Fully optimized for iOS and Android browsers
- Safe area insets support (notch/home bar)
- Touch-friendly tap targets (44px minimum)
- Prevents iOS Safari zoom on input focus
- Responsive sidebar (auto-hides on mobile)
- Dynamic viewport height (`dvh`) for mobile browsers

---

## 🧑‍💻 Developer

Built by **Ashar Naeem** — AN AI Studio

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
