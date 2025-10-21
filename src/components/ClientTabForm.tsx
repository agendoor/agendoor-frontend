import React, { useState, useEffect } from 'react';
import OdontogramView from './OdontogramView';
import MedicalRecordView from './MedicalRecordView';
import ClinicalModule from './ClinicalModule';
import TabHistory from './TabHistory';
import '../styles/client-tab-form.css';
import '../styles/tab-history.css';

interface BusinessTypeTab {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isRequired: boolean;
  sortOrder: number;
  fieldConfig: string;
}

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  min?: number;
  max?: number;
  default?: any;
  defaultValue?: string;
  readOnly?: boolean;
  width?: string;
  dependsOn?: string;
  showWhen?: string | string[];
  toolbar?: boolean;
  className?: string;
  helpText?: string;
  layout?: string;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
  layout?: 'full-width' | 'two-columns';
}

interface TabFieldConfig {
  sections?: SectionConfig[];
  fields?: FieldConfig[];
  isAdvanced?: boolean;
  type?: string;
  customLayout?: boolean;
  introText?: string;
  submitButton?: {
    text: string;
    className?: string;
    color?: string;
  };
  validation?: {
    showErrorsInline?: boolean;
    highlightRequiredFields?: boolean;
  };
  styling?: {
    theme?: string;
    responsive?: boolean;
    cardLayout?: boolean;
  };
}

interface ClientTabFormProps {
  tab: BusinessTypeTab;
  data: any;
  onDataChange: (data: any, notes?: string) => void;
  saving: boolean;
  clientId?: string;
  clientName?: string;
}

