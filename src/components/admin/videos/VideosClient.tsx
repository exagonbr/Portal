'use client';

import React, { useState, useEffect } from 'react';
import { VideoDto, videoService } from '@/services/videoService';
import { VideosTable } from './VideosTable';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

export const VideosClient: React.FC = () => {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchVideos = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await videoService.getVideos({ page, limit: pageSize });
      setVideos(response.items);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleEdit = (video: VideoDto) => {
    // Lógica para editar
    console.log('Edit:', video);
  };

  const handleDelete = (video: VideoDto) => {
    // Lógica para deletar
    console.log('Delete:', video);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Vídeo
        </Button>
      </div>
      <VideosTable
        videos={videos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        pagination={{ ...pagination, onChange: handlePageChange }}
      />
    </div>
  );
};