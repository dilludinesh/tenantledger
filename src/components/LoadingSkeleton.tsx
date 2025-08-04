import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = false 
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height={16} 
              width={colIndex === 0 ? '80%' : colIndex === 1 ? '60%' : '100%'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={20} />
        <Skeleton width={24} height={24} rounded />
      </div>
      <Skeleton width={80} height={32} />
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="75%" height={16} />
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton width={100} height={16} />
        <Skeleton width="100%" height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton width={80} height={16} />
        <Skeleton width="100%" height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton width={90} height={16} />
        <Skeleton width="100%" height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton width={110} height={16} />
        <Skeleton width="100%" height={80} />
      </div>
      <Skeleton width={120} height={40} />
    </div>
  );
};

export const SummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <header className="mb-10">
          <div className="text-center mb-10">
            <Skeleton width={300} height={48} className="mx-auto mb-4" />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 w-full sm:w-auto">
              <div className="space-y-2">
                <Skeleton width={60} height={12} />
                <Skeleton width={150} height={20} />
                <Skeleton width={200} height={12} />
                <Skeleton width={180} height={12} />
              </div>
            </div>
            <Skeleton width={120} height={40} />
          </div>
        </header>

        {/* Summary Cards Skeleton */}
        <SummaryCardsSkeleton />

        {/* Action Bar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <Skeleton width={80} height={36} />
            <Skeleton width={100} height={36} />
            <Skeleton width={60} height={36} />
          </div>
          <Skeleton width={150} height={20} />
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6">
              <FormSkeleton />
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6">
              <TableSkeleton rows={8} columns={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};