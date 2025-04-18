// List of companies (same as in greenhouse_scraper.py)
const companies = [
    'pinterest', 'samsara', 'carvana', 'spacex', 'mongodb', 'datadog',
    'robinhood', 'brex', 'stripe', 'airbnb', 'dropbox', 'asana',
    'squarespace', 'instacart', 'beyondfinance', 'lyft', 'udemy',
    'wrike', 'okta', 'yotpo', 'upwork', 'groupon', 'databricks',
    'twilio', 'roblox', 'esri', 'toast', 'affirm', 'airtable',
    'amplitude', 'apptronik', 'buzzfeed', '23andme', 'braze',
    'algolia', 'airbyte', 'notion', 'figma', 'retool', 'faire',
    'benchling', 'vercel', 'snyk', 'hashicorp', 'postman',
    'gitlab', 'carta', 'gusto', 'intercom', 'netlify', 'sentry',
    'webflow', 'discord', 'fivetran', 'clickhouse', 'cockroach'
];

// Populate companies grid
function populateCompanies() {
    const companiesGrid = document.getElementById('companies-grid');
    
    companies.forEach(company => {
        const label = document.createElement('label');
        label.className = 'company-checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = company;
        checkbox.className = 'company-checkbox';
        
        const span = document.createElement('span');
        span.textContent = company.charAt(0).toUpperCase() + company.slice(1);
        
        label.appendChild(checkbox);
        label.appendChild(span);
        companiesGrid.appendChild(label);
    });
}

// Handle form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const selectedCompanies = Array.from(document.querySelectorAll('input[name="companies"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedCompanies.length === 0) {
        alert('Please select at least one company');
        return;
    }
    
    try {
        // Add user to Firestore
        await db.collection('users').add({
            name,
            email,
            companies: selectedCompanies,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success message
        document.getElementById('successMessage').classList.remove('hidden');
        document.getElementById('signupForm').reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById('successMessage').classList.add('hidden');
        }, 5000);
        
    } catch (error) {
        console.error('Error adding user:', error);
        alert('There was an error processing your request. Please try again.');
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateCompanies();

    // Toggle between signup and login forms
    const authToggle = document.getElementById('authToggle');
    if (authToggle) {
        authToggle.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-btn')) {
                document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const formToShow = e.target.dataset.form;
                if (formToShow === 'signup') {
                    document.getElementById('signupForm').classList.remove('hidden');
                    document.getElementById('loginForm').classList.add('hidden');
                } else {
                    document.getElementById('loginForm').classList.remove('hidden');
                    document.getElementById('signupForm').classList.add('hidden');
                }
            }
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form elements
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');
            const confirmPasswordInput = document.getElementById('signupConfirmPassword');

            // Validate form elements exist
            if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
                showMessage('Form elements not found. Please refresh the page.', true);
                return;
            }

            // Get form values
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields', true);
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', true);
                return;
            }

            try {
                await signupWithEmailPassword(name, email, password);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form elements
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            // Validate form elements exist
            if (!emailInput || !passwordInput) {
                showMessage('Form elements not found. Please refresh the page.', true);
                return;
            }

            // Get form values
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate inputs
            if (!email || !password) {
                showMessage('Please fill in all fields', true);
                return;
            }

            try {
                await loginWithEmailPassword(email, password);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    // Forgot Password Handler
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('loginEmail');
            if (!emailInput) {
                showMessage('Email input not found. Please refresh the page.', true);
                return;
            }

            const email = emailInput.value.trim();
            if (!email) {
                showMessage('Please enter your email address first.', true);
                return;
            }

            try {
                await resetPassword(email);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    // Save Preferences Handler
    const savePreferencesBtn = document.getElementById('save-preferences');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', async () => {
            try {
                const selectedCompanies = Array.from(document.querySelectorAll('.company-checkbox:checked'))
                    .map(checkbox => checkbox.value);
                await saveUserPreferences(selectedCompanies);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    // Sign Out Handler
    const signOutBtn = document.getElementById('sign-out');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                await signOut();
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    // Delete Account Handler
    const deleteAccountBtn = document.getElementById('delete-account');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                try {
                    await deleteAccount();
                } catch (error) {
                    showMessage(error.message, true);
                }
            }
        });
    }

    // Google Sign-In Buttons
    document.querySelectorAll('.google-btn').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await signInWithGoogle();
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    });
}); 