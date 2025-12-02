"""
File utility functions for safe file operations
Cross-platform safe file reading and writing with encoding support
"""

import json
import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union

logger = logging.getLogger(__name__)


def ensure_directory_exists(directory_path: Union[str, Path]) -> bool:
    """
    Ensure a directory exists, creating it if necessary
    
    Args:
        directory_path: Path to the directory
        
    Returns:
        True if directory exists or was created successfully, False otherwise
    """
    try:
        path = Path(directory_path)
        path.mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Failed to create directory {directory_path}: {e}")
        return False


def safe_write_json_file(file_path: Union[str, Path], data: Dict[str, Any], 
                        encoding: str = 'utf-8', indent: int = 2) -> bool:
    """
    Safely write JSON data to a file with proper encoding handling
    
    Args:
        file_path: Path to the JSON file
        data: Dictionary to write as JSON
        encoding: File encoding (default: utf-8)
        indent: JSON indentation (default: 2)
        
    Returns:
        True if write was successful, False otherwise
    """
    try:
        path = Path(file_path)
        
        # Ensure parent directory exists
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write JSON data
        with open(path, 'w', encoding=encoding) as f:
            json.dump(data, f, indent=indent, ensure_ascii=False, sort_keys=True)
        
        logger.info(f"Successfully wrote JSON file: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to write JSON file {file_path}: {e}")
        return False


def safe_read_json_file(file_path: Union[str, Path], 
                       encoding: str = 'utf-8') -> Optional[Dict[str, Any]]:
    """
    Safely read JSON data from a file with proper encoding handling
    
    Args:
        file_path: Path to the JSON file
        encoding: File encoding (default: utf-8)
        
    Returns:
        Dictionary with JSON data, or None if read failed
    """
    try:
        path = Path(file_path)
        
        if not path.exists():
            logger.warning(f"JSON file does not exist: {file_path}")
            return None
        
        # Read JSON data
        with open(path, 'r', encoding=encoding) as f:
            data = json.load(f)
        
        logger.info(f"Successfully read JSON file: {file_path}")
        return data
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in file {file_path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed to read JSON file {file_path}: {e}")
        return None


def safe_write_text_file(file_path: Union[str, Path], content: str, 
                        encoding: str = 'utf-8') -> bool:
    """
    Safely write text content to a file with proper encoding handling
    
    Args:
        file_path: Path to the text file
        content: Text content to write
        encoding: File encoding (default: utf-8)
        
    Returns:
        True if write was successful, False otherwise
    """
    try:
        path = Path(file_path)
        
        # Ensure parent directory exists
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write text content
        with open(path, 'w', encoding=encoding) as f:
            f.write(content)
        
        logger.info(f"Successfully wrote text file: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to write text file {file_path}: {e}")
        return False


def safe_read_text_file(file_path: Union[str, Path], 
                       encoding: str = 'utf-8') -> Optional[str]:
    """
    Safely read text content from a file with proper encoding handling
    
    Args:
        file_path: Path to the text file
        encoding: File encoding (default: utf-8)
        
    Returns:
        Text content as string, or None if read failed
    """
    try:
        path = Path(file_path)
        
        if not path.exists():
            logger.warning(f"Text file does not exist: {file_path}")
            return None
        
        # Read text content
        with open(path, 'r', encoding=encoding) as f:
            content = f.read()
        
        logger.info(f"Successfully read text file: {file_path}")
        return content
        
    except Exception as e:
        logger.error(f"Failed to read text file {file_path}: {e}")
        return None


def get_file_size(file_path: Union[str, Path]) -> int:
    """
    Get the size of a file in bytes
    
    Args:
        file_path: Path to the file
        
    Returns:
        File size in bytes, or 0 if file doesn't exist or error occurred
    """
    try:
        path = Path(file_path)
        if path.exists():
            return path.stat().st_size
        return 0
    except Exception as e:
        logger.error(f"Failed to get file size for {file_path}: {e}")
        return 0


def file_exists(file_path: Union[str, Path]) -> bool:
    """
    Check if a file exists
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if file exists, False otherwise
    """
    try:
        return Path(file_path).exists()
    except Exception:
        return False


def delete_file_safely(file_path: Union[str, Path]) -> bool:
    """
    Safely delete a file
    
    Args:
        file_path: Path to the file to delete
        
    Returns:
        True if deletion was successful or file didn't exist, False otherwise
    """
    try:
        path = Path(file_path)
        if path.exists():
            path.unlink()
            logger.info(f"Successfully deleted file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {e}")
        return False


def copy_file_safely(source_path: Union[str, Path], dest_path: Union[str, Path]) -> bool:
    """
    Safely copy a file from source to destination
    
    Args:
        source_path: Source file path
        dest_path: Destination file path
        
    Returns:
        True if copy was successful, False otherwise
    """
    try:
        src = Path(source_path)
        dst = Path(dest_path)
        
        # Ensure destination directory exists
        dst.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        import shutil
        shutil.copy2(src, dst)
        
        logger.info(f"Successfully copied file from {source_path} to {dest_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to copy file from {source_path} to {dest_path}: {e}")
        return False