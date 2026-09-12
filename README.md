# Agriculture 2.0 - Crop Disease & Pest Detection System

A full-stack application built with React, Node.js, Express, and MongoDB that leverages OpenRouter AI and OpenWeather API to analyze crop images, detect diseases, and provide actionable recommendations based on environmental factors.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT and bcrypt.
- **AI Crop Analysis**: Upload crop images to receive AI-powered diagnosis using OpenRouter (Gemini Pro Vision).
- **Environmental Context**: Automatically fetches real-time weather data for the user's location via OpenWeather API to improve AI recommendations.
- **Dashboard Statistics**: Dynamic dashboard showing user's scan history, health ratio, and high-risk fields.
- **Secure File Uploads**: Image processing via Multer on the backend.

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite)
- React Router DOM
- Axios for API requests
- Context API for State Management
- Vanilla CSS with Lucide React Icons

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Multer (File Uploads)

**External Services:**
- OpenRouter API (AI Vision Models)
- OpenWeather API (Weather Data)

## 📁 Folder Structure

```
project-root/
│
├── client/                 # React Frontend Application (formerly 'frontend')
│   ├── public/
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, Navbar, Cards)
│   │   ├── context/        # AuthContext for global state
│   │   ├── pages/          # Dashboard, DiseaseDetection, Login, Signup
│   │   ├── services/       # api.js for Axios requests
│   │   ├── styles/         # Vanilla CSS stylesheets
│   │   ├── App.jsx         # Main routing and layout
│   │   └── main.jsx
│   └── .env                # VITE_API_URL
│
├── server/                 # Node.js Backend Application
│   ├── config/             # Database connection
│   ├── controllers/        # Route logic (auth, scans, weather)
│   ├── middleware/         # Auth validation and Multer config
│   ├── models/             # Mongoose schemas (User, Scan)
│   ├── routes/             # Express API routes
│   ├── services/           # External API integration (OpenRouter, Weather)
│   ├── uploads/            # Temporary storage for uploaded images
│   ├── server.js           # Express app entry point
│   └── .env                # Backend secrets and API keys
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. MongoDB Setup
Create a free cluster on MongoDB Atlas and get your connection string. Replace `<password>` with your database user password.

### 2. API Keys
- Get an API key from [OpenRouter](https://openrouter.ai/) for the AI analysis.
- Get an API key from [OpenWeatherMap](https://openweathermap.org/api) for weather data.

### 3. Backend Setup
Navigate to the server directory, install dependencies, and setup your `.env` file.

```bash
cd server
npm install

# Create a .env file and add the following:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

Start the backend development server:
```bash
npm run dev
```

### 4. Frontend Setup
Navigate to the frontend/client directory, install dependencies, and setup your `.env` file.

```bash
cd client
npm install

# Create a .env file and add the following:
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user and receive token
- `GET /api/auth/me` - Get current logged in user (Protected)

### Scans & AI Analysis
- `POST /api/scans/analyze` - Upload image + data for AI analysis (Protected)
- `GET /api/scans` - Get all scans for logged in user (Protected)
- `GET /api/scans/:id` - Get a specific scan (Protected)
- `DELETE /api/scans/:id` - Delete a scan (Protected)

### Weather
- `GET /api/weather` - Fetch weather data via lat/lon or city name

## 📄 Example Requests

### Login (POST `/api/auth/login`)
```json
{
  "email": "farmer@example.com",
  "password": "password123"
}
```

### Analyze Scan (POST `/api/scans/analyze` - FormData)
- `image`: [File Upload]
- `cropType`: "Tomato"
- `cropStage`: "Vegetative"
- `soilCondition`: "Normal"
