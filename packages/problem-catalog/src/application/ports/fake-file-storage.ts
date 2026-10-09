import { IFileStorage } from './file-storage';

/**
 * Fake in-memory implementation of IFileStorage for testing.
 */
export class FakeFileStorage implements IFileStorage {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  constructor(initialFiles: Record<string, string> = {}) {
    for (const [path, content] of Object.entries(initialFiles)) {
      this.files.set(path, content);
      // Add parent directories
      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        this.directories.add(parts.slice(0, i).join('/'));
      }
    }
  }

  async readDirectory(dir: string): Promise<string[]> {
    const normalizedDir = dir.replace(/^\/|\/$/g, '');
    const results: string[] = [];

    for (const filePath of this.files.keys()) {
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (fileDir === normalizedDir) {
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        results.push(fileName);
      }
    }

    return results;
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    // Add parent directories
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) {
      this.directories.add(parts.slice(0, i).join('/'));
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  // Helper methods for testing
  clear(): void {
    this.files.clear();
    this.directories.clear();
  }

  getFiles(): Map<string, string> {
    return new Map(this.files);
  }

  getDirectories(): Set<string> {
    return new Set(this.directories);
  }

  setFile(path: string, content: string): void {
    this.files.set(path, content);
    // Add parent directories
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) {
      this.directories.add(parts.slice(0, i).join('/'));
    }
  }
}