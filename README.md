# BinarySearch - Collaborative Coding Platform

A real-time collaborative coding platform with public and private rooms, live code editing, text chat, and voice communication.

## Features

- **Authentication**: Email/password signup and login with JWT
- **Public & Private Rooms**: Create or join public rooms, or invite friends to private rooms
- **Live Code Editor**: Real-time collaborative coding with Monaco Editor synced via Liveblocks
- **Text Chat**: Room-based text chat with timestamps
- **Voice Chat**: Integrated voice communication powered by Daily.co
- **Presence**: See who's in the room with avatars and typing indicators
- **Quick Join**: Automatically find or create a room with available spots
- **Moderation**: Room owners can kick users, and anyone can report inappropriate behavior
- **Analytics**: All events logged to BigQuery for insights and monitoring

## Tech Stack

### Frontend
- **React** (JavaScript, no TypeScript)
- **Vite** (build tool)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (styling)
- **React Router** (navigation)
- **Liveblocks** (real-time collaboration)
- **Monaco Editor** (code editor)
- **Daily.co** (voice chat)

### Backend
- **FastAPI** (Python web framework)
- **JWT** (authentication)
- **Python-JOSE** (JWT handling)
- **Passlib** (password hashing)

### Infrastructure
- **Liveblocks** (presence, multiplayer editor, chat state)
- **Daily.co** (voice chat)
- **BigQuery** (analytics and event logging)

## Project Structure

```
BinarySearch/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app and routes
│   │   ├── models.py            # Pydantic models
│   │   ├── auth.py              # Authentication logic
│   │   ├── database.py          # In-memory database (MVP)
│   │   ├── config.py            # Configuration and environment variables
│   │   ├── bigquery_logger.py   # BigQuery logging client
│   │   └── moderation.py        # Kick/ban management
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── Room/            # Room-specific components
│   │   ├── lib/
│   │   │   ├── api.js           # API client
│   │   │   ├── AuthContext.jsx  # Auth state management
│   │   │   ├── liveblocks.js    # Liveblocks configuration
│   │   │   └── utils.js         # Utility functions
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Lobby.jsx        # Home page with room list
│   │   │   └── Room.jsx         # Room page with editor/chat/voice
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── bigquery/
│   └── schemas.sql              # BigQuery table schemas
└── README.md
```

## Prerequisites

- **Node.js** (v18+)
- **Python** (3.9+)
- **Google Cloud Account** (for BigQuery)
- **Liveblocks Account** (free tier available)
- **Daily.co Account** (free tier available)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd BinarySearch
```

### 2. Set Up Liveblocks

1. Go to [Liveblocks](https://liveblocks.io) and create an account
2. Create a new project
3. Get your **Public Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)

### 3. Set Up Daily.co

1. Go to [Daily.co](https://www.daily.co) and create an account
2. Get your **API Key** from the Dashboard
3. Note your **Domain** (e.g., `your-domain.daily.co`)

### 4. Set Up BigQuery (Optional for MVP)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable BigQuery API
4. Create a service account and download the JSON key file
5. Run the SQL commands in `bigquery/schemas.sql` to create tables

**Note**: BigQuery is optional for local development. The backend will run without it and just print logs to console.

### 5. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add your keys:
# - SECRET_KEY (generate a random string)
# - LIVEBLOCKS_SECRET_KEY (from Liveblocks dashboard)
# - DAILY_API_KEY (from Daily.co dashboard)
# - DAILY_DOMAIN (your Daily domain)
# - GOOGLE_CLOUD_PROJECT (your GCP project ID, optional)
# - GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON, optional)
```

Edit `.env`:
```env
SECRET_KEY=your-generated-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
LIVEBLOCKS_SECRET_KEY=sk_prod_xxxxxxxxxxxxx
DAILY_API_KEY=your_daily_api_key
DAILY_DOMAIN=your-domain.daily.co
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
BIGQUERY_DATASET=binarysearch
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
ENVIRONMENT=development
```

