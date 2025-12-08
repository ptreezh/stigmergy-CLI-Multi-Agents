#!/usr/bin/env python3
"""
Example usage of the user authentication functions.
"""

import user_auth

def main():
    """Demonstrate the user authentication functions."""
    print("User Authentication Example")
    print("=" * 30)
    
    # Register a new user
    print("\n1. Registering a new user:")
    success, message = user_auth.register_user("bob", "securepassword123")
    if success:
        print(f"   Success: {message}")
    else:
        print(f"   Error: {message}")
        return
    
    # Authenticate the user
    print("\n2. Authenticating the user:")
    success, result = user_auth.authenticate_user("bob", "securepassword123")
    if success:
        print(f"   Success! Session token: {result}")
    else:
        print(f"   Authentication failed: {result}")
        return
    
    # Try with wrong password
    print("\n3. Trying with wrong password:")
    success, result = user_auth.authenticate_user("bob", "wrongpassword")
    if success:
        print(f"   Unexpected success: {result}")
    else:
        print(f"   Correctly rejected: {result}")
    
    print("\nExample completed!")

if __name__ == "__main__":
    main()