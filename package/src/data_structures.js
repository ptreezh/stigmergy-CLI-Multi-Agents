/**
 * Data Structures for the Stigmergy CLI
 */

/**
 * HashTable implementation with collision handling using chaining and open addressing
 */
class HashTable {
  /**
   * Create a new HashTable
   * @param {number} size - Initial size of the hash table
   * @param {string} collisionStrategy - Collision handling strategy ('chaining' or 'openAddressing')
   */
  constructor(size = 53, collisionStrategy = 'chaining') {
    this.size = size;
    this.collisionStrategy = collisionStrategy;

    if (collisionStrategy === 'chaining') {
      this.buckets = new Array(size).fill(null).map(() => []);
    } else if (collisionStrategy === 'openAddressing') {
      this.buckets = new Array(size).fill(null);
      this.deleted = new Array(size).fill(false);
    } else {
      throw new Error(
        'Invalid collision strategy. Use "chaining" or "openAddressing"',
      );
    }

    this.count = 0;
    this.loadFactorThreshold = 0.75;
  }

  /**
   * Hash function to convert a key to an index
   * @param {string|number} key - Key to hash
   * @returns {number} Index in the hash table
   */
  _hash(key) {
    if (typeof key === 'number') {
      return key % this.size;
    }

    let hash = 0;
    const PRIME = 31;

    for (let i = 0; i < key.length; i++) {
      hash = (hash * PRIME + key.charCodeAt(i)) % this.size;
    }

    return hash;
  }

