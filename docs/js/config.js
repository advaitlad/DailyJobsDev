// Your web app's Firebase configuration
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