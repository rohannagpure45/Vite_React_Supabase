# Health Assistant - Firebase Migration

This project has been migrated from Supabase to Firebase! 

## Features

- 🔥 **Firebase Authentication** - Email/password authentication with Firebase Auth
- 💬 **AI Health Assistant** - GPT-powered health consultation chat
- 📱 **Biometric Integration** - Mock biometric data display
- 🗺️ **Location Services** - Google Maps integration for finding healthcare providers
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn UI
- ⚡ **Vite + React** - Fast development and optimized builds

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (you can configure security rules later)
4. Choose a location for your database

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. In the **General** tab, scroll down to "Your apps"
3. Click the web icon `</>` to add a web app
4. Register your app and copy the configuration object

### 5. Environment Variables

Create a `.env` file in the project root with your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Other API Keys (optional)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_ENABLE_HEALTHKIT=false
```

## Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/ui/          # Shadcn UI components
├── contexts/
│   └── AuthContext.tsx    # Firebase Authentication context
├── lib/
│   └── firebase.ts        # Firebase configuration
├── pages/
│   ├── Dashboard.tsx      # Main dashboard with health chat
│   ├── Login.tsx          # Login page
│   ├── Register.tsx       # Registration page
│   ├── ResetPassword.tsx  # Password reset
│   └── Home.tsx           # Landing page
├── services/
│   ├── gpt.ts            # OpenAI GPT integration
│   ├── healthKit.ts      # Mock health data
│   └── mockBiometrics.ts # Sample biometric data
└── App.tsx                # Main app with routing
```

## What Changed in Migration

### From Supabase to Firebase:
- ✅ Authentication migrated to Firebase Auth
- ✅ Ready for Firestore database (schema can be implemented as needed)
- ✅ Error handling updated for Firebase Auth errors
- ✅ Environment variables updated
- ✅ All Supabase dependencies removed

### Firebase Services Available:
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database (ready to use)
- **Firebase Storage** - File storage (if needed)
- **Firebase Hosting** - Easy deployment

## Deployment

You can easily deploy this to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Build and deploy
npm run build
firebase deploy
```

## License

This project is for educational purposes.
