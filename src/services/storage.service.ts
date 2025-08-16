export abstract class StorageService {
  /**
   * Uploads a file to the storage provider.
   * @param fileBuffer The file buffer.
   * @param fileName The name of the file.
   * @param mimeType The MIME type of the file.
   * @returns A promise that resolves to the URL of the uploaded file.
   */
  abstract upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;

  /**
   * Deletes a file from the storage provider.
   * @param fileUrl The URL of the file to delete.
   * @returns A promise that resolves when the file is deleted.
   */
  abstract delete(fileUrl: string): Promise<void>;
}