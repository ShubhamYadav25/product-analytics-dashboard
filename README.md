# Product Analytics Dashboard

A full-stack interactive dashboard for visualizing feature usage analytics with self-tracking capabilities.

## Live Demo

- Frontend: [https://your-app.vercel.app](https://your-app.vercel.app)
- Backend API: [https://your-api.onrender.com](https://your-api.onrender.com)

## Features

- 🔐 JWT Authentication (Login/Register)
- 📊 Interactive Bar Chart for feature usage
- 📈 Line Chart for time-based trends
- 🔍 Advanced filtering (Date Range, Age, Gender)
- 🍪 Persistent filter preferences via cookies
- 📝 Self-tracking of all user interactions
- 🌐 Fully responsive design

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React.js
- Recharts for data visualization
- React Router for navigation
- Axios for API calls
- React Cookie for preference persistence
- TailwindCSS for styling

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (or Docker)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/product-analytics-dashboard.git
cd product-analytics-dashboard