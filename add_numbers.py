def add_numbers(a, b):
    """
    Add two numbers together.

    Args:
        a: First number
        b: Second number

    Returns:
        Sum of the two numbers
    """
    return a + b


# Example usage
if __name__ == "__main__":
    result = add_numbers(5, 3)
    print(f"The sum of 5 and 3 is: {result}")

    # Test with different types
    print(f"Add integers: {add_numbers(10, 20)}")
    print(f"Add floats: {add_numbers(3.14, 2.86)}")
    print(f"Add mixed: {add_numbers(5, 7.5)}")
