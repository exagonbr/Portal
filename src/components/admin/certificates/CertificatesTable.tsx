'use client';

import React from 'react';
import { CertificateDto } from '@/types/certificate';
import Table from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Download } from 'lucide-react';

interface CertificatesTableProps {
  certificates: CertificateDto[];
  onEdit: (certificate: CertificateDto) => void;
  onDelete: (certificate: CertificateDto) => void;
  onDownload: (certificate: CertificateDto) => void;
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const CertificatesTable: React.FC<CertificatesTableProps> = ({ certificates, onEdit, onDelete, onDownload, loading, pagination }) => {
  const columns = [
    {
      key: 'document',
      title: 'Documento',
      dataIndex: 'document',
    },
    {
      key: 'tv_show_name',
      title: 'Curso',
      dataIndex: 'tv_show_name',
    },
    {
      key: 'user_id',
      title: 'ID do Usuário',
      dataIndex: 'user_id',
    },
    {
        key: 'score',
        title: 'Pontuação',
        dataIndex: 'score',
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (_: any, record: CertificateDto) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onDownload(record)}>
            <Download className="h-4 w-4" />
          </Button>
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
      data={certificates}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  );
};