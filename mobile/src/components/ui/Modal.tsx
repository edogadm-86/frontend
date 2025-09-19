import React from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 my-8',
          'max-h-[90vh] flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer (actions) */}
        <div className="flex justify-end space-x-2 p-4 border-t sticky bottom-0 bg-white z-10">
          {/* Consumers of Modal can pass form buttons inside children,
              or you can remove this footer if not needed */}
        </div>
      </div>
    </div>
  );
};
