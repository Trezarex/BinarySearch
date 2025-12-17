# Demo Mode - View Frontend Without Backend

Follow these steps to view the frontend UI without setting up any backend services.

## Quick Start

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Enable Demo Mode

**Option A: Temporarily change index.html (Easiest)**

Open `frontend/index.html` and change line 9 from:
```html
<script type="module" src="/src/main.jsx"></script>
```
to:
```html
<script type="module" src="/src/main-demo.jsx"></script>
```

**Option B: Create a demo .env file**

You can skip creating a `.env` file entirely for demo mode when using Option A.

### Step 3: Run the Frontend

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## What You'll See

- **Lobby Page** with mock room data
- **Create Room Dialog** (demo only - doesn't create real rooms)
- **Room Cards** showing:
  - Room titles
  - Programming languages
  - Participant counts
  - Creation times
  - Creator names

## Demo Mode Features

✅ **Working:**
- UI components and layout
- Navigation and routing
- Forms and dialogs
- Responsive design
- shadcn/ui components
- Tailwind styling

⚠️ **Mock Data Only:**
- Room list (5 sample rooms)
- User profile (Demo User)
- Creating rooms (adds to local state only)

❌ **Disabled in Demo:**
- Quick Join (shows toast message)
- Join Room (shows toast message)
- Real-time collaboration
- Chat functionality
- Voice chat
- Presence tracking
- Backend API calls

## Switching Back to Full Mode

To switch back to the full app with backend:

1. Change `index.html` back to:
   ```html
   <script type="module" src="/src/main.jsx"></script>
   ```

2. Create `.env` file with your API keys (see README.md)

3. Start the backend server

4. Restart the frontend dev server

## Customizing Demo Data

Edit `frontend/src/lib/mockData.js` to customize:
- Mock user information
- Number and details of rooms
- Participant counts
- Languages available

## Notes

- Demo mode is perfect for:
  - Viewing the UI design
  - Testing frontend changes
  - Demonstrating to stakeholders
  - Development without backend

- You'll see a yellow "Demo Mode" badge in the header
- All interactive features show toast notifications explaining they're disabled

## Next Steps

When you're ready to enable full functionality:

1. Follow the main [README.md](../README.md) setup instructions
2. Set up Liveblocks account
3. Set up Daily.co account
4. Configure backend with your API keys
5. Run both backend and frontend

Enjoy exploring the UI! 🚀
