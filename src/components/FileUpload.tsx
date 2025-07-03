'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  preview?: string | null;
  label?: string;
  description?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  preview,
  label = 'Upload File',
  description = 'Select a file to upload',
  disabled = false,
  multiple = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    if (acceptedTypes && acceptedTypes !== '*') {
      const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
      const fileType = file.type;
      const isAccepted = acceptedTypesArray.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${acceptedTypes}`;
      }
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    setError(null);
    
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const isImage = acceptedTypes.includes('image');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            {isImage && preview.startsWith('http') ? (
              <div className="flex items-center space-x-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">File uploaded successfully</p>
                  <p className="text-sm text-gray-500">Click remove to change file</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">File uploaded successfully</p>
                  <p className="text-sm text-gray-500">Click remove to change file</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleRemove}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleChange}
            disabled={disabled}
            multiple={multiple}
            aria-label={`File upload for ${label}`}
          />
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              {isImage ? (
                <Image className="h-full w-full" />
              ) : (
                <Upload className="h-full w-full" />
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' or drag and drop'}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {description}
            </p>
            
            {maxSize && (
              <p className="text-xs text-gray-400 mt-1">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
