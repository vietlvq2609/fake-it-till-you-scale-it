import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystemStorage } from '../../../src/infrastructure/storage/FileSystemStorage';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

describe('FileSystemStorage', () => {
  let storage: FileSystemStorage;
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fit-test-'));
    storage = new FileSystemStorage(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should read directory and return file names', async () => {
    await fs.writeFile(path.join(testDir, 'file1.md'), 'content 1');
    await fs.writeFile(path.join(testDir, 'file2.txt'), 'content 2');
    await fs.mkdir(path.join(testDir, 'subdir'));

    const files = await storage.readDirectory('.');

    expect(files).toContain('file1.md');
    expect(files).toContain('file2.txt');
    expect(files).not.toContain('subdir'); // directories not included
  });

  it('should read directory from subdirectory', async () => {
    await fs.mkdir(path.join(testDir, 'problems'));
    await fs.writeFile(path.join(testDir, 'problems', 'prob1.md'), 'content 1');
    await fs.writeFile(path.join(testDir, 'problems', 'prob2.md'), 'content 2');

    const files = await storage.readDirectory('problems');

    expect(files).toContain('prob1.md');
    expect(files).toContain('prob2.md');
    expect(files).toHaveLength(2);
  });

  it('should return empty array for non-existent directory', async () => {
    const files = await storage.readDirectory('nonexistent');

    expect(files).toEqual([]);
  });

  it('should read file content', async () => {
    const content = '# Hello World\n\nThis is a test.';
    await fs.writeFile(path.join(testDir, 'test.md'), content);

    const result = await storage.readFile('test.md');

    expect(result).toBe(content);
  });

  it('should write file content', async () => {
    const content = 'New file content';
    await storage.writeFile('newfile.txt', content);

    const result = await fs.readFile(path.join(testDir, 'newfile.txt'), 'utf-8');
    expect(result).toBe(content);
  });

  it('should create parent directories when writing', async () => {
    await storage.writeFile('deep/nested/file.txt', 'content');

    const result = await fs.readFile(path.join(testDir, 'deep', 'nested', 'file.txt'), 'utf-8');
    expect(result).toBe('content');
  });

  it('should return true for existing file', async () => {
    await fs.writeFile(path.join(testDir, 'exists.txt'), 'content');

    const exists = await storage.fileExists('exists.txt');

    expect(exists).toBe(true);
  });

  it('should return false for non-existent file', async () => {
    const exists = await storage.fileExists('nonexistent.txt');

    expect(exists).toBe(false);
  });

  it('should handle empty directory', async () => {
    await fs.mkdir(path.join(testDir, 'empty'));

    const files = await storage.readDirectory('empty');

    expect(files).toEqual([]);
  });
});