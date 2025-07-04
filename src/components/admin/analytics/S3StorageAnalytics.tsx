// src/components/admin/analytics/S3StorageAnalytics.tsx
'use client';

import React from 'react';
import { S3StorageInfo, S3BucketInfo } from '../../../services/awsService';

interface S3StorageAnalyticsProps {
  data: S3StorageInfo | null;
  bucketName?: string;
  region?: string;
}

const S3StorageAnalytics: React.FC<S3StorageAnalyticsProps> = ({ data, bucketName, region }) => {
  if (!bucketName) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Bucket S3 não configurado.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Carregando dados do S3...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Tamanho Total</h4>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {(data.totalSizeMb / 1024).toFixed(2)} GB
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Arquivos</h4>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {data.numberOfFiles.toLocaleString()}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Buckets Monitorados</h4>
        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {data.buckets.map((bucket: S3BucketInfo) => (
            <li key={bucket.name}>- {bucket.name} ({bucket.region})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default S3StorageAnalytics;