  /**
   * Secondary hash function for double hashing in open addressing
   * @param {string|number} key - Key to hash
   * @returns {number} Secondary hash value
   */
  _hash2(key) {
    if (typeof key === 'number') {
      return 7 - (key % 7);
    }

    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 3 + key.charCodeAt(i)) % this.size;
    }

    return 7 - (hash % 7);
  }

  /**
   * Resize the hash table when load factor exceeds threshold
   */
  _resize() {
    const oldBuckets = this.buckets;
    const oldDeleted = this.deleted;
    const oldSize = this.size;

    // Double the size
    this.size *= 2;
    this.count = 0;

    if (this.collisionStrategy === 'chaining') {
      this.buckets = new Array(this.size).fill(null).map(() => []);
    } else {
      this.buckets = new Array(this.size).fill(null);
      this.deleted = new Array(this.size).fill(false);
    }

    // Rehash all existing elements
    if (this.collisionStrategy === 'chaining') {
      for (let i = 0; i < oldSize; i++) {
        const bucket = oldBuckets[i];
        if (bucket) {
          for (const [key, value] of bucket) {
            this.set(key, value);
          }
        }
      }
    } else {
      for (let i = 0; i < oldSize; i++) {
        if (oldBuckets[i] !== null && !oldDeleted[i]) {
          this.set(oldBuckets[i][0], oldBuckets[i][1]);
        }
      }
    }
  }

  /**
   * Set a key-value pair in the hash table
   * @param {string|number} key - Key to store
   * @param {*} value - Value to store
   * @returns {HashTable} The hash table instance
   */
  set(key, value) {
    // Check if resize is needed
    if (this.count >= this.size * this.loadFactorThreshold) {
      this._resize();
    }

    if (this.collisionStrategy === 'chaining') {
      return this._setChaining(key, value);
    } else {
      return this._setOpenAddressing(key, value);
    }
  }

  /**
   * Set a key-value pair using chaining
   * @private
   */
  _setChaining(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    // Check if key already exists
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value; // Update existing value
        return this;
      }
    }

    // Add new key-value pair
    bucket.push([key, value]);
    this.count++;
    return this;
  }

  /**
   * Set a key-value pair using open addressing with double hashing
   * @private
   */
  _setOpenAddressing(key, value) {
    let index = this._hash(key);
    let originalIndex = index;
    let i = 0;

    // Probe until we find an empty slot or deleted slot
    while (
      this.buckets[index] !== null &&
      !this.deleted[index] &&
      this.buckets[index][0] !== key
    ) {
      i++;
      index = (originalIndex + i * this._hash2(key)) % this.size;

      // If we've checked all slots, the table is full
      if (i >= this.size) {
        // Instead of throwing an error, we'll resize and try again
        this._resize();
        return this.set(key, value);
      }
    }

    // If key already exists, update the value
    if (
      this.buckets[index] !== null &&
      !this.deleted[index] &&
      this.buckets[index][0] === key
    ) {
      this.buckets[index][1] = value;
    } else {
      // Insert new key-value pair
      this.buckets[index] = [key, value];
      this.deleted[index] = false;
      this.count++;
    }

    return this;
  }

  /**
   * Get a value by its key
   * @param {string|number} key - Key to look up
   * @returns {*} The value associated with the key, or undefined if not found
   */
  get(key) {
    if (this.collisionStrategy === 'chaining') {
      return this._getChaining(key);
    } else {
      return this._getOpenAddressing(key);
    }
  }

  /**
   * Get a value using chaining
   * @private
   */
  _getChaining(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        return bucket[i][1];
      }
    }

    return undefined;
  }

  /**
   * Get a value using open addressing
   * @private
   */
  _getOpenAddressing(key) {
    let index = this._hash(key);
    let i = 0;

    // Probe until we find the key or an empty slot
    while (this.buckets[index] !== null) {
      if (!this.deleted[index] && this.buckets[index][0] === key) {
        return this.buckets[index][1];
      }

      i++;
      index = (this._hash(key) + i * this._hash2(key)) % this.size;

      // Prevent infinite loop
      if (i >= this.size) {
        break;
      }
    }

    return undefined;
  }

  /**
   * Delete a key-value pair from the hash table
   * @param {string|number} key - Key to delete
   * @returns {boolean} True if the key was found and deleted, false otherwise
   */
  delete(key) {
    if (this.collisionStrategy === 'chaining') {
      return this._deleteChaining(key);
    } else {
      return this._deleteOpenAddressing(key);
    }
  }

  /**
   * Delete a key-value pair using chaining
   * @private
   */
  _deleteChaining(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }

    return false;
  }

  /**
   * Delete a key-value pair using open addressing
   * @private
   */
  _deleteOpenAddressing(key) {
    let index = this._hash(key);
    let i = 0;

    // Probe until we find the key or an empty slot
    while (this.buckets[index] !== null) {
      if (!this.deleted[index] && this.buckets[index][0] === key) {
        this.deleted[index] = true;
        this.count--;
        return true;
      }

      i++;
      index = (this._hash(key) + i * this._hash2(key)) % this.size;

      // Prevent infinite loop
      if (i >= this.size) {
        break;
      }
    }

    return false;
  }

  /**
   * Check if a key exists in the hash table
   * @param {string|number} key - Key to check
   * @returns {boolean} True if the key exists, false otherwise
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Get all keys in the hash table
   * @returns {Array} Array of all keys
   */
  keys() {
    const keysArr = [];

    if (this.collisionStrategy === 'chaining') {
      for (let i = 0; i < this.size; i++) {
        const bucket = this.buckets[i];
        if (bucket) {
          for (const [key, __] of bucket) {
            keysArr.push(key);
          }
        }
      }
    } else {
      for (let i = 0; i < this.size; i++) {
        if (this.buckets[i] !== null && !this.deleted[i]) {
          keysArr.push(this.buckets[i][0]);
        }
      }
    }

    return keysArr;
  }

  /**
   * Get all values in the hash table
   * @returns {Array} Array of all values
   */
  values() {
    const valuesArr = [];

    if (this.collisionStrategy === 'chaining') {
      for (let i = 0; i < this.size; i++) {
        const bucket = this.buckets[i];
        if (bucket) {
          for (const [__, value] of bucket) {
            valuesArr.push(value);
          }
        }
      }
    } else {
      for (let i = 0; i < this.size; i++) {
        if (this.buckets[i] !== null && !this.deleted[i]) {
          valuesArr.push(this.buckets[i][1]);
        }
      }
    }

    return valuesArr;
  }

  /**
   * Get all key-value pairs in the hash table
   * @returns {Array} Array of all key-value pairs
   */
  entries() {
    const entriesArr = [];

    if (this.collisionStrategy === 'chaining') {
      for (let i = 0; i < this.size; i++) {
        const bucket = this.buckets[i];
        if (bucket) {
          for (const [key, value] of bucket) {
            entriesArr.push([key, value]);
          }
        }
      }
    } else {
      for (let i = 0; i < this.size; i++) {
        if (this.buckets[i] !== null && !this.deleted[i]) {
          entriesArr.push([this.buckets[i][0], this.buckets[i][1]]);
        }
      }
    }

    return entriesArr;
  }

  /**
   * Clear the hash table
   */
  clear() {
    if (this.collisionStrategy === 'chaining') {
      this.buckets = new Array(this.size).fill(null).map(() => []);
    } else {
      this.buckets = new Array(this.size).fill(null);
      this.deleted = new Array(this.size).fill(false);
    }

    this.count = 0;
  }

  /**
   * Get the size of the hash table
   * @returns {number} Number of key-value pairs in the hash table
   */
  getSize() {
    return this.count;
  }

  /**
   * Check if the hash table is empty
   * @returns {boolean} True if the hash table is empty, false otherwise
   */
  isEmpty() {
    return this.count === 0;
  }

  /**
   * Get the load factor of the hash table
   * @returns {number} Load factor (number of elements / table size)
   */
  getLoadFactor() {
    return this.count / this.size;
  }
}

module.exports = {
  HashTable,
};