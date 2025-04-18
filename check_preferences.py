import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS_PATH'))
firebase_admin.initialize_app(cred)
db = firestore.client()

def check_user_preferences(email):
    try:
        # Query users collection for the specific email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()
        
        if not query:
            print(f"No user found with email: {email}")
            return
        
        for user in query:
            user_data = user.to_dict()
            print(f"\nUser found:")
            print(f"Email: {user_data.get('email')}")
            print(f"Name: {user_data.get('name', 'Not set')}")
            print(f"Email Verified: {user_data.get('emailVerified', False)}")
            print(f"Preferences: {user_data.get('preferences', 'No preferences set')}")
            print(f"Last Updated: {user_data.get('updatedAt', 'Not available')}")
            
    except Exception as e:
        print(f"Error checking preferences: {str(e)}")

if __name__ == "__main__":
    emails_to_check = ["advaitlad@gmail.com", "advait_lad@berkeley.edu"]
    for email in emails_to_check:
        print(f"\nChecking preferences for {email}...")
        check_user_preferences(email) 