/**
 * QuickSort implementation for sorting arrays
 */

/**
 * Sort an array using the quicksort algorithm
 * @param {Array} arr - Array to be sorted
 * @param {Function} compareFn - Optional comparison function (a, b) => number
 * @returns {Array} New sorted array
 */
function quicksort(arr, compareFn) {
  // Create a copy to avoid modifying the original array
  const array = [...arr];
  
  // Default comparison function for ascending order
  if (!compareFn) {
    compareFn = (a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    };
  }
  
  // Base case: arrays with 0 or 1 element are already sorted
  if (array.length <= 1) {
    return array;
  }
  
  // Recursive quicksort implementation
  function quicksortRecursive(arr, left, right) {
    if (left < right) {
      const pivotIndex = partition(arr, left, right, compareFn);
      quicksortRecursive(arr, left, pivotIndex - 1);
      quicksortRecursive(arr, pivotIndex + 1, right);
    }
  }
  
  // Partition function using last element as pivot
  function partition(arr, left, right, compare) {
    const pivot = arr[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
      if (compare(arr[j], pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
  }
  
  quicksortRecursive(array, 0, array.length - 1);
  return array;
}

/**
 * Sort an array in-place using the quicksort algorithm
 * @param {Array} arr - Array to be sorted (modified in-place)
 * @param {Function} compareFn - Optional comparison function (a, b) => number
 * @returns {Array} The same array reference, now sorted
 */
function quicksortInPlace(arr, compareFn) {
  // Default comparison function for ascending order
  if (!compareFn) {
    compareFn = (a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    };
  }
  
  // Base case: arrays with 0 or 1 element are already sorted
  if (arr.length <= 1) {
    return arr;
  }
  
  // Recursive quicksort implementation
  function quicksortRecursive(arr, left, right) {
    if (left < right) {
      const pivotIndex = partition(arr, left, right, compareFn);
      quicksortRecursive(arr, left, pivotIndex - 1);
      quicksortRecursive(arr, pivotIndex + 1, right);
    }
  }
  
  // Partition function using last element as pivot
  function partition(arr, left, right, compare) {
    const pivot = arr[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
      if (compare(arr[j], pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
  }
  
  quicksortRecursive(arr, 0, arr.length - 1);
  return arr;
}

/**
 * QuickSort class for sorting arrays with additional utilities
 */
class QuickSort {
  /**
   * Create a new QuickSort instance
   * @param {Function} compareFn - Optional default comparison function
   */
  constructor(compareFn) {
    this.defaultCompare = compareFn || this.defaultComparison;
  }
  
  /**
   * Default comparison function for ascending order
   * @param {*} a - First element
   * @param {*} b - Second element
   * @returns {number} Comparison result
   */
  defaultComparison(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  
  /**
   * Sort an array using quicksort algorithm
   * @param {Array} arr - Array to be sorted
   * @param {Function} compareFn - Optional comparison function
   * @returns {Array} New sorted array
   */
  sort(arr, compareFn) {
    const compare = compareFn || this.defaultCompare;
    return quicksort(arr, compare);
  }
  
  /**
   * Sort an array in-place using quicksort algorithm
   * @param {Array} arr - Array to be sorted (modified in-place)
   * @param {Function} compareFn - Optional comparison function
   * @returns {Array} The same array reference, now sorted
   */
  sortInPlace(arr, compareFn) {
    const compare = compareFn || this.defaultCompare;
    return quicksortInPlace(arr, compare);
  }
  
  /**
   * Sort numbers in ascending order
   * @param {Array<number>} numbers - Array of numbers
   * @returns {Array<number>} Sorted array
   */
  sortNumbersAscending(numbers) {
    return this.sort(numbers, (a, b) => a - b);
  }
  
  /**
   * Sort numbers in descending order
   * @param {Array<number>} numbers - Array of numbers
   * @returns {Array<number>} Sorted array
   */
  sortNumbersDescending(numbers) {
    return this.sort(numbers, (a, b) => b - a);
  }
  
  /**
   * Sort strings alphabetically (case-sensitive)
   * @param {Array<string>} strings - Array of strings
   * @returns {Array<string>} Sorted array
   */
  sortStrings(strings) {
    return this.sort(strings, (a, b) => a.localeCompare(b));
  }
  
  /**
   * Sort strings alphabetically (case-insensitive)
   * @param {Array<string>} strings - Array of strings
   * @returns {Array<string>} Sorted array
   */
  sortStringsCaseInsensitive(strings) {
    return this.sort(strings, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
}

module.exports = {
  quicksort,
  quicksortInPlace,
  QuickSort
};