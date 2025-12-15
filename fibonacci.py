"""
Fibonacci Number Calculator

This module provides both recursive and iterative implementations for calculating
Fibonacci numbers, with proper error handling and documentation.

The Fibonacci sequence is defined as:
F(0) = 0
F(1) = 1
F(n) = F(n-1) + F(n-2) for n > 1

Author: iFlow CLI
Date: 2025-12-13
"""

from functools import lru_cache
from typing import Union


def validate_input(n: Union[int, str]) -> int:
    """
    Validate and convert input to a non-negative integer.
    
    Args:
        n: The input value to validate (int or str)
        
    Returns:
        int: Validated non-negative integer
        
    Raises:
        TypeError: If input cannot be converted to integer
        ValueError: If input is negative
    """
    try:
        n_int = int(n)
    except (ValueError, TypeError) as e:
        raise TypeError(f"Input must be an integer or convertible to integer. Got: {type(n).__name__}") from e
    
    if n_int < 0:
        raise ValueError(f"Input must be non-negative. Got: {n_int}")
    
    return n_int


def fibonacci_recursive(n: Union[int, str]) -> int:
    """
    Calculate the nth Fibonacci number using recursion with memoization.
    
    This implementation uses LRU cache to optimize performance and avoid
    redundant calculations that plague naive recursive implementations.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        int: The nth Fibonacci number
        
    Raises:
        TypeError: If input cannot be converted to integer
        ValueError: If input is negative
        
    Examples:
        >>> fibonacci_recursive(0)
        0
        >>> fibonacci_recursive(1)
        1
        >>> fibonacci_recursive(10)
        55
        >>> fibonacci_recursive("5")
        5
    """
    n = validate_input(n)
    
    @lru_cache(maxsize=None)
    def _fib_recursive(k: int) -> int:
        if k <= 1:
            return k
        return _fib_recursive(k - 1) + _fib_recursive(k - 2)
    
    return _fib_recursive(n)


def fibonacci_iterative(n: Union[int, str]) -> int:
    """
    Calculate the nth Fibonacci number using an iterative approach.
    
    This implementation is more memory-efficient and generally faster
    for large inputs compared to recursive solutions.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        int: The nth Fibonacci number
        
    Raises:
        TypeError: If input cannot be converted to integer
        ValueError: If input is negative
        
    Examples:
        >>> fibonacci_iterative(0)
        0
        >>> fibonacci_iterative(1)
        1
        >>> fibonacci_iterative(10)
        55
        >>> fibonacci_iterative("5")
        5
    """
    n = validate_input(n)
    
    if n <= 1:
        return n
    
    prev, current = 0, 1
    
    for _ in range(2, n + 1):
        prev, current = current, prev + current
    
    return current


def fibonacci_generator(limit: Union[int, str]):
    """
    Generate Fibonacci numbers up to a specified limit.
    
    Args:
        limit: The maximum number of Fibonacci numbers to generate
        
    Yields:
        int: The next Fibonacci number in the sequence
        
    Raises:
        TypeError: If input cannot be converted to integer
        ValueError: If input is negative
        
    Examples:
        >>> list(fibonacci_generator(5))
        [0, 1, 1, 2, 3]
    """
    limit = validate_input(limit)
    
    a, b = 0, 1
    count = 0
    
    while count < limit:
        yield a
        a, b = b, a + b
        count += 1


def compare_implementations(n: Union[int, str]) -> dict:
    """
    Compare results from both recursive and iterative implementations.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        dict: Dictionary containing results from both implementations
        
    Raises:
        TypeError: If input cannot be converted to integer
        ValueError: If input is negative
    """
    n = validate_input(n)
    
    recursive_result = fibonacci_recursive(n)
    iterative_result = fibonacci_iterative(n)
    
    return {
        'input': n,
        'recursive_result': recursive_result,
        'iterative_result': iterative_result,
        'results_match': recursive_result == iterative_result
    }


def main():
    """
    Demonstration function showing various Fibonacci calculations.
    """
    print("Fibonacci Number Calculator Demonstration")
    print("=" * 40)
    
    # Test cases
    test_cases = [0, 1, 5, 10, 15, 20]
    
    print("\nTesting both implementations:")
    print("n\tRecursive\tIterative\tMatch")
    print("-" * 40)
    
    for n in test_cases:
        comparison = compare_implementations(n)
        print(f"{n}\t{comparison['recursive_result']}\t\t{comparison['iterative_result']}\t\t{comparison['results_match']}")
    
    print("\nFirst 10 Fibonacci numbers (using generator):")
    fib_sequence = list(fibonacci_generator(10))
    print(fib_sequence)
    
    # Edge case testing
    print("\nEdge case testing:")
    try:
        fibonacci_recursive(-1)
    except ValueError as e:
        print(f"Negative input handled correctly: {e}")
    
    try:
        fibonacci_iterative("invalid")
    except TypeError as e:
        print(f"Invalid input handled correctly: {e}")
    
    # String input testing
    print(f"\nString input '7': {fibonacci_recursive('7')}")
    print(f"String input '7': {fibonacci_iterative('7')}")


if __name__ == "__main__":
    main()