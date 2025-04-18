// Initialize Firebase Auth
const auth = firebase.auth();

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('Auth state changed:', user.email, 'Verified:', user.emailVerified); // Debug log
        
        // User is signed in
        document.getElementById('userDisplayName').textContent = user.displayName || 'User';
        document.getElementById('userEmail').textContent = user.email;

        // Force email verification check
        await user.reload(); // Reload user to get latest verification status
        
        // Check if email is verified
        if (!user.emailVerified) {
            console.log('Email not verified, showing verification container'); // Debug log
            // Hide all containers except verification
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('preferences-container').classList.add('hidden');
            document.getElementById('verification-container').classList.remove('hidden');
            
            // Show verification required message
            showMessage('Please verify your email address before continuing. Check your inbox and spam folder.', false);
            return;
        }

        console.log('Email verified, showing preferences'); // Debug log
        // Email is verified, show preferences
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('verification-container').classList.add('hidden');
        document.getElementById('preferences-container').classList.remove('hidden');
        
        // Load user preferences
        await loadUserPreferences(user.uid);
    } else {
        console.log('User signed out'); // Debug log
        // User is signed out
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('verification-container').classList.add('hidden');
        document.getElementById('preferences-container').classList.add('hidden');
    }
});

// Email/Password Login
async function loginWithEmailPassword(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        await ensureUserDocument(userCredential.user);
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
        console.log('Starting signup process for:', email); // Debug log
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('User created, sending verification email'); // Debug log

        // Send email verification with complete URL
        const continueUrl = 'https://advaitlad.github.io/DailyJobs/';
        const actionCodeSettings = {
            url: continueUrl,
            handleCodeInApp: true
        };

        // Ensure verification email is sent
        await user.sendEmailVerification(actionCodeSettings);
        console.log('Verification email sent'); // Debug log
        
        // Update user profile
        await user.updateProfile({
            displayName: fullName
        });
        
        // Create user document with verified status explicitly set to false
        await ensureUserDocument(user, fullName, false);
        
        // Force a reload of the user to ensure we have the latest state
        await user.reload();
        
        showMessage('✓ Account created! Please check your email (including spam folder) to verify your account. The verification link will expire in 1 hour.', false);
        
        // Trigger auth state change to show verification container
        auth.onAuthStateChanged((user) => {
            if (user && !user.emailVerified) {
                document.getElementById('auth-container').classList.add('hidden');
                document.getElementById('preferences-container').classList.add('hidden');
                document.getElementById('verification-container').classList.remove('hidden');
            }
        });
        
    } catch (error) {
        console.error('Signup error:', error); // Debug log
        let errorMessage = 'Failed to create account. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account already exists with this email. Please sign in.';
        }
        showMessage(errorMessage, true);
        throw error;
    }
}

// Sign Out
async function signOut() {
    try {
        await auth.signOut();
        showMessage('Successfully signed out!');
    } catch (error) {
        console.error('Sign out error:', error);
        showMessage('Failed to sign out. Please try again.', true);
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

        showMessage('Preferences saved successfully!', false, true);
    } catch (error) {
        console.error('Save preferences error:', error);
        showMessage('Failed to save preferences. Please try again.', true, true);
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
        console.error('Load preferences error:', error);
        showMessage('Failed to load preferences. Please refresh the page.', true);
    }
}

// Ensure user document exists and is up to date
async function ensureUserDocument(user, fullName = null, isVerified = null) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = {
            email: user.email,
            name: fullName || user.displayName || 'User',
            lastSignIn: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: isVerified !== null ? isVerified : user.emailVerified
        };

        if (!userDoc.exists) {
            // Create new user document
            await db.collection('users').doc(user.uid).set({
                ...userData,
                preferences: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update existing user document
            await db.collection('users').doc(user.uid).update(userData);
        }
    } catch (error) {
        console.error('Error ensuring user document:', error);
        throw error;
    }
}

// Helper function to show messages with better visibility
function showMessage(message, isError = false, isPreferences = false) {
    const messageDiv = isPreferences ? 
        document.getElementById('preferences-message') : 
        document.getElementById('message');
    
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'message error' : 'message success';
    messageDiv.style.display = 'block';
    
    // Don't auto-hide verification-related messages
    if (!message.includes('verification') && !message.includes('verify')) {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Track last verification email sent time
let lastVerificationEmailSent = 0;
const VERIFICATION_EMAIL_COOLDOWN = 60000; // 60 seconds cooldown

// Helper function to show verification messages
function showVerificationMessage(message, isError = false) {
    const messageDiv = document.getElementById('verification-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = 'verification-message ' + (isError ? 'error' : 'success');
    messageDiv.style.display = 'block';
}

// Resend verification email
async function resendVerificationEmail() {
    const resendButton = document.getElementById('resend-verification');
    if (!resendButton) return;

    try {
        const user = auth.currentUser;
        if (!user) {
            showVerificationMessage('No user is currently signed in.', true);
            return;
        }

        if (user.emailVerified) {
            showVerificationMessage('Your email is already verified.', false);
            return;
        }

        // Check if enough time has passed since last email
        const now = Date.now();
        const timeElapsed = now - lastVerificationEmailSent;
        if (timeElapsed < VERIFICATION_EMAIL_COOLDOWN) {
            const secondsLeft = Math.ceil((VERIFICATION_EMAIL_COOLDOWN - timeElapsed) / 1000);
            showVerificationMessage(`Please wait ${secondsLeft} seconds before requesting another verification email.`, true);
            return;
        }

        // Update button state
        resendButton.disabled = true;
        resendButton.textContent = 'Sending...';

        // Construct the full URL including protocol
        const continueUrl = 'https://advaitlad.github.io/DailyJobs/';
        const actionCodeSettings = {
            url: continueUrl,
            handleCodeInApp: true
        };
        
        await user.sendEmailVerification(actionCodeSettings);
        lastVerificationEmailSent = now;

        // Show success message and update button
        showVerificationMessage('✓ Verification email sent! Please check your inbox and spam folder.', false);
        resendButton.textContent = 'Email Sent ✓';

        // Reset button after cooldown
        setTimeout(() => {
            resendButton.disabled = false;
            resendButton.textContent = 'Resend Verification Email';
        }, VERIFICATION_EMAIL_COOLDOWN);

    } catch (error) {
        console.error('Error sending verification email:', error);
        let errorMessage = 'Failed to send verification email. ';
        if (error.code === 'auth/too-many-requests') {
            errorMessage += 'Too many requests. Please try again in a few minutes.';
        } else if (error.code === 'auth/invalid-continue-uri') {
            errorMessage += 'Invalid redirect URL. Please contact support.';
        } else {
            errorMessage += 'Please try again later.';
        }
        showVerificationMessage(errorMessage, true);
        
        // Reset button state
        resendButton.disabled = false;
        resendButton.textContent = 'Resend Verification Email';
    }
}

// Initialize verification email functionality
document.addEventListener('DOMContentLoaded', () => {
    const resendButton = document.getElementById('resend-verification');
    if (resendButton) {
        resendButton.addEventListener('click', resendVerificationEmail);
    }
});