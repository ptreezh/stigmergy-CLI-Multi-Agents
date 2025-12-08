"""
Simple user authentication function for the Stigmergy CLI system.
Provides basic authentication functionality with secure password hashing.
"""

import hashlib
import hmac
import secrets
import json
import os
from typing import Tuple


def hash_password(password: str, salt: str) -> str:
    """
    Hash a password with the provided salt using SHA-256.
    
    Args:
        password (str): The password to hash
        salt (str): The salt to use for hashing
        
    Returns:
        str: The hashed password as a hexadecimal string
    """
    return hashlib.pbkdf2_hmac('sha256', 
                               password.encode('utf-8'), 
                               salt.encode('utf-8'), 
                               100000).hex()


def authenticate_user(username: str, password: str, 
                      user_db_path: str = "users.json") -> Tuple[bool, str]:
    """
    Authenticate a user with the provided credentials.
    
    This function securely verifies user credentials against stored hashed passwords.
    Passwords are hashed using PBKDF2 with SHA-256 and a 100,000 iteration count.
    
    Args:
        username (str): The user's username
        password (str): The user's password
        user_db_path (str): Path to the JSON file storing user data (default: "users.json")
        
    Returns:
        Tuple[bool, str]: A tuple containing:
            - bool: True if authentication successful, False otherwise
            - str: Message or session token
            
    Example:
        success, result = authenticate_user("alice", "mypassword123")
        if success:
            print(f"Authentication successful! Token: {result}")
        else:
            print(f"Authentication failed: {result}")
    """
    # Validate input parameters
    if not username or not password:
        return False, "Username and password cannot be empty"
    
    # Check if user database exists
    if not os.path.exists(user_db_path):
        return False, "User database not found"
    
    try:
        # Load user database
        with open(user_db_path, 'r') as f:
            users = json.load(f)
    except json.JSONDecodeError:
        return False, "Corrupted user database"
    except Exception as e:
        return False, f"Error reading user database: {str(e)}"
    
    # Check if user exists
    if username not in users:
        # Security note: We don't reveal whether the user exists or not
        # to prevent username enumeration attacks
        return False, "Invalid username or password"
    
    # Get user data
    user_data = users[username]
    
    # Hash the provided password with the stored salt
    password_hash = hash_password(password, user_data['salt'])
    
    # Compare hashes using constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(password_hash, user_data['password_hash']):
        return False, "Invalid username or password"
    
    # Generate a secure session token
    session_token = secrets.token_urlsafe(32)
    
    return True, session_token


def register_user(username: str, password: str, 
                  user_db_path: str = "users.json") -> Tuple[bool, str]:
    """
    Register a new user with the provided username and password.
    
    This function securely stores user credentials with properly hashed passwords.
    Passwords are hashed using PBKDF2 with SHA-256 and a 100,000 iteration count.
    
    Args:
        username (str): The user's username
        password (str): The user's password
        user_db_path (str): Path to the JSON file storing user data (default: "users.json")
        
    Returns:
        Tuple[bool, str]: A tuple containing:
            - bool: True if registration successful, False otherwise
            - str: Success message or error description
    """
    # Validate input parameters
    if not username or not password:
        return False, "Username and password cannot be empty"
        
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
        
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    # Load existing users or create empty dict
    if os.path.exists(user_db_path):
        try:
            with open(user_db_path, 'r') as f:
                users = json.load(f)
        except json.JSONDecodeError:
            return False, "Corrupted user database"
        except Exception as e:
            return False, f"Error reading user database: {str(e)}"
    else:
        users = {}
    
    # Check if username already exists
    if username in users:
        return False, "Username already exists"
    
    # Generate a random salt for password hashing
    salt = secrets.token_hex(16)
    
    # Hash the password with the salt
    password_hash = hash_password(password, salt)
    
    # Store user data
    users[username] = {
        'password_hash': password_hash,
        'salt': salt
    }
    
    # Save updated user database
    try:
        with open(user_db_path, 'w') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        return False, f"Error saving user database: {str(e)}"
    
    return True, "User registered successfully"