/**
 * Port interface for file storage operations.
 * Implementations will be provided by the infrastructure layer.
 */
export interface IFileStorage {
  /**
   * Reads all files in a directory (non-recursive).
   * Returns an array of file names (relative to the directory).
   */
  readDirectory(dir: string): Promise<string[]>;

  /**
   * Reads the content of a file as a string.
   */
  readFile(path: string): Promise<string>;

  /**
   * Writes content to a file. Creates directories if needed.
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Checks if a file exists.
   */
  fileExists(path: string): Promise<boolean>;
}