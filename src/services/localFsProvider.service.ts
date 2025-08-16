import { StorageService } from './storage.service';
import fs from 'fs/promises';
import path from 'path';

export class LocalFsProvider extends StorageService {
  private uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    super();
    this.uploadDir = uploadDir;
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    // Ensure the upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Create a unique filename to avoid conflicts
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    // Write the file to disk
    await fs.writeFile(filePath, fileBuffer);

    // Return the relative path to the file
    return path.join(this.uploadDir, uniqueFileName);
  }

  async delete(fileUrl: string): Promise<void> {
    const filePath = path.resolve(fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // If the file doesn't exist, it's not an error
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}