'use client';

import React, { useState, useEffect } from 'react';
import { CertificateDto } from '@/types/certificate';
import { certificateService } from '@/services/certificateService';
import { CertificatesTable } from './CertificatesTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const CertificatesClient: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCertificates = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await certificateService.getCertificates({ page, limit: pageSize });
      if (response.success && response.data) {
        setCertificates(response.data.items);
        setPagination({
          current: response.data.page,
          pageSize: response.data.limit,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch certificates', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (certificate: CertificateDto) => {
    // Lógica para editar
    console.log('Edit:', certificate);
  };

  const handleDelete = (certificate: CertificateDto) => {
    // Lógica para deletar
    console.log('Delete:', certificate);
  };

  const handleDownload = (certificate: CertificateDto) => {
    // Lógica para download
    console.log('Download:', certificate);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Certificado
        </Button>
      </div>
      <CertificatesTable
        certificates={certificates}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};