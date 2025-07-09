'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft,
  Save,
  Eye,
  Code,
  Settings,
  Palette,
  Type,
  Image,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  Undo,
  Redo,
  Copy,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TemplateData {
  id?: string;
  name: string;
  subject: string;
  message: string;
  html: boolean;
  category: string;
  is_public: boolean;
}

interface EmailStyles {
  contentWidth: number;
  contentAlignment: 'left' | 'center' | 'right';
  backgroundColor: string;
  contentBackgroundColor: string;
  backgroundImage: string;
  defaultFont: string;
  linkColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  headingColor: string;
  borderRadius: number;
  padding: number;
  margin: number;
}

const defaultStyles: EmailStyles = {
  contentWidth: 610,
  contentAlignment: 'center',
  backgroundColor: '#f3f3f3',
  contentBackgroundColor: 'transparent',
  backgroundImage: '',
  defaultFont: 'Helvetica Neue',
  linkColor: '#000000',
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  textColor: '#374151',
  headingColor: '#1f2937',
  borderRadius: 8,
  padding: 20,
  margin: 0
};

const fontOptions = [
  'Helvetica Neue',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Tahoma',
  'Courier New'
];

export default function TemplateEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('id');
  const isEditing = !!templateId;

  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    subject: '',
    message: '',
    html: true,
    category: 'custom',
    is_public: false
  });

  const [styles, setStyles] = useState<EmailStyles>(defaultStyles);
  const [activeTab, setActiveTab] = useState<'content' | 'rows' | 'settings'>('content');
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);

  // Carregar template se estiver editando
  useEffect(() => {
    if (isEditing && templateId) {
      loadTemplate(templateId);
    }
  }, [isEditing, templateId]);

  // Gerar HTML inicial apenas uma vez
  useEffect(() => {
    if (!htmlCode) {
      generateHtml();
    }
  }, []);

  const loadTemplate = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/templates/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setTemplateData(result.data);
        if (result.data.html) {
          setHtmlCode(result.data.message);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHtml = () => {
    if (viewMode === 'html') return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateData.subject}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: ${styles.backgroundColor};
            font-family: ${styles.defaultFont}, Arial, sans-serif;
            line-height: 1.6;
            color: ${styles.textColor};
          }
          .email-container {
            max-width: ${styles.contentWidth}px;
            margin: 0 auto;
            background-color: ${styles.contentBackgroundColor !== 'transparent' ? styles.contentBackgroundColor : 'white'};
            border-radius: ${styles.borderRadius}px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .email-content {
            padding: ${styles.padding}px;
          }
          h1, h2, h3, h4, h5, h6 {
            color: ${styles.headingColor};
            margin-top: 0;
          }
          a {
            color: ${styles.linkColor};
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${styles.primaryColor};
            color: white;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 10px 0;
          }
          .button:hover {
            background-color: ${styles.secondaryColor};
            color: white;
            text-decoration: none;
          }
          .header {
            background-color: ${styles.primaryColor};
            color: white;
            padding: 20px;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              margin: 0 !important;
            }
            .email-content {
              padding: 15px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 style="margin: 0;">${templateData.subject}</h1>
          </div>
          <div class="email-content">
            ${templateData.message.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>Portal Educacional - Sabercon</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    setHtmlCode(html);
  };

  const saveTemplate = async () => {
    if (!templateData.name || !templateData.subject) {
      alert('Nome e assunto são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/notifications/templates';
      const method = isEditing ? 'PUT' : 'POST';
      const body = {
        ...templateData,
        message: viewMode === 'html' ? htmlCode : templateData.message,
        html: true,
        ...(isEditing && { id: templateId })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(isEditing ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
        router.push('/notifications/send');
      } else {
        alert(result.message || 'Erro ao salvar template');
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="flex items-center gap-2 text-white">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Carregando template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                      <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {isEditing ? 'Editando:' : 'Novo template'}
                </span>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do template"
                  className="text-lg font-semibold border-none outline-none bg-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

                      <div className="flex items-center gap-2">
              {/* Device Preview */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <Button
                  onClick={() => setDevice('desktop')}
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 ${device === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setDevice('tablet')}
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 ${device === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setDevice('mobile')}
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 ${device === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('preview')}
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 px-3 ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  onClick={() => setViewMode('html')}
                  variant={viewMode === 'html' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 px-3 ${viewMode === 'html' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'}`}
                >
                  <Code className="w-4 h-4 mr-1" />
                  HTML
                </Button>
              </div>

                          <Button
                onClick={saveTemplate}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-white border-r border-gray-200 h-full">
          <div className="flex flex-col items-center py-4 space-y-2">
            <Button
              onClick={() => setActiveTab('content')}
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 w-10 p-0"
              title="Conteúdo"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setActiveTab('rows')}
              variant={activeTab === 'rows' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 w-10 p-0"
              title="Layout"
            >
              <Layout className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setActiveTab('settings')}
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 w-10 p-0"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6">
          <div className="h-full">
            {viewMode === 'preview' ? (
              <div className="h-full flex items-center justify-center">
                <div 
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                  style={{ width: getDeviceWidth(), maxHeight: '80vh' }}
                >
                  <div 
                    ref={previewRef}
                    className="min-h-[600px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: htmlCode }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">HTML Code</span>
                  <Button
                    onClick={() => navigator.clipboard.writeText(htmlCode)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-[calc(100%-60px)] bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none outline-none border-none"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'content' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                CONTEÚDO
              </button>
              <button
                onClick={() => setActiveTab('rows')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'rows' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                LAYOUT
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'settings' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                CONFIGURAÇÕES
              </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto do Email
                  </label>
                  <input
                    type="text"
                    value={templateData.subject}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o assunto do email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo da Mensagem
                  </label>
                  <textarea
                    value={templateData.message}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, message: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Digite o conteúdo da mensagem..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode usar HTML ou texto simples
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={templateData.category}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="custom">Personalizado</option>
                    <option value="marketing">Marketing</option>
                    <option value="transactional">Transacional</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={templateData.is_public}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700">
                    Template público (outros usuários podem usar)
                  </label>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'rows' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura do conteúdo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="400"
                      max="800"
                      value={styles.contentWidth}
                      onChange={(e) => setStyles(prev => ({ ...prev, contentWidth: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{styles.contentWidth}px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alinhamento do conteúdo
                  </label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setStyles(prev => ({ ...prev, contentAlignment: 'left' }))}
                      variant={styles.contentAlignment === 'left' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Esquerda
                    </Button>
                    <Button
                      onClick={() => setStyles(prev => ({ ...prev, contentAlignment: 'center' }))}
                      variant={styles.contentAlignment === 'center' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Centro
                    </Button>
                    <Button
                      onClick={() => setStyles(prev => ({ ...prev, contentAlignment: 'right' }))}
                      variant={styles.contentAlignment === 'right' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Direita
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding interno
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={styles.padding}
                      onChange={(e) => setStyles(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{styles.padding}px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border radius
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={styles.borderRadius}
                      onChange={(e) => setStyles(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{styles.borderRadius}px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de fundo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.backgroundColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={styles.backgroundColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de fundo do conteúdo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.contentBackgroundColor === 'transparent' ? '#ffffff' : styles.contentBackgroundColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, contentBackgroundColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={styles.contentBackgroundColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, contentBackgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonte padrão
                  </label>
                  <select
                    value={styles.defaultFont}
                    onChange={(e) => setStyles(prev => ({ ...prev, defaultFont: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor dos links
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.linkColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, linkColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={styles.linkColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, linkColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor primária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.primaryColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={styles.primaryColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styles.secondaryColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={styles.secondaryColor}
                      onChange={(e) => setStyles(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 