# 🎓 Al Shamail - Quick Start Guide

## ⚡ Fastest Way to Start

### **Windows**
Simply run: **`start.bat`**

This will:
- Check Node.js and pnpm are installed
- Start the development server
- Open http://localhost:5173/

### **Mac/Linux**
```bash
pnpm start
```

---

## 📂 Project Structure

```
Alshamail/
├── start.bat                  ← 🎯 START HERE (Windows)
├── DEPLOYMENT_GUIDE.md        ← Vercel & Render setup
├── SMOOTHNESS_GUIDE.md        ← Performance optimizations
├── artifacts/
│   ├── al-shamail/           ← Frontend React App
│   │   ├── src/
│   │   │   ├── pages/        ← All page components
│   │   │   ├── components/   ← Reusable components
│   │   │   ├── lib/
│   │   │   │   ├── brand.ts       ← Design tokens
│   │   │   │   ├── mock-api.ts    ← API hooks
│   │   │   │   └── smooth.tsx     ← 🆕 Smooth animations
│   │   │   └── App.tsx       ← Main app component
│   │   └── package.json
│   ├── api-server/           ← Backend Express.js
│   │   ├── src/
│   │   │   ├── app.ts        ← Express setup
│   │   │   ├── routes/       ← API endpoints
│   │   │   └── lib/          ← Utilities
│   │   └── package.json
│   └── mockup-sandbox/       ← Development only
├── lib/
│   ├── api-client-react/     ← React hooks for API
│   ├── api-spec/             ← OpenAPI spec
│   ├── api-zod/              ← Validation schemas
│   └── db/                   ← Database config
└── package.json              ← Root workspace config
```

---

## 🚀 Commands

### Development
```bash
pnpm start           # Start frontend on http://localhost:5173/
pnpm start:api       # Start API on http://localhost:3001/
pnpm start:web       # Same as pnpm start
```

### Building
```bash
pnpm build           # Build all packages
pnpm typecheck       # Check TypeScript types
```

### Maintenance
```bash
pnpm install         # Install dependencies
pnpm up              # Update dependencies
pnpm audit           # Check for security issues
```

---

## 🌐 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173/ | React app |
| API | http://localhost:3001/ | Backend server |
| API Docs | http://localhost:3001/api/docs | Swagger UI (if enabled) |

---

## ✨ New Features

### 🎨 Smooth Transitions
- **Skeleton screens**: Beautiful loading placeholders
- **Fade-in animations**: Smooth content transitions
- **Slide transitions**: Carousel animations
- **Tab switching**: No flicker, instant feedback

**Usage:**
```tsx
import { SmoothTabContent, SkeletonCard } from "@/lib/smooth";

<SmoothTabContent isLoading={loading} skeleton={<SkeletonCard />}>
  {content}
</SmoothTabContent>
```

### 📊 Instant Dashboard Loading
- React Query caches data for 60 seconds
- Route prefetching for instant navigation
- No unnecessary re-renders

### 🚀 One-Click Deployment
- **Frontend**: Push to GitHub → Auto-deploys to Vercel
- **Backend**: Push to GitHub → Auto-deploys to Render
- See `DEPLOYMENT_GUIDE.md` for details

---

## 📝 File Created/Modified

| File | Purpose |
|------|---------|
| `start.bat` | ✨ Easy Windows startup |
| `lib/smooth.tsx` | ✨ Smooth UI components |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `SMOOTHNESS_GUIDE.md` | Performance best practices |

---

## 🎯 Next Steps

1. **Start the app**: Run `start.bat`
2. **Test smoothness**: Navigate between tabs and pages
3. **Deploy frontend**: `DEPLOYMENT_GUIDE.md` → Vercel section
4. **Deploy backend**: `DEPLOYMENT_GUIDE.md` → Render section
5. **Optimize more**: See `SMOOTHNESS_GUIDE.md`

---

## 🐛 Troubleshooting

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### "Port 5173 already in use"
```bash
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### "Cannot find module"
```bash
pnpm install
```

### Performance issues?
See `SMOOTHNESS_GUIDE.md` for optimization tips.

---

## 📖 Documentation

- **API Routes**: Check `artifacts/api-server/src/routes/`
- **Components**: Check `artifacts/al-shamail/src/components/`
- **Pages**: Check `artifacts/al-shamail/src/pages/`
- **Styling**: See `lib/brand.ts` for design tokens

---

## 🎓 Academy Features

- 📚 **Courses**: Browse and enroll in courses
- 👨‍🎓 **Dashboard**: Student progress and stats
- 📝 **Lessons**: View course lessons and materials
- 🎯 **Quizzes**: Take quizzes and get feedback
- 🏆 **Badges**: Earn achievement badges
- 🏅 **Leaderboard**: Compete with other students
- 💬 **Messages**: Chat with teachers and peers
- 📅 **Schedule**: View class schedule
- 👤 **Profile**: Manage your profile

---

## 🔐 Authentication

- Login required for all dashboards
- Session stored in browser cookies
- Automatic logout on inactive session

---

## 📧 Support

For issues or questions, check the docs or reach out to the development team.

Happy learning! 🎉
