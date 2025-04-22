// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB32G9TVIScnUv2m8XfwIfWqhX_hrosB9k",
    authDomain: "dailyjobs-dev.firebaseapp.com",
    projectId: "dailyjobs-dev",
    storageBucket: "dailyjobs-dev.firebasestorage.app",
    messagingSenderId: "1050184927297",
    appId: "1:1050184927297:web:85eaec0395f5bc6feb5ec0",
    measurementId: "G-W7BQ0HSNP4"    
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