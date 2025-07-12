'use client';

import React from 'react';
import { VideoDto } from '@/services/videoService';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

interface VideosTableProps {
  videos: VideoDto[];
  onEdit: (video: VideoDto) => void;
  onDelete: (video: VideoDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const VideosTable: React.FC<VideosTableProps> = ({ videos, onEdit, onDelete, loading, pagination }) => {
  const columns = [
    {
      key: 'title',
      title: 'Título',
      dataIndex: 'title',
    },
    {
      key: 'class',
      title: 'Classe',
      dataIndex: 'class',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: VideoDto) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(record)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={videos}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};