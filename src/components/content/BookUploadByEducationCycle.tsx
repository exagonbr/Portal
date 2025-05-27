'use client';

import { useState, useRef } from 'react';
import { BookByEducationCycle } from '@/types/collection';
import { s3Service } from '@/services/s3Service';
import { ContentType } from '@/types/content';
import { BRAZILIAN_EDUCATION, CORE_SUBJECTS } from '@/constants/brazilianEducation';

export default function BookUploadByEducationCycle() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    description: '',
    educationLevel: 'FUNDAMENTAL' as 'INFANTIL' | 'FUNDAMENTAL' | 'MEDIO',
    cycle: '',
    grade: '',
    subject: '',
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Initialize upload
      const uploadResponse = await s3Service.initiateUpload(file, {
        title: metadata.title,
        description: metadata.description,
        tags: [
          ...metadata.tags,
          metadata.educationLevel,
          metadata.cycle,
          metadata.grade,
          metadata.subject
        ].filter(Boolean),
        type: ContentType.PDF, // Assuming books are PDF files
        uploadedBy: 'current-user-id' // Replace with actual user ID
      });

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Perform the actual upload using the presigned URL
      const response = await fetch(uploadResponse.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!response.ok) throw new Error('Upload failed');

      // Clear interval and set progress to 100%
      clearInterval(uploadInterval);
      setProgress(100);

      // Reset form
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setMetadata({
          title: '',
          author: '',
          publisher: '',
          publicationYear: new Date().getFullYear(),
          description: '',
          educationLevel: 'FUNDAMENTAL',
          cycle: '',
          grade: '',
          subject: '',
          tags: []
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!metadata.tags.includes(tagInput.trim())) {
        setMetadata(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getAvailableCycles = () => {
    if (metadata.educationLevel === 'FUNDAMENTAL') {
      return Object.keys(BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles);
    }
    return [];
  };

  const getAvailableGrades = () => {
    if (metadata.educationLevel === 'INFANTIL') {
      const stages = BRAZILIAN_EDUCATION.INFANTIL.stages;
      return [
        ...stages.CRECHE.groups.map(g => g.name),
        ...stages.PRE_ESCOLA.groups.map(g => g.name)
      ];
    } else if (metadata.educationLevel === 'FUNDAMENTAL' && metadata.cycle) {
      const cycleKey = metadata.cycle as keyof typeof BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles;
      return BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles[cycleKey].grades.map(g => g.key);
    } else if (metadata.educationLevel === 'MEDIO') {
      return BRAZILIAN_EDUCATION.MEDIO.grades.map(g => g.key);
    }
    return [];
  };

  const getAvailableSubjects = () => {
    if (metadata.educationLevel === 'FUNDAMENTAL') {
      if (metadata.cycle === 'ANOS_INICIAIS') {
        return CORE_SUBJECTS.FUNDAMENTAL_INICIAL;
      } else if (metadata.cycle === 'ANOS_FINAIS') {
        return CORE_SUBJECTS.FUNDAMENTAL_FINAL;
      }
    } else if (metadata.educationLevel === 'MEDIO') {
      return CORE_SUBJECTS.MEDIO;
    }
    return [];
  };

  const getGradeName = (gradeKey: string) => {
    if (metadata.educationLevel === 'INFANTIL') {
      return gradeKey; // For infantil, we're using the full name already
    } else if (metadata.educationLevel === 'FUNDAMENTAL' && metadata.cycle) {
      const cycleKey = metadata.cycle as keyof typeof BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles;
      const grade = BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles[cycleKey].grades.find(g => g.key === gradeKey);
      return grade ? grade.name : gradeKey;
    } else if (metadata.educationLevel === 'MEDIO') {
      const grade = BRAZILIAN_EDUCATION.MEDIO.grades.find(g => g.key === gradeKey);
      return grade ? grade.name : gradeKey;
    }
    return gradeKey;
  };

  const getCycleName = (cycleKey: string) => {
    if (metadata.educationLevel === 'FUNDAMENTAL') {
      const key = cycleKey as keyof typeof BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles;
      return BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles[key].name;
    }
    return cycleKey;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Upload de Livros por Ciclo de Ensino</h2>

      <div className="space-y-6">
        {/* Education Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Ensino
          </label>
          <select
            value={metadata.educationLevel}
            onChange={e => setMetadata(prev => ({ 
              ...prev, 
              educationLevel: e.target.value as 'INFANTIL' | 'FUNDAMENTAL' | 'MEDIO',
              cycle: '',
              grade: '',
              subject: ''
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.keys(BRAZILIAN_EDUCATION).map(level => (
              <option key={level} value={level}>
                {BRAZILIAN_EDUCATION[level as keyof typeof BRAZILIAN_EDUCATION].name}
              </option>
            ))}
          </select>
        </div>

        {/* Cycle Selection (for Fundamental) */}
        {metadata.educationLevel === 'FUNDAMENTAL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciclo
            </label>
            <select
              value={metadata.cycle}
              onChange={e => setMetadata(prev => ({ 
                ...prev, 
                cycle: e.target.value,
                grade: '',
                subject: ''
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um ciclo</option>
              {getAvailableCycles().map(cycle => (
                <option key={cycle} value={cycle}>
                  {getCycleName(cycle)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grade Selection */}
        {((metadata.educationLevel === 'FUNDAMENTAL' && metadata.cycle) || 
          metadata.educationLevel === 'MEDIO' || 
          metadata.educationLevel === 'INFANTIL') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metadata.educationLevel === 'INFANTIL' ? 'Grupo' : 'Ano'}
            </label>
            <select
              value={metadata.grade}
              onChange={e => setMetadata(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione {metadata.educationLevel === 'INFANTIL' ? 'um grupo' : 'um ano'}</option>
              {getAvailableGrades().map(grade => (
                <option key={grade} value={grade}>
                  {getGradeName(grade)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject Selection */}
        {((metadata.educationLevel === 'FUNDAMENTAL' && metadata.cycle) || 
          metadata.educationLevel === 'MEDIO') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina
            </label>
            <select
              value={metadata.subject}
              onChange={e => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione uma disciplina</option>
              {getAvailableSubjects().map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Book Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Livro
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o título do livro"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Autor
          </label>
          <input
            type="text"
            value={metadata.author}
            onChange={e => setMetadata(prev => ({ ...prev, author: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome do autor"
          />
        </div>

        {/* Publisher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Editora
          </label>
          <input
            type="text"
            value={metadata.publisher}
            onChange={e => setMetadata(prev => ({ ...prev, publisher: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome da editora"
          />
        </div>

        {/* Publication Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano de Publicação
          </label>
          <input
            type="number"
            value={metadata.publicationYear}
            onChange={e => setMetadata(prev => ({ ...prev, publicationYear: parseInt(e.target.value) || new Date().getFullYear() }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o ano de publicação"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={metadata.description}
            onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Digite uma descrição para o livro"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags Adicionais
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {metadata.tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite tags adicionais e pressione Enter"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivo do Livro (PDF)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.epub"
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">{progress}% concluído</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}