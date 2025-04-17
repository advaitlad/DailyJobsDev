// Firebase Configuration
// To set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Click on the web icon (</>) to add a web app
// 4. Copy the configuration object and replace the values below
// 5. Enable Firestore Database in the Firebase Console
// 6. Set up security rules for Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCs3SBzlY9Ak2NQUemLenB4ZNDdvQjBKic",
    authDomain: "dailyjobs-7b52e.firebaseapp.com",
    projectId: "dailyjobs-7b52e",
    storageBucket: "dailyjobs-7b52e.firebasestorage.app",
    messagingSenderId: "162272281123",
    appId: "1:162272281123:web:e958f79918fa844303e796",
    measurementId: "G-MMFNK743L2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore(); 