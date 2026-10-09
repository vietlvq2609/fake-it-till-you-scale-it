import { describe, it, expect, beforeEach } from 'vitest';
import { FakeFileStorage } from '../ports/fake-file-storage';

describe('FakeFileStorage', () => {
  let storage: FakeFileStorage;

  beforeEach(() => {
    storage = new FakeFileStorage();
  });

  describe('readDirectory', () => {
    it('should return empty array for empty directory', async () => {
      const result = await storage.readDirectory('empty-dir');
      expect(result).toHaveLength(0);
    });

    it('should return files in directory', async () => {
      storage.setFile('dir/file1.txt', 'content1');
      storage.setFile('dir/file2.txt', 'content2');
      storage.setFile('other/file3.txt', 'content3');

      const result = await storage.readDirectory('dir');

      expect(result).toHaveLength(2);
      expect(result.sort()).toEqual(['file1.txt', 'file2.txt']);
    });

    it('should handle directory without trailing slash', async () => {
      storage.setFile('dir/file.txt', 'content');

      const result = await storage.readDirectory('dir');

      expect(result).toEqual(['file.txt']);
    });

    it('should handle directory with trailing slash', async () => {
      storage.setFile('dir/file.txt', 'content');

      const result = await storage.readDirectory('dir/');

      expect(result).toEqual(['file.txt']);
    });

    it('should not return files from subdirectories', async () => {
      storage.setFile('dir/file.txt', 'content');
      storage.setFile('dir/sub/file2.txt', 'content2');

      const result = await storage.readDirectory('dir');

      expect(result).toEqual(['file.txt']);
    });
  });

  describe('readFile', () => {
    it('should return file content', async () => {
      storage.setFile('path/to/file.txt', 'Hello World');

      const result = await storage.readFile('path/to/file.txt');

      expect(result).toBe('Hello World');
    });

    it('should throw when file does not exist', async () => {
      await expect(storage.readFile('nonexistent.txt')).rejects.toThrow('File not found');
    });
  });

  describe('writeFile', () => {
    it('should write file content', async () => {
      await storage.writeFile('new/file.txt', 'New Content');

      const result = await storage.readFile('new/file.txt');
      expect(result).toBe('New Content');
    });

    it('should overwrite existing file', async () => {
      storage.setFile('file.txt', 'Old Content');

      await storage.writeFile('file.txt', 'New Content');

      const result = await storage.readFile('file.txt');
      expect(result).toBe('New Content');
    });

    it('should create parent directories', async () => {
      await storage.writeFile('deep/nested/path/file.txt', 'Content');

      const result = await storage.readFile('deep/nested/path/file.txt');
      expect(result).toBe('Content');
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      storage.setFile('file.txt', 'content');

      const result = await storage.fileExists('file.txt');

      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const result = await storage.fileExists('nonexistent.txt');

      expect(result).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('clear should remove all files', async () => {
      storage.setFile('file1.txt', 'content1');
      storage.setFile('file2.txt', 'content2');

      storage.clear();

      expect(await storage.fileExists('file1.txt')).toBe(false);
      expect(await storage.fileExists('file2.txt')).toBe(false);
    });

    it('getFiles should return copy of files map', async () => {
      storage.setFile('file1.txt', 'content1');

      const files = storage.getFiles();

      expect(files.get('file1.txt')).toBe('content1');
      // Modify copy shouldn't affect original
      files.set('file1.txt', 'modified');
      expect(await storage.readFile('file1.txt')).toBe('content1');
    });

    it('getDirectories should return copy of directories set', async () => {
      storage.setFile('dir/file.txt', 'content');

      const dirs = storage.getDirectories();

      expect(dirs.has('dir')).toBe(true);
    });

    it('setFile should add file without async', () => {
      storage.setFile('file.txt', 'content');

      expect(storage.getFiles().get('file.txt')).toBe('content');
    });
  });
});