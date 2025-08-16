'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  maxFiles?: number;
}

export default function FileUpload({ onFilesUploaded, maxFiles = 5 }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const newFiles = [...prev, ...acceptedFiles].slice(0, maxFiles);
      onFilesUploaded(newFiles);
      return newFiles;
    });
  }, [maxFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/*': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      onFilesUploaded(newFiles);
      return newFiles;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports images, documents, and spreadsheets (max {maxFiles} files)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center">
                  <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <Button
          onClick={() => {
            setIsUploading(true);
            // Here you would typically upload the files to your server
            // For now, we'll just simulate the upload
            setTimeout(() => {
              setIsUploading(false);
              setFiles([]);
              onFilesUploaded([]);
            }, 1000);
          }}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      )}
    </div>
  );
}