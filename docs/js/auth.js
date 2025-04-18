// Initialize Firebase Auth
const auth = firebase.auth();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        document.getElementById('userDisplayName').textContent = user.displayName || 'User';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('profilePhoto').src = user.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-user.png';
        
        // Show preferences container and hide auth container
        document.getElementById('preferences-container').classList.remove('hidden');
        document.getElementById('auth-container').classList.add('hidden');
        
        // Load user preferences
        loadUserPreferences(user.uid);
    } else {
        // User is signed out
        document.getElementById('preferences-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    }
});

// Email/Password Login
async function loginWithEmailPassword(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Successfully logged in!');
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Failed to log in. Please try again.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        }
        showMessage(errorMessage, true);
    }
}

// Email/Password Sign Up
async function signupWithEmailPassword(fullName, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: fullName
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: fullName,
            email: email,
            preferences: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('Account created successfully!');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        // Check if we're running in a supported environment
        if (!window.location.hostname.includes('github.io') && 
            !window.location.hostname.includes('localhost') && 
            !window.location.hostname.includes('127.0.0.1')) {
            throw new Error('Google Sign-In requires running on a web server. Please access the site through GitHub Pages.');
        }

        // Configure Google Sign-In
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Check if user document exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                preferences: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showMessage('Successfully signed in with Google!');
    } catch (error) {
        console.error('Google sign in error:', error);
        let errorMessage = 'Failed to sign in with Google. Please try again.';
        
        if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
            errorMessage = 'Please access the site through GitHub Pages or a web server.';
        }
        
        showMessage(errorMessage, true);
    }
}

// Sign Out
async function signOut() {
    try {
        await auth.signOut();
        showMessage('Successfully signed out!');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Password Reset
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Delete Account
async function deleteAccount() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user is currently signed in');

        // Delete user data from Firestore
        await db.collection('users').doc(user.uid).delete();
        
        // Delete user account
        await user.delete();
        showMessage('Account successfully deleted');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Save user preferences
async function saveUserPreferences(preferences) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user is currently signed in');

        await db.collection('users').doc(user.uid).set({
            preferences: preferences,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        showMessage('Preferences saved successfully!');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Load user preferences
async function loadUserPreferences(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.preferences) {
                // Update UI checkboxes based on saved preferences
                const companies = document.querySelectorAll('.company-checkbox');
                companies.forEach(checkbox => {
                    checkbox.checked = data.preferences.includes(checkbox.value);
                });
            }
        }
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Helper function to show messages
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'message error' : 'message success';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}