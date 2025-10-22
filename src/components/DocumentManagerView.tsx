import React, { useState, useEffect } from 'react';
import '../styles/document-manager.css';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadDate: string;
  url?: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
}

interface DocumentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface DocumentManagerViewProps {
  data: { documents?: Document[] };

  clientName: string;
  clientId?: string;
  readOnly?: boolean;
}

const DocumentManagerView: React.FC<DocumentManagerViewProps> = ({ 
  data, 
  clientName, 
  clientId,
  readOnly = false 
}) => {
  const [documents, setDocuments] = useState<Document[]>(data?.documents || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const documentCategories: DocumentCategory[] = [
    { id: 'radiography', name: 'Radiografias', icon: '🦷', color: '#3b82f6', description: 'Radiografias periapicais, panorâmicas, bite-wing' },
    { id: 'photos', name: 'Fotografias', icon: '📷', color: '#10b981', description: 'Fotos intraorais e extraorais' },
    { id: 'exams', name: 'Exames', icon: '🔬', color: '#f59e0b', description: 'Exames laboratoriais e complementares' },
    { id: 'prescriptions', name: 'Receitas', icon: '💊', color: '#ef4444', description: 'Receitas médicas e odontológicas' },
    { id: 'contracts', name: 'Contratos', icon: '📄', color: '#8b5cf6', description: 'Termos de consentimento, contratos' },
    { id: 'insurance', name: 'Convênio', icon: '🏥', color: '#06b6d4', description: 'Documentos de convênios e seguros' },
    { id: 'reports', name: 'Laudos', icon: '📋', color: '#84cc16', description: 'Laudos médicos e odontológicos' },
    { id: 'others', name: 'Outros', icon: '📁', color: '#6b7280', description: 'Outros documentos diversos' }
  ];

  useEffect(() => {
    if (clientId) {
      loadDocuments();
    } else if (data.documents) {
      setDocuments(data.documents);
    }
  }, [data, clientId]);

  const loadDocuments = async () => {
    if (!clientId) return;
    
    try {
      const response = await fetch(`/api/clients/${clientId}/documents`);
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.documents || []);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📕';
    if (fileType.includes('word')) return '📄';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryInfo = (categoryId: string) => {
    return documentCategories.find(cat => cat.id === categoryId) || 
           { id: 'others', name: 'Outros', icon: '📁', color: '#6b7280', description: 'Documentos diversos' };
  };

  const handleFileUpload = async (files: FileList, category: string, description?: string) => {
    if (!files.length || readOnly || !clientId) return;

    setUploadingFiles(true);

    try {
      const formData = new FormData();
      
      // Adicionar arquivos ao FormData
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      // Adicionar metadados
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        await loadDocuments(); // Recarregar lista de documentos
        setShowUploadModal(false);
        alert(`${result.documents.length} documento(s) enviado(s) com sucesso!`);
      } else {
        const error = await response.json();
        alert(`Erro ao enviar documentos: ${error.error}`);
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar documentos. Verifique sua conexão e tente novamente.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (readOnly) return;
    
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        const response = await fetch(`/api/documents/${docId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadDocuments(); // Recarregar lista
          setSelectedDocument(null);
          alert('Documento excluído com sucesso!');
        } else {
          const error = await response.json();
          alert(`Erro ao excluir documento: ${error.error}`);
        }
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        alert('Erro ao excluir documento. Tente novamente.');
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(doc => doc.category === categoryId);
  };

  return (
    <div className="document-manager-container">
      <div className="document-manager-header">
        <h3>📁 Gerenciamento de Documentos</h3>
        <p className="manager-subtitle">Paciente: <strong>{clientName}</strong></p>
        
        <div className="manager-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {!readOnly && (
            <button 
              className="upload-btn primary"
              onClick={() => setShowUploadModal(true)}
            >
              📤 Enviar Documentos
            </button>
          )}
        </div>
      </div>

      <div className="document-manager-content">
        {/* Sidebar com categorias */}
        <div className="categories-sidebar">
          <h4>Categorias</h4>
          
          <div 
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span className="category-icon">📋</span>
            <span className="category-name">Todos</span>
            <span className="category-count">{documents.length}</span>
          </div>

          {documentCategories.map(category => {
            const count = getDocumentsByCategory(category.id).length;
            return (
              <div 
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Lista de documentos */}
        <div className="documents-main">
          {filteredDocuments.length === 0 ? (
            <div className="empty-documents">
              <div className="empty-icon">📄</div>
              <h4>Nenhum documento encontrado</h4>
              <p>
                {selectedCategory === 'all' 
                  ? "Ainda não há documentos para este paciente." 
                  : `Nenhum documento na categoria "${getCategoryInfo(selectedCategory).name}".`
                }
              </p>
              {!readOnly && (
                <button 
                  className="upload-btn secondary"
                  onClick={() => setShowUploadModal(true)}
                >
                  Enviar primeiro documento
                </button>
              )}
            </div>
          ) : (
            <div className="documents-grid">
              {filteredDocuments.map(doc => {
                const categoryInfo = getCategoryInfo(doc.category);
                return (
                  <div key={doc.id} className="document-card">
                    <div className="document-preview">
                      {doc.thumbnailUrl ? (
                        <img src={doc.thumbnailUrl} alt={doc.name} className="doc-thumbnail" />
                      ) : (
                        <div className="doc-icon">{getFileIcon(doc.type)}</div>
                      )}
                      
                      <div 
                        className="document-category-badge"
                        style={{ backgroundColor: categoryInfo.color }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </div>
                    </div>

                    <div className="document-info">
                      <h5 className="document-name" title={doc.name}>
                        {doc.name.length > 25 ? doc.name.substring(0, 25) + '...' : doc.name}
                      </h5>
                      
                      <div className="document-meta">
                        <span className="document-size">{formatFileSize(doc.size)}</span>
                        <span className="document-date">
                          {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {doc.description && (
                        <p className="document-description">
                          {doc.description.length > 50 ? doc.description.substring(0, 50) + '...' : doc.description}
                        </p>
                      )}

                      <div className="document-actions">
                        <button 
                          className="btn-view"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          👁️ Ver
                        </button>
                        
                        {doc.url && (
                          <a 
                            href={doc.url} 
                            download={doc.name}
                            className="btn-download"
                          >
                            ⬇️ Baixar
                          </a>
                        )}
                        
                        {!readOnly && (
                          <button 
                            className="btn-delete"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && !readOnly && (
        <UploadModal
          categories={documentCategories}
          onUpload={handleFileUpload}
          onClose={() => setShowUploadModal(false)}
          isUploading={uploadingFiles}
        />
      )}

      {/* Modal de Visualização */}
      {selectedDocument && (
        <DocumentViewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDelete={!readOnly ? deleteDocument : undefined}
        />
      )}
    </div>
  );
};

// Componente Modal de Upload
interface UploadModalProps {
  categories: DocumentCategory[];
  onUpload: (files: FileList, category: string, description?: string) => void;
  onClose: () => void;
  isUploading: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ categories, onUpload, onClose, isUploading }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleSubmit = () => {
    if (!selectedFiles?.length || !selectedCategory) {
      alert('Selecione os arquivos e a categoria');
      return;
    }
    onUpload(selectedFiles, selectedCategory, description);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 Enviar Documentos</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Selecionar Arquivos:</label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="file-input-modal"
            />
            {selectedFiles && (
              <div className="selected-files">
                <p>{selectedFiles.length} arquivo(s) selecionado(s)</p>
                <ul>
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Categoria: *</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição (opcional):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o documento..."
              rows={3}
              className="description-textarea"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={isUploading || !selectedFiles?.length || !selectedCategory}
          >
            {isUploading ? '📤 Enviando...' : '📤 Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Visualização de Documento
interface DocumentViewModalProps {
  document: Document;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({ document, onClose, onDelete }) => {
  const categoryInfo = {
    radiography: { name: 'Radiografias', icon: '🦷', color: '#3b82f6' },
    photos: { name: 'Fotografias', icon: '📷', color: '#10b981' },
    exams: { name: 'Exames', icon: '🔬', color: '#f59e0b' },
    prescriptions: { name: 'Receitas', icon: '💊', color: '#ef4444' },
    contracts: { name: 'Contratos', icon: '📄', color: '#8b5cf6' },
    insurance: { name: 'Convênio', icon: '🏥', color: '#06b6d4' },
    reports: { name: 'Laudos', icon: '📋', color: '#84cc16' },
    others: { name: 'Outros', icon: '📁', color: '#6b7280' }
  }[document.category] || { name: 'Outros', icon: '📁', color: '#6b7280' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="document-view-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📄 {document.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="document-preview-large">
            {document.thumbnailUrl ? (
              <img src={document.thumbnailUrl} alt={document.name} className="large-preview" />
            ) : (
              <div className="large-file-icon">
                {document.type.startsWith('image/') ? '🖼️' : 
                 document.type === 'application/pdf' ? '📕' : '📄'}
              </div>
            )}
          </div>

          <div className="document-details">
            <div className="detail-row">
              <strong>Categoria:</strong>
              <span 
                className="category-badge"
                style={{ backgroundColor: categoryInfo.color }}
              >
                {categoryInfo.icon} {categoryInfo.name}
              </span>
            </div>

            <div className="detail-row">
              <strong>Tamanho:</strong>
              <span>{Math.round(document.size / 1024)} KB</span>
            </div>

            <div className="detail-row">
              <strong>Data de Upload:</strong>
              <span>{new Date(document.uploadDate).toLocaleDateString('pt-BR')}</span>
            </div>

            {document.description && (
              <div className="detail-row">
                <strong>Descrição:</strong>
                <p>{document.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          {document.url && (
            <a 
              href={document.url} 
              download={document.name}
              className="btn-download-large"
            >
              ⬇️ Baixar
            </a>
          )}
          
          {onDelete && (
            <button 
              className="btn-danger"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este documento?')) {
                  onDelete(document.id);
                  onClose();
                }
              }}
            >
              🗑️ Excluir
            </button>
          )}
          
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagerView;