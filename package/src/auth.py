"""
Authentication module for the Stigmergy CLI system.
Provides user authentication functionality including password hashing and token management.
"""

import hashlib
import hmac
import secrets
import time
from typing import Dict, Optional, Tuple


class AuthenticationError(Exception):
    """Custom exception for authentication failures."""
    pass


class UserAuthenticator:
    """
    Handles user authentication operations including registration, login, and session management.
    """
    
    def __init__(self):
        # In production, this would be stored in a secure database
        self._users: Dict[str, Dict[str, str]] = {}
        self._sessions: Dict[str, Dict[str, str]] = {}
        
    def register_user(self, username: str, password: str) -> bool:
        """
        Register a new user with the provided username and password.
        
        Args:
            username (str): The user's username
            password (str): The user's password
            
        Returns:
            bool: True if registration successful, False if username already exists
            
        Raises:
            ValueError: If username or password is invalid
        """
        if not username or not password:
            raise ValueError("Username and password cannot be empty")
            
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
            
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
            
        if username in self._users:
            return False
            
        # Hash the password with a salt
        salt = secrets.token_hex(16)
        password_hash = self._hash_password(password, salt)
        
        self._users[username] = {
            'password_hash': password_hash,
            'salt': salt
        }
        
        return True
        
    def authenticate_user(self, username: str, password: str) -> str:
        """
        Authenticate a user with the provided credentials.
        
        Args:
            username (str): The user's username
            password (str): The user's password
            
        Returns:
            str: Session token if authentication is successful
            
        Raises:
            AuthenticationError: If authentication fails
        """
        if username not in self._users:
            raise AuthenticationError("Invalid username or password")
            
        user_data = self._users[username]
        password_hash = self._hash_password(password, user_data['salt'])
        
        if not hmac.compare_digest(password_hash, user_data['password_hash']):
            raise AuthenticationError("Invalid username or password")
            
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        self._sessions[session_token] = {
            'username': username,
            'created_at': str(int(time.time()))
        }
        
        return session_token
        
    def validate_session(self, session_token: str) -> Optional[str]:
        """
        Validate a session token and return the associated username.
        
        Args:
            session_token (str): The session token to validate
            
        Returns:
            str: Username if session is valid, None otherwise
        """
        if session_token not in self._sessions:
            return None
            
        # In production, you would check session expiration here
        return self._sessions[session_token]['username']
        
    def logout(self, session_token: str) -> bool:
        """
        Invalidate a session token.
        
        Args:
            session_token (str): The session token to invalidate
            
        Returns:
            bool: True if session was invalidated, False if token was not found
        """
        if session_token in self._sessions:
            del self._sessions[session_token]
            return True
        return False
        
    def _hash_password(self, password: str, salt: str) -> str:
        """
        Hash a password with the provided salt using SHA-256.
        
        Args:
            password (str): The password to hash
            salt (str): The salt to use for hashing
            
        Returns:
            str: The hashed password
        """
        return hashlib.pbkdf2_hmac('sha256', 
                                 password.encode('utf-8'), 
                                 salt.encode('utf-8'), 
                                 100000).hex()


def authenticate_and_get_token(authenticator: UserAuthenticator, 
                              username: str, 
                              password: str) -> Tuple[bool, str]:
    """
    Helper function to authenticate a user and return a session token.
    
    Args:
        authenticator (UserAuthenticator): The authenticator instance
        username (str): The user's username
        password (str): The user's password
        
    Returns:
        Tuple[bool, str]: A tuple containing success status and message/token
    """
    try:
        token = authenticator.authenticate_user(username, password)
        return True, token
    except AuthenticationError as e:
        return False, str(e)
    except Exception as e:
        return False, f"Authentication error: {str(e)}"


# Example usage:
if __name__ == "__main__":
    # Create an authenticator instance
    auth = UserAuthenticator()
    
    # Register a new user
    try:
        success = auth.register_user("testuser", "securepassword123")
        if success:
            print("User registered successfully")
        else:
            print("Username already exists")
    except ValueError as e:
        print(f"Registration error: {e}")
    
    # Authenticate the user
    try:
        token = auth.authenticate_user("testuser", "securepassword123")
        print(f"Authentication successful. Token: {token}")
        
        # Validate the session
        username = auth.validate_session(token)
        if username:
            print(f"Session validated for user: {username}")
        else:
            print("Invalid session")
            
    except AuthenticationError as e:
        print(f"Authentication failed: {e}")