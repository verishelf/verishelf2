# Running VeriShelf Locally

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

This will start the Vite development server, usually on **http://localhost:5173**

### 3. Access the Dashboard

- **Landing Page (Website)**: http://localhost:5173/
- **Dashboard**: http://localhost:5173/dashboard/

## Running the Backend Server (Optional)

If you need the backend API for payment processing:

1. Create a `.env` file in the root directory with:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

2. Start the backend server:
```bash
npm run server
```

The backend will run on **http://localhost:3000**

## Development Workflow

### Frontend Development
- Run `npm run dev` to start the Vite dev server
- The React dashboard is at `/dashboard/`
- The landing page is at `/`
- Hot reload is enabled - changes will refresh automatically

### Backend Development
- Run `npm run server:dev` for auto-reload on file changes
- Or `npm run server` for standard mode

### Building for Production
```bash
npm run build
```

This creates the `dist/` folder with production-ready files.

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.). Check the terminal output for the actual URL.

### Dashboard Not Loading
- Make sure you're accessing `/dashboard/` (with trailing slash)
- Check browser console for errors
- Verify all dependencies are installed: `npm install`

### Backend Connection Issues
- Make sure the backend server is running on port 3000
- Check that `.env` file exists and has correct values
- Verify API URLs in `website/main.js` point to `http://localhost:3000/api`
