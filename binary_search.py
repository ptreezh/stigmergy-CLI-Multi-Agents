def binary_search(arr, target):
    """
    Perform binary search on a sorted array to find the index of target value.

    Args:
        arr (list): A sorted list of comparable elements
        target: The value to search for

    Returns:
        int: Index of the target if found, otherwise -1

    Raises:
        TypeError: If arr is not a list or target is not comparable
        ValueError: If the array is not sorted
    """

    # Error handling for invalid inputs
    if not isinstance(arr, list):
        raise TypeError("First argument must be a list")

    if not arr:  # Empty list
        return -1

    # Check if array is sorted
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            raise ValueError("Array must be sorted in ascending order")

    # Binary search implementation
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow

        try:
            # Try comparison and catch TypeError if elements are not comparable
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        except TypeError as e:
            raise TypeError(f"Cannot compare array elements with target: {e}")

    return -1


# Demonstration and testing
if __name__ == "__main__":
    # Test cases
    test_cases = [
        {"arr": [1, 3, 5, 7, 9, 11, 13], "target": 7, "expected": 3},
        {"arr": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "target": 1, "expected": 0},
        {"arr": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "target": 10, "expected": 9},
        {"arr": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "target": 11, "expected": -1},
        {"arr": [], "target": 5, "expected": -1},
        {"arr": [42], "target": 42, "expected": 0},
        {"arr": [42], "target": 24, "expected": -1},
    ]

    print("=== Binary Search Algorithm Test ===")

    for i, test_case in enumerate(test_cases, 1):
        try:
            result = binary_search(test_case["arr"], test_case["target"])
            if result == test_case["expected"]:
                print(f"Test {i}: PASS - Found target {test_case['target']} at index {result}")
            else:
                print(f"Test {i}: FAIL - Expected {test_case['expected']}, got {result}")
        except Exception as e:
            print(f"Test {i}: ERROR - {e}")

    print("
=== Error Handling Tests ===")

    # Test error cases
    error_tests = [
        {"arr": "not a list", "target": 5, "error_type": TypeError},
        {"arr": [3, 1, 4, 2], "target": 2, "error_type": ValueError},  # Unsorted array
    ]

    for i, test_case in enumerate(error_tests, 1):
        try:
            result = binary_search(test_case["arr"], test_case["target"])
            print(f"Error Test {i}: FAIL - Expected error, but got result {result}")
        except test_case["error_type"] as e:
            print(f"Error Test {i}: PASS - Correctly raised {type(e).__name__}: {e}")
        except Exception as e:
            print(f"Error Test {i}: FAIL - Expected {test_case['error_type'].__name__}, but got {type(e).__name__}")
