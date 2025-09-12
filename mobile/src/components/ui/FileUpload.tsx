import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';


interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  className?: string;
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = true,
  files,
  onFilesChange,
  className,
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
const { t } = useTranslation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = [...files, ...selectedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blueblue-500 hover:bg-blue-50 transition-colors"
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
         {t('Click to upload files or drag and drop')} 
        </p>
        <p className="text-xs text-gray-500">
         {t('Images, PDFs, or documents')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => {
            const imageUrl = getFileIcon(file);
            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <FileText size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};