### 6. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your keys
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_LIVEBLOCKS_PUBLIC_KEY=pk_prod_xxxxxxxxxxxxx
```

### 7. Running the Application

#### Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m app.main
# Or use uvicorn directly:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 8. Using the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign up" to create an account
3. After signup, you'll be redirected to the lobby
4. Try these features:
   - **Quick Join**: Finds an available room or creates one
   - **Create Room**: Customize your room settings
   - **Join Room**: Click any public room card to join
5. In a room:
   - **Code Editor**: Type code - it syncs in real-time
   - **Chat Tab**: Send messages to room participants
   - **Voice Tab**: Click "Join Voice" to enable voice chat
   - **Presence**: See avatars of people in the room
   - **Report**: Report users if needed

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Rooms
- `POST /rooms` - Create a new room
- `GET /rooms` - List all public rooms
- `GET /rooms/{room_id}` - Get room details
- `POST /rooms/{room_id}/join` - Join a room
- `POST /rooms/{room_id}/leave` - Leave a room
- `GET /rooms/quick-join/find` - Quick join or create room

### Liveblocks
- `POST /liveblocks/auth` - Get Liveblocks access token for a room

### Daily.co
- `POST /daily/token` - Get Daily.co room token for voice chat

### Moderation
- `POST /moderation/kick` - Kick a user from room (owner only)
- `POST /moderation/report` - Report a user

### Analytics
- `POST /events/log` - Log an analytics event

## Security Considerations (MVP)

### Current Implementation
- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configured for frontend origin
- Liveblocks tokens generated server-side
- Daily.co tokens generated server-side
- Basic rate limiting via kick timeouts

### For Production
1. **Add Rate Limiting**: Use middleware like `slowapi` to prevent abuse
2. **HTTPS Only**: Enforce HTTPS in production
3. **Environment Variables**: Never commit `.env` files
4. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
5. **Session Management**: Consider refresh tokens
6. **Input Validation**: Add more robust validation
7. **CORS**: Restrict to production domain only
8. **Secrets Rotation**: Regularly rotate API keys and secrets
9. **Monitoring**: Add logging and alerting for suspicious activity
10. **Backup**: Regular database backups

## Deployment

### Backend Deployment

**Option 1: Railway**
1. Create account at [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy from `backend` directory

**Option 2: Heroku**
1. Create `Procfile` in backend directory:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Deploy using Heroku CLI

**Option 3: Google Cloud Run**
1. Create `Dockerfile` in backend directory
2. Deploy using `gcloud run deploy`

### Frontend Deployment

**Option 1: Vercel** (Recommended)
1. Create account at [Vercel](https://vercel.com)
2. Connect GitHub repository
3. Set build directory to `frontend`
4. Add environment variables
5. Deploy

**Option 2: Netlify**
1. Create account at [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Production Checklist

- [ ] Update `FRONTEND_URL` in backend `.env` to production domain
- [ ] Update `VITE_API_URL` in frontend `.env` to production API URL
- [ ] Enable HTTPS for both frontend and backend
- [ ] Update CORS settings in `backend/app/main.py`
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Configure BigQuery with production credentials
- [ ] Set up monitoring and logging
- [ ] Add rate limiting middleware
- [ ] Review and test all security settings
- [ ] Set up automated backups
- [ ] Configure CDN for frontend assets

## Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Find and kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

**BigQuery authentication error**
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON key file
- Check that BigQuery API is enabled in GCP
- Verify service account has BigQuery Data Editor permissions

**Liveblocks connection error**
- Verify `LIVEBLOCKS_SECRET_KEY` is correct
- Check that key has proper permissions
- Ensure room name doesn't contain special characters

### Frontend Issues

**White screen / won't load**
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Ensure backend is running
- Clear browser cache and reload

**Liveblocks not connecting**
- Verify `VITE_LIVEBLOCKS_PUBLIC_KEY` is correct
- Check network tab for auth endpoint errors
- Ensure backend Liveblocks endpoint is working

**Voice chat not working**
- Check Daily.co credentials in backend
- Verify browser has microphone permissions
- Check browser console for Daily.co errors
- Ensure Daily.co domain is correct

## Future Enhancements

- [ ] Code execution engine (run code and see output)
- [ ] Multiple file support per room
- [ ] Room persistence (save code to database)
- [ ] Screen sharing
- [ ] Video chat (upgrade from audio-only)
- [ ] Problem library integration
- [ ] Syntax highlighting for more languages
- [ ] Dark mode toggle
- [ ] Mobile responsive design improvements
- [ ] User profiles and avatars
- [ ] Friend system
- [ ] Room history and analytics dashboard
- [ ] AI code suggestions
- [ ] Collaborative debugging tools

## License

MIT License - feel free to use this for your own projects!

## Support

For issues and questions:
- Check this README first
- Review the code comments
- Check browser console and backend logs
- Verify all environment variables are set correctly

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with React, FastAPI, Liveblocks, and Daily.co
