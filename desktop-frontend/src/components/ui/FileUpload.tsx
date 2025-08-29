import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Camera, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { apiClient } from '../../lib/api';

interface FileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  dogId?: string;
  vaccinationId?: string;
  healthRecordId?: string;
  documentType?: string;
  className?: string;
  multiple?: boolean;
  variant?: 'default' | 'avatar' | 'document';
  currentImage?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  acceptedTypes = 'image/*,.pdf,.doc,.docx',
  maxSize = 10,
  dogId,
  vaccinationId,
  healthRecordId,
  documentType = 'other',
  className = '',
  multiple = false,
  variant = 'default',
  currentImage
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const response = await apiClient.uploadFile(file, {
        dogId,
        vaccinationId,
        healthRecordId,
        documentType
      });

      const fileUrl: string = response.fileUrl; // backend returns full URL
      onFileUploaded(fileUrl, file.name);
      setUploadSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemovePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isImage = acceptedTypes.includes('image');

  if (variant === 'avatar') {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-blue-500 flex items-center justify-center shadow-lg">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera size={32} className="text-white" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : uploadSuccess ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </button>
        </div>

        {uploadSuccess && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Uploaded!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${dragOver ? 'border-primary-500 bg-primary-50 scale-105' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
          ${uploadSuccess ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle size={32} className="text-green-500" />
            <p className="text-sm text-green-600 font-medium">Upload successful!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {isImage ? <Image size={32} className="text-gray-400" /> : <File size={32} className="text-gray-400" />}
            <div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">{isImage ? 'Images' : 'Files'} up to {maxSize}MB</p>
            </div>
          </div>
        )}
      </div>

      {preview && variant === 'default' && (
        <div className="mt-4 relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-lg" />
          <button
            onClick={handleRemovePreview}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
