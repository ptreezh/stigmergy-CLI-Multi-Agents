/**
 * Tests for Cache Cleaner functionality
 */

const CacheCleaner = require('../../src/core/cache_cleaner');
const fs = require('fs');
const path = require('path');

describe('Cache Cleaner', () => {
  let cleaner;
  let mockFS;

  beforeEach(() => {
    cleaner = new CacheCleaner();

    // Mock fs methods
    mockFS = {
      existsSync: jest.fn(),
      statSync: jest.fn(),
      readdirSync: jest.fn(),
      unlinkSync: jest.fn(),
      rmdirSync: jest.fn(),
      mkdirSync: jest.fn()
    };

    Object.assign(fs, mockFS);
  });

  describe('Constructor', () => {
    test('should initialize with default paths', () => {
      expect(cleaner.cachePaths).toBeDefined();
      expect(Array.isArray(cleaner.cachePaths)).toBe(true);
    });

    test('should accept custom paths', () => {
      const customPaths = ['/custom/cache/path'];
      const customCleaner = new CacheCleaner(customPaths);

      expect(customCleaner.cachePaths).toEqual(customPaths);
    });
  });

  describe('cleanCache', () => {
    test('should clean existing cache files', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.statSync.mockReturnValue({ isFile: () => true });
      mockFS.readdirSync.mockReturnValue(['file1.cache', 'file2.cache']);

      const result = cleaner.cleanCache();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBeGreaterThan(0);
      expect(mockFS.unlinkSync).toHaveBeenCalledTimes(2);
    });

    test('should handle non-existent cache directories', () => {
      mockFS.existsSync.mockReturnValue(false);

      const result = cleaner.cleanCache();

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(0);
      expect(result.message).toContain('No cache directories found');
    });

    test('should handle errors during cleanup', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.statSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = cleaner.cleanCache();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('cleanOldFiles', () => {
    test('should remove files older than specified age', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

      const newDate = new Date();

      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['old.cache', 'new.cache']);
      mockFS.statSync.mockImplementation((filePath) => {
        if (filePath.includes('old')) {
          return { isFile: () => true, mtime: () => oldDate };
        } else {
          return { isFile: () => true, mtime: () => newDate };
        }
      });

      const result = cleaner.cleanOldFiles(7); // 7 days

      expect(result.filesDeleted).toBe(1);
      expect(mockFS.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('old.cache')
      );
    });

    test('should not remove recent files', () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1 hour ago

      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['recent.cache']);
      mockFS.statSync.mockReturnValue({
        isFile: () => true,
        mtime: () => recentDate
      });

      const result = cleaner.cleanOldFiles(7); // 7 days

      expect(result.filesDeleted).toBe(0);
      expect(mockFS.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getCacheSize', () => {
    test('should calculate total cache size', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['file1', 'file2']);
      mockFS.statSync.mockImplementation((filePath) => ({
        isFile: () => true,
        size: filePath.includes('file1') ? 1024 : 2048
      }));

      const size = cleaner.getCacheSize();

      expect(size).toBe(3072); // 1024 + 2048
    });

    test('should handle empty cache directories', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue([]);

      const size = cleaner.getCacheSize();

      expect(size).toBe(0);
    });

    test('should handle directories recursively', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['subdir', 'file']);
      mockFS.statSync.mockImplementation((filePath) => {
        if (filePath.includes('subdir')) {
          return { isFile: () => false, isDirectory: () => true };
        } else {
          return { isFile: () => true, size: 1024 };
        }
      });

      const size = cleaner.getCacheSize();

      expect(size).toBe(1024);
    });
  });

  describe('listCacheFiles', () => {
    test('should list all cache files with details', () => {
      const testDate = new Date();

      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['file1.cache', 'file2.cache']);
      mockFS.statSync.mockImplementation((filePath) => ({
        isFile: () => true,
        size: filePath.includes('file1') ? 1024 : 2048,
        mtime: () => testDate
      }));

      const files = cleaner.listCacheFiles();

      expect(files).toHaveLength(2);
      expect(files[0]).toHaveProperty('name');
      expect(files[0]).toHaveProperty('size');
      expect(files[0]).toHaveProperty('modified');
    });

    test('should filter by file extension', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockReturnValue(['file1.cache', 'file2.tmp', 'file3.cache']);
      mockFS.statSync.mockReturnValue({
        isFile: () => true,
        size: 1024,
        mtime: () => new Date()
      });

      const cacheFiles = cleaner.listCacheFiles('.cache');

      expect(cacheFiles).toHaveLength(2);
      expect(cacheFiles.every(file => file.name.endsWith('.cache'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle permission errors gracefully', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => cleaner.getCacheSize()).not.toThrow();
    });

    test('should handle invalid paths', () => {
      const invalidCleaner = new CacheCleaner(['/invalid/path']);

      mockFS.existsSync.mockReturnValue(false);

      const result = invalidCleaner.cleanCache();

      expect(result.success).toBe(true);
      expect(result.message).toContain('No cache directories found');
    });
  });

  describe('Configuration', () => {
    test('should allow adding custom cache paths', () => {
      const customPath = '/custom/cache';
      cleaner.addCachePath(customPath);

      expect(cleaner.cachePaths).toContain(customPath);
    });

    test('should allow removing cache paths', () => {
      const customPath = '/custom/cache';
      cleaner.addCachePath(customPath);
      cleaner.removeCachePath(customPath);

      expect(cleaner.cachePaths).not.toContain(customPath);
    });

    test('should validate paths before adding', () => {
      const invalidPath = null;

      expect(() => cleaner.addCachePath(invalidPath)).not.toThrow();
      expect(cleaner.cachePaths).not.toContain(invalidPath);
    });
  });
});
