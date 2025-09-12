// PageContainer.tsx
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, fullWidth }) => {
  return (
    <div className="p-4 lg:p-8 min-h-screen w-full">
      <div className={`${fullWidth ? "w-full" : "max-w-4xl mx-auto"} space-y-6`}>
        {children}
      </div>
    </div>
  );
};
