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

// Delete Account with re-authentication
async function deleteAccount() {
    try {
        const user = auth.currentUser;
        if (!user) {
            showMessage('No user is currently signed in', true);
            return;
        }

        // First confirmation
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        // Create a modal for password input
        const modalHtml = `
            <div id="reauth-modal" class="modal">
                <div class="modal-content">
                    <h3>Confirm Account Deletion</h3>
                    <p>Please enter your password to confirm account deletion:</p>
                    <input type="password" id="reauth-password" class="form-input" />
                    <div class="modal-buttons">
                        <button id="confirm-delete" class="btn btn-danger">Delete Account</button>
                        <button id="cancel-delete" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Add modal styles if not already present
        if (!document.getElementById('modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal {
                    display: block;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                }
                .modal-content {
                    background-color: white;
                    margin: 15% auto;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 400px;
                    position: relative;
                }
                .modal-content h3 {
                    margin-bottom: 1rem;
                    color: #202124;
                }
                .modal-content p {
                    margin-bottom: 1rem;
                    color: #5f6368;
                }
                .form-input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 1rem;
                    border: 1px solid #dadce0;
                    border-radius: 4px;
                }
                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
            `;
            document.head.appendChild(styles);
        }

        // Return a promise that resolves when the user confirms or cancels
        return new Promise((resolve, reject) => {
            const modal = document.getElementById('reauth-modal');
            const confirmBtn = document.getElementById('confirm-delete');
            const cancelBtn = document.getElementById('cancel-delete');
            const passwordInput = document.getElementById('reauth-password');

            const cleanup = () => {
                modal.remove();
            };

            confirmBtn.addEventListener('click', async () => {
                const password = passwordInput.value;
                if (!password) {
                    showMessage('Please enter your password', true);
                    return;
                }

                try {
                    // Create credential and re-authenticate
                    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                    await user.reauthenticateWithCredential(credential);

                    // Delete user data from Firestore
                    await db.collection('users').doc(user.uid).delete();
                    
                    // Delete user account
                    await user.delete();
                    cleanup();
                    showMessage('Account successfully deleted', false);
                    resolve();
                } catch (error) {
                    console.error('Delete account error:', error);
                    if (error.code === 'auth/wrong-password') {
                        showMessage('Incorrect password. Please try again.', true);
                    } else {
                        showMessage('Failed to delete account. Please try again.', true);
                        cleanup();
                        reject(error);
                    }
                }
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve();
            });

            // Allow pressing Enter to confirm
            passwordInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    confirmBtn.click();
                }
            });
        });
    } catch (error) {
        console.error('Delete account error:', error);
        showMessage('Failed to delete account. Please try again.', true);
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

// Resend verification email
async function resendVerificationEmail() {
    const resendButton = document.querySelector('button[onclick="resendVerificationEmail()"]');
    
    try {
        const user = auth.currentUser;
        if (!user) {
            showMessage('No user is currently signed in.', true);
            return;
        }

        if (user.emailVerified) {
            showMessage('Your email is already verified.', false);
            return;
        }

        // Check if enough time has passed since last email
        const now = Date.now();
        const timeElapsed = now - lastVerificationEmailSent;
        if (timeElapsed < VERIFICATION_EMAIL_COOLDOWN) {
            const secondsLeft = Math.ceil((VERIFICATION_EMAIL_COOLDOWN - timeElapsed) / 1000);
            showMessage(`Please wait ${secondsLeft} seconds before requesting another verification email.`, true);
            return;
        }

        // Disable button and show sending state
        if (resendButton) {
            resendButton.disabled = true;
            resendButton.textContent = 'Sending...';
        }

        // Construct the full URL including protocol
        const continueUrl = 'https://advaitlad.github.io/DailyJobs/';
        const actionCodeSettings = {
            url: continueUrl,
            handleCodeInApp: true
        };
        
        await user.sendEmailVerification(actionCodeSettings);
        lastVerificationEmailSent = now;

        // Update button state and show success message
        if (resendButton) {
            resendButton.textContent = 'Email Sent ✓';
            setTimeout(() => {
                resendButton.disabled = false;
                resendButton.textContent = 'Resend Verification Email';
            }, VERIFICATION_EMAIL_COOLDOWN);
        }

        // Show success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'verification-message success';
        messageDiv.innerHTML = `
            <p>✓ Verification email sent!</p>
            <p class="verification-details">
                • Please check your inbox and spam folder<br>
                • The verification link will expire in 1 hour<br>
                • You can request another email in 60 seconds
            </p>
        `;

        // Add styles if not already present
        if (!document.getElementById('verification-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'verification-message-styles';
            styles.textContent = `
                .verification-message {
                    margin: 1rem 0;
                    padding: 1rem;
                    border-radius: 8px;
                    background-color: #e6f4ea;
                    color: #1e4620;
                }
                .verification-message.success {
                    border-left: 4px solid #34a853;
                }
                .verification-message p {
                    margin: 0;
                    line-height: 1.5;
                }
                .verification-details {
                    font-size: 0.9rem;
                    margin-top: 0.5rem !important;
                    color: #1e4620;
                }
            `;
            document.head.appendChild(styles);
        }

        // Insert message after the resend button
        if (resendButton) {
            const existingMessage = document.querySelector('.verification-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            resendButton.parentNode.insertBefore(messageDiv, resendButton.nextSibling);
        }

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
        showMessage(errorMessage, true);

        // Reset button state if there was an error
        if (resendButton) {
            resendButton.disabled = false;
            resendButton.textContent = 'Resend Verification Email';
        }
    }
}

// Update the Delete Account Handler in your initialization code
document.addEventListener('DOMContentLoaded', () => {
    // ... existing event listeners ...

    // Delete Account Handler
    const deleteAccountBtn = document.getElementById('delete-account');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                try {
                    await deleteAccount();
                } catch (error) {
                    // Error is already handled in deleteAccount function
                    console.error('Delete account error:', error);
                }
            }
        });
    }
});