const ClientTabForm: React.FC<ClientTabFormProps> = ({
  tab,
  data,
  onDataChange,
  saving,
  clientId,
  clientName
}) => {
  const [formData, setFormData] = useState<any>(data || {});
  const [notes, setNotes] = useState<string>('');
  const [fieldConfig, setFieldConfig] = useState<TabFieldConfig>({ fields: [] });
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Parse field configuration
  useEffect(() => {
    try {
      const config = JSON.parse(tab.fieldConfig);
      setFieldConfig(config);
    } catch (error) {
      console.error('Erro ao fazer parse da configuração dos campos:', error);
      setFieldConfig({ fields: [] });
    }
  }, [tab.fieldConfig]);

  // Update form data when data prop changes
  useEffect(() => {
    const initialData = data || {};
    
    // Set default values for fields
    if (fieldConfig.sections) {
      fieldConfig.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.defaultValue === 'today' && !initialData[field.name]) {
            initialData[field.name] = new Date().toISOString().split('T')[0];
          }
          // Auto-fill client name for readonly name field
          if (field.name === 'nomeCompleto' && field.readOnly && clientName && !initialData[field.name]) {
            initialData[field.name] = clientName;
          }
        });
      });
    }
    
    setFormData(initialData);
  }, [data, fieldConfig, clientName]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);
    // Não salvar automaticamente a cada mudança
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    // Não salvar automaticamente a cada mudança
  };

  const handleSaveClick = () => {
    onDataChange(formData, notes);
  };

  const shouldShowField = (field: FieldConfig): boolean => {
    if (!field.dependsOn || !field.showWhen) return true;
    
    const dependentValue = formData[field.dependsOn];
    
    // Support for array of values in showWhen
    if (Array.isArray(field.showWhen)) {
      return field.showWhen.includes(dependentValue);
    }
    
    return dependentValue === field.showWhen;
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || '';
    
    if (!shouldShowField(field)) return null;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={`form-input ${field.className || ''}`}
            required={field.required}
            readOnly={field.readOnly}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="form-input"
            required={field.required}
            readOnly={field.readOnly}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={field.rows || 4}
            className="form-textarea"
            required={field.required}
          />
        );

      case 'rich-textarea':
        return (
          <div className="rich-textarea-container">
            {field.toolbar && (
              <div className="rich-textarea-toolbar">
                <button type="button" className="toolbar-btn" title="Negrito">
                  <strong>B</strong>
                </button>
                <button type="button" className="toolbar-btn" title="Itálico">
                  <em>I</em>
                </button>
                <button type="button" className="toolbar-btn" title="Sublinhado">
                  <u>U</u>
                </button>
                <button type="button" className="toolbar-btn" title="Lista">
                  • Lista
                </button>
              </div>
            )}
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              rows={field.rows || 8}
              className="form-textarea rich-textarea"
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="form-select"
            required={field.required}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="switch-label">
            <input
              type="checkbox"
              className="switch-input"
              checked={value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            <span className="switch-slider"></span>
            <span className="switch-text">{value ? 'Sim' : 'Não'}</span>
          </label>
        );

      case 'checkbox':
        return (
          <div className={`checkbox-container ${field.className || ''}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                required={field.required}
              />
              <span className="checkbox-text">{field.label}</span>
            </label>
            {field.helpText && (
              <div className="field-help-text">{field.helpText}</div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option) => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="form-radio"
                  required={field.required}
                />
                <span className="radio-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox-group':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className={`checkbox-group ${field.layout === 'grid-3-columns' ? 'grid-3-columns' : ''}`}>
            {field.options?.map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                    let newValues;
                    
                    if (e.target.checked) {
                      newValues = [...currentValues, option];
                    } else {
                      newValues = currentValues.filter((val: string) => val !== option);
                    }
                    
                    handleFieldChange(field.name, newValues);
                  }}
                />
                <span className="checkbox-text">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSpecializedComponent = () => {
    if (!fieldConfig.type) {
      return null;
    }

    switch (fieldConfig.type) {
      case 'medical_record':
        return (
          <MedicalRecordView
            data={data || {}}
            onDataChange={(newData) => {
              onDataChange(newData);
            }}
            clientName={clientName || 'Cliente'}
            readOnly={false}
          />
        );

      case 'odontogram':
        return (
          <OdontogramView
            data={data || {}}
            onDataChange={(newData) => {
              onDataChange(newData);
            }}
            readOnly={false}
            clientId={clientId}
          />
        );

      case 'clinical_module':
        return (
          <ClinicalModule
            clientId={clientId || ''}
            readOnly={false}
          />
        );

      default:
        return null;
    }
  };

  const specializedComponent = renderSpecializedComponent();

  return (
    <div className="client-tab-form">
      {/* Header da aba com botão de histórico */}
      {clientId && (
        <div className="tab-header">
          <div className="tab-info">
            <h3 className="tab-title">
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.name}
            </h3>
            {tab.description && (
              <p className="tab-description">{tab.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="history-btn"
            title="Ver histórico de alterações"
          >
            📜 Histórico
          </button>
        </div>
      )}

      {/* Renderizar componente especializado se existir */}
      {specializedComponent && (
        <div className="specialized-component">
          {specializedComponent}
        </div>
      )}

      {/* Renderizar formulário padrão apenas se não houver componente especializado */}
      {!specializedComponent && (
        <div className="form-container">
          {/* Render intro text if provided */}
          {fieldConfig.introText && (
            <div className="form-intro">
              <p className="intro-text">{fieldConfig.introText}</p>
            </div>
          )}
          
          {fieldConfig.sections ? (
            fieldConfig.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={`form-section ${section.layout ? `layout-${section.layout}` : ''}`}>
                <h4 className="section-title">{section.title}</h4>
                <div className={`section-fields ${section.layout === 'two-columns' ? 'two-columns-grid' : ''}`}>
                  {section.fields
                    .filter(field => shouldShowField(field))
                    .map((field) => (
                      <div 
                        key={field.name} 
                        className={`form-field ${field.type}`}
                        style={field.width ? { width: field.width } : {}}
                      >
                        <label className="form-label">
                          {field.label}
                          {field.required && <span className="required-asterisk">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : fieldConfig.fields && fieldConfig.fields.length > 0 ? (
            <div className="form-fields">
              {fieldConfig.fields.map((field) => (
                <div key={field.name} className={`form-field ${field.type}`}>
                  <label className="form-label">
                    {field.label}
                    {field.required && <span className="required-asterisk">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-fields">
              <p>Nenhum campo configurado para esta aba.</p>
            </div>
          )}
        </div>
      )}

      {/* Renderizar área de observações apenas se não for uma aba especializada */}
      {!specializedComponent && (
        <div className="form-notes">
          <label className="form-label">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Adicione observações específicas para esta aba..."
            rows={3}
            className="form-textarea"
          />
        </div>
      )}

      {/* Renderizar botão de salvar apenas se não for uma aba especializada */}
      {!specializedComponent && (
        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleSaveClick}
            className={`save-btn ${fieldConfig.submitButton?.className || ''} ${fieldConfig.submitButton?.color === 'primary' ? 'btn-primary' : ''}`}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="saving-spinner">💾</span>
                Salvando...
              </>
            ) : (
              <>
                💾 {fieldConfig.submitButton?.text || 'Salvar Alterações'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal de histórico */}
      {clientId && (
        <TabHistory
          clientId={clientId}
          tabId={tab.id}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default ClientTabForm;