# Quick Start - View Frontend (No Backend Required)

Want to see the UI immediately without setting up any services? Follow these 3 simple steps:

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

Wait for all packages to install (this may take a few minutes).

## Step 2: Edit index.html for Demo Mode

Open `frontend/index.html` and change line 9:

**Change from:**
```html
<script type="module" src="/src/main.jsx"></script>
```

**To:**
```html
<script type="module" src="/src/main-demo.jsx"></script>
```

Save the file.

## Step 3: Run the Frontend

```bash
npm run dev
```

Then open your browser to: **http://localhost:5173**

## What You'll See

![Demo Mode](https://via.placeholder.com/800x400/f1f5f9/475569?text=BinarySearch+Demo+Mode)

You'll see:
- ✅ Full lobby UI with 5 sample rooms
- ✅ Create room dialog (adds to local state)
- ✅ Room cards with languages, participant counts, and times
- ✅ Modern, responsive design
- ✅ All shadcn/ui components in action
- ⚠️ Yellow "Demo Mode" banner at the top

**Note:** Features like joining rooms, chat, and voice are disabled in demo mode. You'll see toast notifications when clicking them.

## That's It!

You can now explore the entire UI without any backend setup.

---

## Want Full Functionality?

To enable real-time collaboration, chat, and voice:

1. Revert `index.html` back to `src="/src/main.jsx"`
2. Follow the full setup in [README.md](README.md)
3. Set up backend, Liveblocks, and Daily.co

---

## Troubleshooting

**Issue: "npm install" fails**
- Make sure you have Node.js v18+ installed
- Try: `npm cache clean --force` then `npm install` again

**Issue: Port 5173 already in use**
- Change the port in `vite.config.js`
- Or kill the process using port 5173

**Issue: Blank white screen**
- Check browser console (F12) for errors
- Make sure you edited `index.html` correctly
- Try: `npm run dev` again

**Issue: Styles not loading**
- Make sure Tailwind is installed: `npm install -D tailwindcss`
- Check that `index.css` is imported in your entry file

---

Enjoy exploring! 🎉
