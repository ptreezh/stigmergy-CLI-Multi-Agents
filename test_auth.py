"""
Test file for the authentication module.
"""

import sys
import os

# Add the src directory to the path so we can import the auth module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from auth import UserAuthenticator, AuthenticationError


def test_authentication():
    """Test the authentication functionality."""
    print("Testing authentication module...")
    
    # Create an authenticator instance
    auth = UserAuthenticator()
    
    # Test user registration
    print("1. Testing user registration...")
    try:
        success = auth.register_user("testuser", "securepassword123")
        assert success, "User registration should succeed"
        print("   PASS: User registered successfully")
    except Exception as e:
        print(f"   FAIL: Registration failed: {e}")
        return False
    
    # Test duplicate user registration
    print("2. Testing duplicate user registration...")
    try:
        success = auth.register_user("testuser", "anotherpassword")
        assert not success, "Duplicate registration should fail"
        print("   PASS: Duplicate registration correctly rejected")
    except Exception as e:
        print(f"   FAIL: Unexpected error in duplicate registration: {e}")
        return False
    
    # Test user authentication
    print("3. Testing user authentication...")
    try:
        token = auth.authenticate_user("testuser", "securepassword123")
        assert isinstance(token, str) and len(token) > 0, "Should return a valid token"
        print("   PASS: Authentication successful")
    except Exception as e:
        print(f"   FAIL: Authentication failed: {e}")
        return False
    
    # Test invalid credentials
    print("4. Testing invalid credentials...")
    try:
        auth.authenticate_user("testuser", "wrongpassword")
        print("   FAIL: Should have failed with wrong password")
        return False
    except AuthenticationError:
        print("   PASS: Correctly rejected wrong password")
    except Exception as e:
        print(f"   FAIL: Unexpected error: {e}")
        return False
    
    # Test session validation
    print("5. Testing session validation...")
    try:
        token = auth.authenticate_user("testuser", "securepassword123")
        username = auth.validate_session(token)
        assert username == "testuser", "Session should be valid for the user"
        print("   PASS: Session validation successful")
    except Exception as e:
        print(f"   FAIL: Session validation failed: {e}")
        return False
    
    # Test logout
    print("6. Testing logout...")
    try:
        token = auth.authenticate_user("testuser", "securepassword123")
        success = auth.logout(token)
        assert success, "Logout should succeed"
        # Verify session is no longer valid
        username = auth.validate_session(token)
        assert username is None, "Session should be invalid after logout"
        print("   PASS: Logout successful")
    except Exception as e:
        print(f"   FAIL: Logout failed: {e}")
        return False
    
    print("\nAll tests passed!")
    return True


if __name__ == "__main__":
    success = test_authentication()
    if not success:
        sys.exit(1)