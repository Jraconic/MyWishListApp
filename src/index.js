import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- CONFIGURATION & FIREBASE SETUP ---

const isCanvasEnvironment = typeof __app_id !== 'undefined';
const appId = isCanvasEnvironment ? __app_id : 'default-app-id';
const initialAuthToken = isCanvasEnvironment ? __initial_auth_token : null;

// Your live Firebase configuration (using your keys)
const firebaseConfig = {
  apiKey: "AIzaSyBIOV8rVBPWz4uUuuyTrV-cH6Alylui_54", 
  authDomain: "my-wishlist-tracker.firebaseapp.com",
  projectId: "my-wishlist-tracker", 
  storageBucket: "dummy-bucket.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefgh1234567890"
};

// Initialize Firebase App and services
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.error("CRITICAL ERROR: Failed to initialize Firebase services.", e);
  app = null;
  db = null;
  auth = null;
}

// 5. RENDER LOGIC: This mounts the App component to the HTML.
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    // Pass the initialized Firebase tools and IDs to the App component
    root.render(
      <App 
        db={db} 
        auth={auth} 
        appId={appId} 
        initialAuthToken={initialAuthToken} 
        isCanvasEnvironment={isCanvasEnvironment} 
      />
    );
  } else {
    console.error("The HTML element with ID 'root' was not found. Cannot render the application.");
  }
} catch (error) {
  console.error("Failed to render the application. Check the React/ReactDOM setup.", error);
}