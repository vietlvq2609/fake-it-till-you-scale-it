import { IFileStorage } from '../../application/ports/IFileStorage';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export class FileSystemStorage implements IFileStorage {
  constructor(private readonly baseDir: string = process.cwd()) {}

  async readDirectory(dir: string): Promise<string[]> {
    const fullPath = path.join(this.baseDir, dir);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
    } catch {
      return [];
    }
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}