# SkyRecover - Flight Disruption Recovery Platform

## Project Overview
SkyRecover is an automated flight disruption recovery platform built for the 22North Product Engineering Challenge. It streamlines the rebooking and compensation process for passengers whose flights have been delayed or cancelled. Instead of waiting in long queues or on hold with customer service, SkyRecover instantly analyzes flight availability, airline policies, and loyalty tiers to offer personalized, AI-driven recovery recommendations right on the user's device.

## Technology Stack
- **Frontend**: React, Vite, TailwindCSS, Jotai (State Management), React-Joyride (User Journey)
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite managed by Prisma ORM
- **AI Integration**: Google Gemini Flash API

## Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Database & Backend Setup
Navigate to the backend directory, install dependencies, and initialize the database:
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
```
Create a `.env` file in the `backend` directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
Start the backend server:
```bash
npm run dev
```
*The backend will run on http://localhost:3001*

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on http://localhost:5173*

## Demo Credentials & Test Data
The application is pre-seeded with dummy passenger data for evaluation purposes.
Use the following credentials to log in:
- **Email**: `john.doe@example.com`
- **Password**: `password123`

*Note: The database contains pre-configured flights (e.g., flight SJ238) and active bookings tied to this user to demonstrate the recovery flow.*

## Assumptions & Known Limitations
- **Simulated PSS**: Real-world airline Passenger Service Systems are complex. We assume a simplified relational model for flights and bookings.
- **Admin Side Pending**: To simulate real-world constraints where a human or automated backend process must approve a reschedule/refund, the UI successfully places the user in a "Pending Approval" state upon request. A dedicated Admin UI is out of scope for this prototype.
- **Environment**: The solution is built for rapid local deployment using SQLite. In a production environment, PostgreSQL would be used.

## Future Enhancements
- Integration with external live flight status APIs (e.g., FlightAware).
- Real-time WebSocket notifications.
- Complete Admin Dashboard for airline staff to process pending requests.
