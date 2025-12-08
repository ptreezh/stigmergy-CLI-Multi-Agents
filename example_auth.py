"""
Example usage of the authentication module.
"""

import sys
import os

# Add the src directory to the path so we can import the auth module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.auth import UserAuthenticator, authenticate_and_get_token, AuthenticationError


def main():
    """Demonstrate the authentication module usage."""
    print("Authentication Module Usage Example")
    print("=" * 35)
    
    # Create an authenticator instance
    auth = UserAuthenticator()
    
    # Register a new user
    print("\n1. Registering a new user...")
    try:
        success = auth.register_user("alice", "mypassword123")
        if success:
            print("   User 'alice' registered successfully")
        else:
            print("   Failed to register user 'alice' (may already exist)")
    except ValueError as e:
        print(f"   Registration error: {e}")
        return
    
    # Authenticate the user
    print("\n2. Authenticating the user...")
    success, result = authenticate_and_get_token(auth, "alice", "mypassword123")
    
    if success:
        session_token = result
        print(f"   Authentication successful!")
        print(f"   Session token: {session_token}")
    else:
        print(f"   Authentication failed: {result}")
        return
    
    # Validate the session
    print("\n3. Validating the session...")
    username = auth.validate_session(session_token)
    if username:
        print(f"   Session is valid for user: {username}")
    else:
        print("   Invalid session")
    
    # Attempt to authenticate with wrong password
    print("\n4. Attempting authentication with wrong password...")
    try:
        auth.authenticate_user("alice", "wrongpassword")
        print("   ERROR: Should not have succeeded!")
    except AuthenticationError:
        print("   Correctly rejected wrong password")
    
    # Logout
    print("\n5. Logging out...")
    success = auth.logout(session_token)
    if success:
        print("   Logout successful")
    else:
        print("   Logout failed")
    
    # Try to validate session after logout
    print("\n6. Checking session after logout...")
    username = auth.validate_session(session_token)
    if username is None:
        print("   Session correctly invalidated after logout")
    else:
        print("   ERROR: Session still valid after logout")
    
    print("\nExample completed successfully!")


if __name__ == "__main__":
    main()