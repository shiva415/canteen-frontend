# Canteen Frontend

React + Vite single-page application for Smart Campus Canteen Ordering & Pre-Booking System.

## Features
- Student registration & login with secure sessions
- Dynamic digital menu with live stock availability
- Cart & pickup time-slot selection
- Dynamic UPI QR code payment generation (Google Pay, PhonePe, Paytm)
- Real-time token tracking & order status updates
- Admin dashboard: update prices, stock, order status, and view analytics
- Configurable backend API URL with instant connection test

## Deployment on Render
1. Create a **Static Site** connected to `https://github.com/shiva415/canteen-frontend`.
2. Configure Settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://<your-canteen-backend-name>.onrender.com`

## Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.
