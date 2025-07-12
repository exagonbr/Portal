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
import { number } from 'zod';
import { useSession } from 'next-auth/react';

interface TemplateData {
  id?: string;
  name: string;
  subject: string;
  message: string;
  html: boolean;
  category: string;
  is_public: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
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
    user_id: 0,
    html: true,
    category: 'custom',
    is_public: false,
    created_at: new Date(),
    updated_at: new Date()
  });

  const [styles, setStyles] = useState<EmailStyles>(defaultStyles);
  const [activeTab, setActiveTab] = useState<'content' | 'rows' | 'settings'>('content');
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [isHtmlModified, setIsHtmlModified] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        if (result.data.html && result.data.message) {
          setHtmlCode(result.data.message);
        } else {
          // Se não há HTML salvo, gerar um novo
          generateHtml();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHtml = () => {
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
              border-radius: 0 !important;
            }
            .email-content {
              padding: 15px !important;
            }
            .header {
              padding: 15px !important;
            }
            .footer {
              padding: 15px !important;
            }
            h1 {
              font-size: 24px !important;
            }
            h2 {
              font-size: 20px !important;
            }
            .button {
              display: block !important;
              width: 100% !important;
              text-align: center !important;
              margin: 15px 0 !important;
            }
          }
          
          @media only screen and (min-width: 601px) and (max-width: 768px) {
            .email-container {
              width: 95% !important;
              margin: 0 auto !important;
            }
            .email-content {
              padding: 20px !important;
            }
            .button {
              margin: 12px 0 !important;
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

  const updateHtmlFromTemplate = () => {
    generateHtml();
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setSelectedElement(null);
    
    // Aguardar o DOM atualizar completamente
    setTimeout(() => {
      if (previewRef.current) {
        // Limpar qualquer processamento anterior
        removeEditableElements(previewRef.current);
        
        // Aguardar um pouco mais para garantir limpeza
        setTimeout(() => {
          if (previewRef.current) {
            makeElementsEditable(previewRef.current);
          }
        }, 100);
      }
    }, 200);
  };

  const disableEditMode = () => {
    // Limpar seleção primeiro
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.style.backgroundColor = '';
      selectedElement.removeAttribute('contenteditable');
    }
    
    setSelectedElement(null);
    setIsEditMode(false);
    
    // Limpar elementos editáveis
    if (previewRef.current) {
      removeEditableElements(previewRef.current);
    }
  };

    const makeElementsEditable = (container: HTMLElement) => {
    // Limpar processamento anterior se existir
    if ((container as any)._editableProcessed) {
      removeEditableElements(container);
    }
    
    const editableElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, .email-content, .header, .footer, img');
    
    editableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      // Pular elementos muito pequenos ou sem conteúdo
      if (htmlElement.offsetWidth < 10 || htmlElement.offsetHeight < 10) {
        return;
      }
      
      // Limpar handlers anteriores se existirem
      if ((htmlElement as any)._editHandlers) {
        const handlers = (htmlElement as any)._editHandlers;
        Object.keys(handlers).forEach(eventType => {
          htmlElement.removeEventListener(eventType, handlers[eventType]);
        });
        delete (htmlElement as any)._editHandlers;
      }
      
      // Adicionar estilos para indicar que é editável
      htmlElement.style.outline = '1px dashed rgba(59, 130, 246, 0.3)';
      htmlElement.style.cursor = 'move';
      htmlElement.style.transition = 'all 0.2s ease';
      htmlElement.style.position = 'relative';
      
      // Tornar o elemento arrastável
      htmlElement.draggable = true;
      
      // Adicionar evento de clique
      const clickHandler = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        selectElement(htmlElement);
      };
      
      // Adicionar eventos de drag
      const dragStartHandler = (e: DragEvent) => {
        setDraggedElement(htmlElement);
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', htmlElement.outerHTML);
        }
        htmlElement.style.opacity = '0.5';
      };
      
      const dragEndHandler = () => {
        htmlElement.style.opacity = '1';
        setDraggedElement(null);
      };
      
      const dragOverHandler = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      };
      
      const dropHandler = (e: DragEvent) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== htmlElement) {
          // Trocar posições dos elementos
          const draggedParent = draggedElement.parentNode;
          const draggedNextSibling = draggedElement.nextSibling;
          const targetParent = htmlElement.parentNode;
          const targetNextSibling = htmlElement.nextSibling;
          
          if (draggedParent && targetParent) {
            draggedParent.insertBefore(htmlElement, draggedNextSibling);
            targetParent.insertBefore(draggedElement, targetNextSibling);
          }
          
          debouncedUpdateHtml();
        }
      };
      
      // Adicionar hover effect
      const mouseEnterHandler = () => {
        if (selectedElement !== htmlElement) {
          htmlElement.style.outline = '2px solid rgba(59, 130, 246, 0.8)';
          htmlElement.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        }
      };
      
      const mouseLeaveHandler = () => {
        if (selectedElement !== htmlElement) {
          htmlElement.style.outline = '1px dashed rgba(59, 130, 246, 0.3)';
          htmlElement.style.backgroundColor = '';
        }
      };
      
      // Adicionar menu de contexto
      const contextMenuHandler = (e: Event) => {
        e.preventDefault();
        const mouseEvent = e as MouseEvent;
        setAddMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
        setShowAddMenu(true);
        selectElement(htmlElement);
      };
      
      // Adicionar event listeners
      htmlElement.addEventListener('click', clickHandler, true); // Use capture
      htmlElement.addEventListener('dragstart', dragStartHandler);
      htmlElement.addEventListener('dragend', dragEndHandler);
      htmlElement.addEventListener('dragover', dragOverHandler);
      htmlElement.addEventListener('drop', dropHandler);
      htmlElement.addEventListener('mouseenter', mouseEnterHandler);
      htmlElement.addEventListener('mouseleave', mouseLeaveHandler);
      htmlElement.addEventListener('contextmenu', contextMenuHandler);
      
      // Armazenar handlers para remoção posterior
      (htmlElement as any)._editHandlers = {
        click: clickHandler,
        mouseenter: mouseEnterHandler,
        mouseleave: mouseLeaveHandler,
        dragstart: dragStartHandler,
        dragend: dragEndHandler,
        dragover: dragOverHandler,
        drop: dropHandler,
        contextmenu: contextMenuHandler
      };
    });
    
    // Marcar como processado
    (container as any)._editableProcessed = true;
  };

  const removeEditableElements = (container: HTMLElement) => {
    // Verificar se já foi processado
    if (!(container as any)._editableProcessed) return;
    
    const elements = container.querySelectorAll('*');
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Remover estilos de edição apenas se necessário
      if (htmlElement.style.outline) htmlElement.style.outline = '';
      if (htmlElement.style.cursor) htmlElement.style.cursor = '';
      if (htmlElement.style.transition) htmlElement.style.transition = '';
      if (htmlElement.style.position) htmlElement.style.position = '';
      if (htmlElement.style.backgroundColor) htmlElement.style.backgroundColor = '';
      if (htmlElement.hasAttribute('contenteditable')) htmlElement.removeAttribute('contenteditable');
      
      // Remover event listeners se existirem
      if ((htmlElement as any)._editHandlers) {
        const handlers = (htmlElement as any)._editHandlers;
        htmlElement.removeEventListener('click', handlers.click);
        htmlElement.removeEventListener('mouseenter', handlers.mouseenter);
        htmlElement.removeEventListener('mouseleave', handlers.mouseleave);
        htmlElement.removeEventListener('dragstart', handlers.dragstart);
        htmlElement.removeEventListener('dragend', handlers.dragend);
        htmlElement.removeEventListener('dragover', handlers.dragover);
        htmlElement.removeEventListener('drop', handlers.drop);
        htmlElement.removeEventListener('contextmenu', handlers.contextmenu);
        htmlElement.draggable = false;
        delete (htmlElement as any)._editHandlers;
      }
    });
    
    // Remover marcador de processamento
    delete (container as any)._editableProcessed;
  };

  const selectElement = (element: HTMLElement) => {
    // Remover seleção anterior
    if (selectedElement) {
      selectedElement.style.outline = '1px dashed rgba(59, 130, 246, 0.3)';
      selectedElement.style.backgroundColor = '';
      selectedElement.removeAttribute('contenteditable');
    }
    
    // Selecionar novo elemento
    setSelectedElement(element);
    element.style.outline = '3px solid #3b82f6';
    element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    
    // Fazer o elemento editável se for texto
    if (element.tagName.toLowerCase() !== 'img' && 
        !element.classList.contains('email-container') &&
        !element.classList.contains('header') &&
        !element.classList.contains('footer')) {
      element.contentEditable = 'true';
      
      // Focar no elemento após um pequeno delay
      setTimeout(() => {
        element.focus();
      }, 100);
    }
  };

  const updateElementStyle = (property: string, value: string) => {
    if (selectedElement) {
      selectedElement.style.setProperty(property, value);
      // Debounce para evitar muitas atualizações
      debouncedUpdateHtml();
    }
  };

  const updateElementText = (text: string) => {
    if (selectedElement) {
      selectedElement.textContent = text;
      // Debounce para evitar muitas atualizações
      debouncedUpdateHtml();
    }
  };

  // Função debounced para atualizar HTML
  const debouncedUpdateHtml = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateHtmlFromPreview();
      }, 300);
    };
  })();

  // Função para deletar elemento
  const deleteElement = () => {
    if (selectedElement && selectedElement.parentNode) {
      selectedElement.parentNode.removeChild(selectedElement);
      setSelectedElement(null);
      setShowAddMenu(false);
      debouncedUpdateHtml();
    }
  };

  // Função para adicionar texto
  const addTextElement = (tag: string = 'p') => {
    if (selectedElement && selectedElement.parentNode) {
      const newElement = document.createElement(tag);
      newElement.textContent = 'Novo texto';
      newElement.style.margin = '10px 0';
      
      selectedElement.parentNode.insertBefore(newElement, selectedElement.nextSibling);
      setShowAddMenu(false);
      debouncedUpdateHtml();
      
      // Tornar o novo elemento editável
      setTimeout(() => {
        makeElementsEditable(previewRef.current!);
        selectElement(newElement);
      }, 100);
    }
  };

  // Função para adicionar imagem
  const addImageElement = () => {
    const imageUrl = prompt('Digite a URL da imagem:');
    if (imageUrl && selectedElement && selectedElement.parentNode) {
      const newElement = document.createElement('img');
      newElement.src = imageUrl;
      newElement.style.maxWidth = '100%';
      newElement.style.height = 'auto';
      newElement.style.margin = '10px 0';
      newElement.alt = 'Imagem';
      
      selectedElement.parentNode.insertBefore(newElement, selectedElement.nextSibling);
      setShowAddMenu(false);
      debouncedUpdateHtml();
      
      // Tornar o novo elemento editável
      setTimeout(() => {
        makeElementsEditable(previewRef.current!);
        selectElement(newElement);
      }, 100);
    }
  };

  // Função para adicionar botão
  const addButtonElement = () => {
    if (selectedElement && selectedElement.parentNode) {
      const newElement = document.createElement('a');
      newElement.href = '#';
      newElement.textContent = 'Novo Botão';
      newElement.className = 'button';
      newElement.style.display = 'inline-block';
      newElement.style.padding = '12px 24px';
      newElement.style.backgroundColor = styles.primaryColor;
      newElement.style.color = 'white';
      newElement.style.borderRadius = '6px';
      newElement.style.textDecoration = 'none';
      newElement.style.fontWeight = 'bold';
      newElement.style.margin = '10px 0';
      
      selectedElement.parentNode.insertBefore(newElement, selectedElement.nextSibling);
      setShowAddMenu(false);
      debouncedUpdateHtml();
      
      // Tornar o novo elemento editável
      setTimeout(() => {
        makeElementsEditable(previewRef.current!);
        selectElement(newElement);
      }, 100);
    }
  };

  // Função para duplicar elemento
  const duplicateElement = () => {
    if (selectedElement && selectedElement.parentNode) {
      const clonedElement = selectedElement.cloneNode(true) as HTMLElement;
      selectedElement.parentNode.insertBefore(clonedElement, selectedElement.nextSibling);
      setShowAddMenu(false);
      debouncedUpdateHtml();
      
      // Tornar o novo elemento editável
      setTimeout(() => {
        makeElementsEditable(previewRef.current!);
        selectElement(clonedElement);
      }, 100);
    }
  };

  const updateHtmlFromPreview = () => {
    if (previewRef.current) {
      // Criar uma cópia limpa do HTML sem os estilos de edição
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = previewRef.current.innerHTML;
      
      // Remover estilos de edição
      const elements = tempDiv.querySelectorAll('*');
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.outline = '';
        htmlElement.style.cursor = '';
        htmlElement.style.transition = '';
        htmlElement.removeAttribute('contenteditable');
      });
      
      // Reconstruir o HTML completo
      const fullHtml = `
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
          ${tempDiv.innerHTML}
        </body>
        </html>
      `;
      
      setHtmlCode(fullHtml);
    }
  };

  const { data: session, status } = useSession();

  // Atualizar HTML quando o preview muda (com debounce)
  useEffect(() => {


    
    if (isEditMode && previewRef.current) {
      let timeoutId: NodeJS.Timeout;
      
      const debouncedUpdate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          updateHtmlFromPreview();
        }, 500); // Debounce de 500ms
      };
      
      const observer = new MutationObserver(debouncedUpdate);
      
      observer.observe(previewRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false // Reduzir observações desnecessárias
      });
      
      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [isEditMode]);

  // Ativar modo de edição quando o preview é carregado (apenas uma vez)
  useEffect(() => {
    if (isEditMode && previewRef.current && htmlCode) {
      setTimeout(() => {
        if (previewRef.current) {
          makeElementsEditable(previewRef.current);
        }
      }, 200);
    }
  }, [isEditMode, htmlCode]);

  // Refletir mudanças do menu lateral no preview (apenas quando não estiver em modo de edição)
  useEffect(() => {
    if (viewMode === 'preview' && !isEditMode && !htmlCode) {
      generateHtml();
    }
  }, [templateData, styles]);

  // Limpar estilos quando elemento é deselected
  useEffect(() => {
    return () => {
      if (selectedElement) {
        selectedElement.style.outline = '1px dashed rgba(59, 130, 246, 0.3)';
        selectedElement.style.backgroundColor = '';
        selectedElement.removeAttribute('contenteditable');
      }
    };
  }, [selectedElement]);

  // Reprocessar elementos quando o dispositivo muda
  useEffect(() => {
    setIsTransitioning(true);
    
    if (isEditMode && previewRef.current) {
      // Limpar processamento anterior
      delete (previewRef.current as any)._editableProcessed;
      
      // Reprocessar após mudança de dispositivo
      setTimeout(() => {
        if (previewRef.current) {
          makeElementsEditable(previewRef.current);
        }
        setIsTransitioning(false);
      }, 300);
    } else {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [device, isEditMode]);

  const saveTemplate = async () => {
    if (!templateData.name || !templateData.subject) {
      alert('Nome e assunto são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      // Obter user_id da sessão
      const user_id = session?.user?.id || 1;
      
      const url = isEditing ? `/api/notifications/templates/${templateId}` : '/api/notifications/templates';
      const method = isEditing ? 'PUT' : 'POST';
      
      const now = new Date().toISOString();
      
      const body = {
        name: templateData.name,
        subject: templateData.subject,
        message: htmlCode, // HTML completo
        html: true,
        category: templateData.category || 'custom',
        is_public: templateData.is_public || false,
        user_id: typeof user_id === 'string' ? parseInt(user_id) : user_id,
        created_by: session?.user?.name || session?.user?.email || 'Sistema',
        created_at: isEditing ? templateData.created_at : now,
        updated_at: now
      };

      console.log('📤 Enviando payload:', body);

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
        console.error('❌ Erro ao salvar:', result);
        alert(result.message || 'Erro ao salvar template');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar template:', error);
      alert('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '1024px'; // Desktop width
    }
  };

  const getDeviceHeight = () => {
    switch (device) {
      case 'mobile': return '667px'; // iPhone height
      case 'tablet': return '1024px'; // iPad height
      default: return 'auto';
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
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                      <div className="flex items-center gap-4">
                          <Button
              onClick={() => router.push('/notifications/send')}
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
                <button
                  onClick={() => setDevice('desktop')}
                  className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-all ${
                    device === 'desktop' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-all ${
                    device === 'tablet' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`h-8 w-8 p-0 rounded flex items-center justify-center transition-all ${
                    device === 'mobile' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`h-8 px-3 rounded flex items-center gap-1 transition-all ${
                    viewMode === 'preview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('html')}
                  className={`h-8 px-3 rounded flex items-center gap-1 transition-all ${
                    viewMode === 'html' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  HTML
                </button>
              </div>

              {/* Edit Mode Toggle */}
              {viewMode === 'preview' && (
                <>
                  <button
                    onClick={isEditMode ? disableEditMode : enableEditMode}
                    className={`h-8 px-3 rounded flex items-center gap-1 transition-all ${
                      isEditMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    {isEditMode ? 'Sair da Edição' : 'Editar Visual'}
                  </button>
                  
                  {!isEditMode && (
                    <button
                      onClick={updateHtmlFromTemplate}
                      className="h-8 px-3 rounded flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-600 transition-all"
                      title="Regenerar HTML do template"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerar
                    </button>
                  )}
                </>
              )}

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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-16 lg:w-16 bg-gray-800 border-r border-gray-700 h-full hidden md:block">
          <div className="flex flex-col items-center py-4 space-y-2">
            <Button
              onClick={() => setActiveTab('content')}
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 w-10 p-0 ${activeTab === 'content' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              title="Conteúdo"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setActiveTab('rows')}
              variant={activeTab === 'rows' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 w-10 p-0 ${activeTab === 'rows' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              title="Layout"
            >
              <Layout className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setActiveTab('settings')}
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 w-10 p-0 ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 lg:p-6 relative">
          {/* Mobile Controls */}
          <div className="sm:hidden absolute top-4 right-4 z-10">
            <Button
              onClick={() => setShowMobilePanel(true)}
              variant="ghost"
              size="sm"
              className="bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-full">
            {viewMode === 'preview' ? (
              <div className="h-full overflow-y-auto py-4">
                <div className="flex justify-center min-h-full">
                  <div className="relative">
                    {/* Device Frame */}
                    <div 
                      className={`
                        transition-all duration-300 relative overflow-hidden
                        ${device === 'mobile' ? 'bg-gray-800 rounded-[2rem] p-2' : ''}
                        ${device === 'tablet' ? 'bg-gray-800 rounded-[1.5rem] p-3' : ''}
                        ${device === 'desktop' ? '' : ''}
                      `}
                      style={{ 
                        width: device === 'desktop' ? getDeviceWidth() : `calc(${getDeviceWidth()} + ${device === 'mobile' ? '16px' : '24px'})`,
                        height: device === 'desktop' ? 'auto' : `calc(${getDeviceHeight()} + ${device === 'mobile' ? '16px' : '24px'})`
                      }}
                    >
                      {/* Device Screen */}
                      <div 
                        className={`
                          bg-white shadow-lg overflow-y-auto transition-all duration-300 relative
                          ${device === 'mobile' ? 'rounded-[1.5rem]' : ''}
                          ${device === 'tablet' ? 'rounded-[1rem]' : ''}
                          ${device === 'desktop' ? 'rounded-lg' : ''}
                        `}
                        style={{ 
                          width: getDeviceWidth(),
                          height: getDeviceHeight(),
                          maxHeight: device === 'desktop' ? '80vh' : getDeviceHeight()
                        }}
                      >
                        {/* Device Info */}
                        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {device === 'mobile' ? '📱 Mobile' : device === 'tablet' ? '📱 Tablet' : '🖥️ Desktop'}
                          {' '}({getDeviceWidth()})
                        </div>

                        {isEditMode && (
                          <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                            Modo Edição Ativo
                          </div>
                        )}

                        {isTransitioning && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
                            <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-sm">Ajustando visualização...</span>
                            </div>
                          </div>
                        )}

                        <div 
                          ref={previewRef}
                          className="min-h-full w-full"
                          style={{ 
                            fontSize: device === 'mobile' ? '14px' : device === 'tablet' ? '15px' : '16px',
                            lineHeight: device === 'mobile' ? '1.4' : '1.6',
                            transform: device === 'mobile' ? 'scale(0.9)' : device === 'tablet' ? 'scale(0.95)' : 'scale(1)',
                            transformOrigin: 'top left'
                          }}
                          dangerouslySetInnerHTML={{ __html: htmlCode }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">HTML Code</span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={updateHtmlFromTemplate}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      title="Regenerar HTML do template"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => navigator.clipboard.writeText(htmlCode)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      title="Copiar HTML"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
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
        <div className="w-80 lg:w-80 md:w-72 bg-gray-800 border-l border-gray-700 h-full overflow-y-auto hidden sm:block">
          <div className="p-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'content' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-300 hover:text-gray-100'
                }`}
              >
                CONTEÚDO
              </button>
              <button
                onClick={() => setActiveTab('rows')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'rows' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-300 hover:text-gray-100'
                }`}
              >
                LAYOUT
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'settings' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-300 hover:text-gray-100'
                }`}
              >
                CONFIGURAÇÕES
              </button>
            </div>

            {/* Visual Editor Panel */}
            {isEditMode && selectedElement && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-medium">Elemento Selecionado</h3>
                  <Button
                    onClick={() => setSelectedElement(null)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {selectedElement.tagName.toLowerCase()} 
                  {selectedElement.className && ` .${selectedElement.className.split(' ').join('.')}`}
                </p>
                <div className="space-y-4">
                  {selectedElement.tagName.toLowerCase() === 'img' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        URL da Imagem
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as HTMLImageElement).src || ''}
                        onChange={(e) => {
                          (selectedElement as HTMLImageElement).src = e.target.value;
                          debouncedUpdateHtml();
                        }}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                      />
                      <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">
                        Texto Alternativo
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as HTMLImageElement).alt || ''}
                        onChange={(e) => {
                          (selectedElement as HTMLImageElement).alt = e.target.value;
                          debouncedUpdateHtml();
                        }}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto
                      </label>
                      <input
                        type="text"
                        value={selectedElement.textContent || ''}
                        onChange={(e) => updateElementText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cor do Texto
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.style.color || '#000000'}
                        onChange={(e) => updateElementStyle('color', e.target.value)}
                        className="w-10 h-10 border border-gray-600 rounded"
                      />
                      <input
                        type="text"
                        value={selectedElement.style.color || '#000000'}
                        onChange={(e) => updateElementStyle('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cor de Fundo
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElementStyle('background-color', e.target.value)}
                        className="w-10 h-10 border border-gray-600 rounded"
                      />
                      <input
                        type="text"
                        value={selectedElement.style.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElementStyle('background-color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tamanho da Fonte
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="48"
                      value={parseInt(selectedElement.style.fontSize || '16')}
                      onChange={(e) => updateElementStyle('font-size', e.target.value + 'px')}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{selectedElement.style.fontSize || '16px'}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alinhamento
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateElementStyle('text-align', 'left')}
                        variant="ghost"
                        size="sm"
                        className={`text-gray-300 hover:text-white hover:bg-gray-600 ${
                          selectedElement.style.textAlign === 'left' ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        Esquerda
                      </Button>
                      <Button
                        onClick={() => updateElementStyle('text-align', 'center')}
                        variant="ghost"
                        size="sm"
                        className={`text-gray-300 hover:text-white hover:bg-gray-600 ${
                          selectedElement.style.textAlign === 'center' ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        Centro
                      </Button>
                      <Button
                        onClick={() => updateElementStyle('text-align', 'right')}
                        variant="ghost"
                        size="sm"
                        className={`text-gray-300 hover:text-white hover:bg-gray-600 ${
                          selectedElement.style.textAlign === 'right' ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        Direita
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Peso da Fonte
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateElementStyle('font-weight', 'normal')}
                        variant="ghost"
                        size="sm"
                        className={`text-gray-300 hover:text-white hover:bg-gray-600 ${
                          selectedElement.style.fontWeight === 'normal' ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        Normal
                      </Button>
                      <Button
                        onClick={() => updateElementStyle('font-weight', 'bold')}
                        variant="ghost"
                        size="sm"
                        className={`text-gray-300 hover:text-white hover:bg-gray-600 ${
                          selectedElement.style.fontWeight === 'bold' ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        Negrito
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Padding
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(selectedElement.style.padding || '0')}
                      onChange={(e) => updateElementStyle('padding', e.target.value + 'px')}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{selectedElement.style.padding || '0px'}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Margin
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(selectedElement.style.margin || '0')}
                      onChange={(e) => updateElementStyle('margin', e.target.value + 'px')}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{selectedElement.style.margin || '0px'}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Ações
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={duplicateElement}
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicar
                      </Button>
                      <Button
                        onClick={deleteElement}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        🗑️ Excluir
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Adicionar Elemento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => addTextElement('p')}
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          <Type className="w-4 h-4 mr-1" />
                          Texto
                        </Button>
                        <Button
                          onClick={() => addTextElement('h2')}
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          📝 Título
                        </Button>
                        <Button
                          onClick={addImageElement}
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          <Image className="w-4 h-4 mr-1" />
                          Imagem
                        </Button>
                        <Button
                          onClick={addButtonElement}
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:text-white hover:bg-gray-600"
                        >
                          🔘 Botão
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assunto do Email
                  </label>
                  <input
                    type="text"
                    value={templateData.subject}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Digite o assunto do email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Conteúdo da Mensagem
                  </label>
                  <textarea
                    value={templateData.message}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, message: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Digite o conteúdo da mensagem..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Você pode usar HTML ou texto simples
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={templateData.category}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
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
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-300">
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

      {/* Mobile Panel */}
      {showMobilePanel && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-gray-800 w-full max-h-[70vh] overflow-y-auto rounded-t-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-white font-medium">Configurações</h3>
              <Button
                onClick={() => setShowMobilePanel(false)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              {/* Tabs */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'content' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-300 hover:text-gray-100'
                  }`}
                >
                  CONTEÚDO
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'settings' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-300 hover:text-gray-100'
                  }`}
                >
                  CONFIGURAÇÕES
                </button>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assunto do Email
                    </label>
                    <input
                      type="text"
                      value={templateData.subject}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Digite o assunto do email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Conteúdo da Mensagem
                    </label>
                    <textarea
                      value={templateData.message}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Digite o conteúdo da mensagem..."
                    />
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cor primária
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styles.primaryColor}
                        onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 border border-gray-600 rounded"
                      />
                      <input
                        type="text"
                        value={styles.primaryColor}
                        onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      <span className="text-sm text-gray-300 w-12">{styles.contentWidth}px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showAddMenu && (
        <div 
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 py-2 min-w-[200px]"
          style={{ left: addMenuPosition.x, top: addMenuPosition.y }}
        >
          <div className="px-3 py-2 text-gray-300 text-sm border-b border-gray-700">
            Menu de Contexto
          </div>
          
          <button
            onClick={duplicateElement}
            className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Duplicar Elemento
          </button>
          
          <button
            onClick={deleteElement}
            className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
          >
            🗑️ Excluir Elemento
          </button>
          
          <div className="border-t border-gray-700 mt-2 pt-2">
            <div className="px-3 py-1 text-gray-400 text-xs">Adicionar após este elemento:</div>
            
            <button
              onClick={() => addTextElement('p')}
              className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Parágrafo
            </button>
            
            <button
              onClick={() => addTextElement('h2')}
              className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
            >
              📝 Título
            </button>
            
            <button
              onClick={addImageElement}
              className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Imagem
            </button>
            
            <button
              onClick={addButtonElement}
              className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
            >
              🔘 Botão
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar menu de contexto */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
} 