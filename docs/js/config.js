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

// Enable persistence to allow offline capabilities
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            // The current browser does not support persistence
            console.log('Persistence not supported by browser');
        }
    }); 