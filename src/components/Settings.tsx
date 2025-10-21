import React, { useState } from 'react';
import '../styles/settings.css';

interface AgendaSettings {
  primaryColor: string;
  secondaryColor: string;
  blockedDayColor: string;
  appointmentColors: string[];
  nationalHolidays: boolean;
  stateHolidays: boolean;
  cityHolidays: boolean;
  lunchBreakEnabled: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

interface CustomHoliday {
  id?: string;
  name: string;
  date: string;
  type: 'NATIONAL' | 'STATE' | 'CITY' | 'CUSTOM';
  enabled: boolean;
}

interface HolidayBridge {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

interface DateBlock {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'DAY_OFF' | 'MAINTENANCE' | 'PERSONAL';
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  enabled: boolean;
}

interface DateUnblock {
  id?: string;
  date: string;
  reason: string;
  enabled: boolean;
}

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultColors = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
  '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
];

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('colors');
  const [settings, setSettings] = useState<AgendaSettings>({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    blockedDayColor: 'rgba(107, 114, 128, 0.3)',
    appointmentColors: defaultColors.slice(0, 12),
    nationalHolidays: true,
    stateHolidays: false,
    cityHolidays: false,
    lunchBreakEnabled: false,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00'
  });

  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [holidayBridges, setHolidayBridges] = useState<HolidayBridge[]>([]);
  const [dateBlocks, setDateBlocks] = useState<DateBlock[]>([]);
  const [dateUnblocks, setDateUnblocks] = useState<DateUnblock[]>([]);

  // Novos estados para formulários
  const [newHoliday, setNewHoliday] = useState<Partial<CustomHoliday>>({
    name: '',
    date: '',
    type: 'CUSTOM',
    enabled: true
  });

  const [newBridge, setNewBridge] = useState<Partial<HolidayBridge>>({
    name: '',
    startDate: '',
    endDate: '',
    enabled: true
  });

  const [newBlock, setNewBlock] = useState<Partial<DateBlock>>({
    title: '',
    startDate: '',
    endDate: '',
    type: 'VACATION',
    allDay: true,
    enabled: true
  });

  const [newUnblock, setNewUnblock] = useState<Partial<DateUnblock>>({
    date: '',
    reason: '',
    enabled: true
  });

  if (!isOpen) return null;

  const handleSave = () => {
    // Aqui seria a integração com a API para salvar as configurações
    console.log('Salvando configurações:', settings);
    console.log('Feriados customizados:', customHolidays);
    console.log('Pontes:', holidayBridges);
    console.log('Bloqueios:', dateBlocks);
    console.log('Desbloqueios:', dateUnblocks);
    
    alert('Configurações salvas com sucesso!');
    onClose();
  };

  const addCustomHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      setCustomHolidays([...customHolidays, { ...newHoliday, id: Date.now().toString() } as CustomHoliday]);
      setNewHoliday({ name: '', date: '', type: 'CUSTOM', enabled: true });
    }
  };

  const addHolidayBridge = () => {
    if (newBridge.name && newBridge.startDate && newBridge.endDate) {
      setHolidayBridges([...holidayBridges, { ...newBridge, id: Date.now().toString() } as HolidayBridge]);
      setNewBridge({ name: '', startDate: '', endDate: '', enabled: true });
    }
  };

  const addDateBlock = () => {
    if (newBlock.title && newBlock.startDate && newBlock.endDate) {
      setDateBlocks([...dateBlocks, { ...newBlock, id: Date.now().toString() } as DateBlock]);
      setNewBlock({ title: '', startDate: '', endDate: '', type: 'VACATION', allDay: true, enabled: true });
    }
  };

  const addDateUnblock = () => {
    if (newUnblock.date && newUnblock.reason) {
      setDateUnblocks([...dateUnblocks, { ...newUnblock, id: Date.now().toString() } as DateUnblock]);
      setNewUnblock({ date: '', reason: '', enabled: true });
    }
  };

  const removeItem = (id: string, type: 'holiday' | 'bridge' | 'block' | 'unblock') => {
    switch (type) {
      case 'holiday':
        setCustomHolidays(prev => prev.filter(item => item.id !== id));
        break;
      case 'bridge':
        setHolidayBridges(prev => prev.filter(item => item.id !== id));
        break;
      case 'block':
        setDateBlocks(prev => prev.filter(item => item.id !== id));
        break;
      case 'unblock':
        setDateUnblocks(prev => prev.filter(item => item.id !== id));
        break;
    }
  };

  const toggleItem = (id: string, type: 'holiday' | 'bridge' | 'block' | 'unblock') => {
    switch (type) {
      case 'holiday':
        setCustomHolidays(prev => prev.map(item => 
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
        break;
      case 'bridge':
        setHolidayBridges(prev => prev.map(item => 
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
        break;
      case 'block':
        setDateBlocks(prev => prev.map(item => 
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
        break;
      case 'unblock':
        setDateUnblocks(prev => prev.map(item => 
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
        break;
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <div className="settings-icon">⚙️</div>
            <h2>Configurações da Agenda</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
              onClick={() => setActiveTab('colors')}
            >
              🎨 Cores
            </button>
            <button 
              className={`tab-btn ${activeTab === 'holidays' ? 'active' : ''}`}
              onClick={() => setActiveTab('holidays')}
            >
              📅 Feriados
            </button>
            <button 
              className={`tab-btn ${activeTab === 'blocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocks')}
            >
              🚫 Bloqueios
            </button>
            <button 
              className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              ⏰ Horários
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'colors' && (
              <div className="tab-panel">
                <h3>Personalização de Cores</h3>
                
                <div className="color-section">
                  <h4>Cores Principais</h4>
                  <div className="color-inputs">
                    <div className="color-input-group">
                      <label>Cor Primária</label>
                      <div className="color-picker">
                        <input 
                          type="color" 
                          value={settings.primaryColor} 
                          onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        />
                        <span>{settings.primaryColor}</span>
                      </div>
                    </div>
                    <div className="color-input-group">
                      <label>Cor Secundária</label>
                      <div className="color-picker">
                        <input 
                          type="color" 
                          value={settings.secondaryColor} 
                          onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                        />
                        <span>{settings.secondaryColor}</span>
                      </div>
                    </div>
                    <div className="color-input-group">
                      <label>Cor de Dias Bloqueados</label>
                      <div className="color-picker">
                        <input 
                          type="color" 
                          value={settings.blockedDayColor.replace('rgba(107, 114, 128, 0.3)', '#6b7280')} 
                          onChange={(e) => setSettings({...settings, blockedDayColor: `${e.target.value}50`})}
                        />
                        <span>Dias bloqueados</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="color-section">
                  <h4>Cores dos Agendamentos</h4>
                  <div className="appointment-colors">
                    {settings.appointmentColors.map((color, index) => (
                      <div key={index} className="appointment-color-item">
                        <input 
                          type="color" 
                          value={color}
                          onChange={(e) => {
                            const newColors = [...settings.appointmentColors];
                            newColors[index] = e.target.value;
                            setSettings({...settings, appointmentColors: newColors});
                          }}
                        />
                        <span>Cor {index + 1}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="color-presets">
                    <h5>Paletas Pré-definidas</h5>
                    <div className="preset-buttons">
                      <button onClick={() => setSettings({...settings, appointmentColors: defaultColors.slice(0, 12)})}>
                        Padrão
                      </button>
                      <button onClick={() => setSettings({...settings, appointmentColors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#e17055', '#00b894', '#00cec9']})}>
                        Vibrante
                      </button>
                      <button onClick={() => setSettings({...settings, appointmentColors: ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241', '#5e548e', '#9f86c0', '#be95c4', '#e0aaff', '#c77dff', '#e9c46a', '#f4a261']})}>
                        Pastel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'holidays' && (
              <div className="tab-panel">
                <h3>Gerenciamento de Feriados</h3>
                
                <div className="holiday-section">
                  <h4>Feriados Automáticos</h4>
                  <div className="holiday-toggles">
                    <label className="toggle-item">
                      <input 
                        type="checkbox" 
                        checked={settings.nationalHolidays}
                        onChange={(e) => setSettings({...settings, nationalHolidays: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                      <span>Feriados Nacionais</span>
                    </label>
                    <label className="toggle-item">
                      <input 
                        type="checkbox" 
                        checked={settings.stateHolidays}
                        onChange={(e) => setSettings({...settings, stateHolidays: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                      <span>Feriados Estaduais</span>
                    </label>
                    <label className="toggle-item">
                      <input 
                        type="checkbox" 
                        checked={settings.cityHolidays}
                        onChange={(e) => setSettings({...settings, cityHolidays: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                      <span>Feriados Municipais</span>
                    </label>
                  </div>
                </div>

                <div className="holiday-section">
                  <h4>Feriados Personalizados</h4>
                  <div className="add-holiday-form">
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Nome do feriado"
                        value={newHoliday.name}
                        onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                      />
                      <input 
                        type="date" 
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                      />
                      <select 
                        value={newHoliday.type}
                        onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value as any})}
                      >
                        <option value="CUSTOM">Personalizado</option>
                        <option value="NATIONAL">Nacional</option>
                        <option value="STATE">Estadual</option>
                        <option value="CITY">Municipal</option>
                      </select>
                      <button onClick={addCustomHoliday} className="add-btn">Adicionar</button>
                    </div>
                  </div>
                  
                  <div className="holiday-list">
                    {customHolidays.map((holiday) => (
                      <div key={holiday.id} className={`holiday-item ${!holiday.enabled ? 'disabled' : ''}`}>
                        <div className="holiday-info">
                          <span className="holiday-name">{holiday.name}</span>
                          <span className="holiday-date">{new Date(holiday.date).toLocaleDateString('pt-BR')}</span>
                          <span className={`holiday-type ${holiday.type.toLowerCase()}`}>{holiday.type}</span>
                        </div>
                        <div className="holiday-actions">
                          <button onClick={() => toggleItem(holiday.id!, 'holiday')} className="toggle-btn">
                            {holiday.enabled ? '🔓' : '🔒'}
                          </button>
                          <button onClick={() => removeItem(holiday.id!, 'holiday')} className="remove-btn">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="holiday-section">
                  <h4>Pontes de Feriados</h4>
                  <div className="add-bridge-form">
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Nome da ponte"
                        value={newBridge.name}
                        onChange={(e) => setNewBridge({...newBridge, name: e.target.value})}
                      />
                      <input 
                        type="date" 
                        value={newBridge.startDate}
                        onChange={(e) => setNewBridge({...newBridge, startDate: e.target.value})}
                        placeholder="Data início"
                      />
                      <input 
                        type="date" 
                        value={newBridge.endDate}
                        onChange={(e) => setNewBridge({...newBridge, endDate: e.target.value})}
                        placeholder="Data fim"
                      />
                      <button onClick={addHolidayBridge} className="add-btn">Adicionar</button>
                    </div>
                  </div>
                  
                  <div className="bridge-list">
                    {holidayBridges.map((bridge) => (
                      <div key={bridge.id} className={`bridge-item ${!bridge.enabled ? 'disabled' : ''}`}>
                        <div className="bridge-info">
                          <span className="bridge-name">{bridge.name}</span>
                          <span className="bridge-dates">
                            {new Date(bridge.startDate).toLocaleDateString('pt-BR')} - {new Date(bridge.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="bridge-actions">
                          <button onClick={() => toggleItem(bridge.id!, 'bridge')} className="toggle-btn">
                            {bridge.enabled ? '🔓' : '🔒'}
                          </button>
                          <button onClick={() => removeItem(bridge.id!, 'bridge')} className="remove-btn">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="holiday-section">
                  <h4>Desbloqueio de Dias Específicos</h4>
                  <p className="section-description">
                    Use esta opção para permitir agendamentos em feriados específicos quando necessário.
                  </p>
                  <div className="add-unblock-form">
                    <div className="form-row">
                      <input 
                        type="date" 
                        value={newUnblock.date}
                        onChange={(e) => setNewUnblock({...newUnblock, date: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Motivo do desbloqueio"
                        value={newUnblock.reason}
                        onChange={(e) => setNewUnblock({...newUnblock, reason: e.target.value})}
                      />
                      <button onClick={addDateUnblock} className="add-btn">Adicionar</button>
                    </div>
                  </div>
                  
                  <div className="unblock-list">
                    {dateUnblocks.map((unblock) => (
                      <div key={unblock.id} className={`unblock-item ${!unblock.enabled ? 'disabled' : ''}`}>
                        <div className="unblock-info">
                          <span className="unblock-date">{new Date(unblock.date).toLocaleDateString('pt-BR')}</span>
                          <span className="unblock-reason">{unblock.reason}</span>
                        </div>
                        <div className="unblock-actions">
                          <button onClick={() => toggleItem(unblock.id!, 'unblock')} className="toggle-btn">
                            {unblock.enabled ? '🔓' : '🔒'}
                          </button>
                          <button onClick={() => removeItem(unblock.id!, 'unblock')} className="remove-btn">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="tab-panel">
                <h3>Bloqueios de Agenda</h3>
                
                <div className="block-section">
                  <h4>Adicionar Bloqueio</h4>
                  <p className="section-description">
                    Configure férias, folgas e outros períodos indisponíveis.
                  </p>
                  
                  <div className="add-block-form">
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder="Título (ex: Férias, Folga)"
                        value={newBlock.title}
                        onChange={(e) => setNewBlock({...newBlock, title: e.target.value})}
                      />
                      <select 
                        value={newBlock.type}
                        onChange={(e) => setNewBlock({...newBlock, type: e.target.value as any})}
                      >
                        <option value="VACATION">Férias</option>
                        <option value="DAY_OFF">Folga</option>
                        <option value="MAINTENANCE">Manutenção</option>
                        <option value="PERSONAL">Pessoal</option>
                      </select>
                    </div>
                    
                    <div className="form-row">
                      <input 
                        type="date" 
                        value={newBlock.startDate}
                        onChange={(e) => setNewBlock({...newBlock, startDate: e.target.value})}
                      />
                      <input 
                        type="date" 
                        value={newBlock.endDate}
                        onChange={(e) => setNewBlock({...newBlock, endDate: e.target.value})}
                      />
                      <label className="checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={newBlock.allDay}
                          onChange={(e) => setNewBlock({...newBlock, allDay: e.target.checked})}
                        />
                        <span>Dia inteiro</span>
                      </label>
                    </div>
                    
                    {!newBlock.allDay && (
                      <div className="form-row">
                        <input 
                          type="time" 
                          value={newBlock.startTime}
                          onChange={(e) => setNewBlock({...newBlock, startTime: e.target.value})}
                          placeholder="Hora início"
                        />
                        <input 
                          type="time" 
                          value={newBlock.endTime}
                          onChange={(e) => setNewBlock({...newBlock, endTime: e.target.value})}
                          placeholder="Hora fim"
                        />
                      </div>
                    )}
                    
                    <button onClick={addDateBlock} className="add-btn full-width">Adicionar Bloqueio</button>
                  </div>
                  
                  <div className="block-list">
                    {dateBlocks.map((block) => (
                      <div key={block.id} className={`block-item ${!block.enabled ? 'disabled' : ''}`}>
                        <div className="block-info">
                          <div className="block-header">
                            <span className="block-title">{block.title}</span>
                            <span className={`block-type ${block.type.toLowerCase()}`}>
                              {block.type === 'VACATION' ? 'Férias' : 
                               block.type === 'DAY_OFF' ? 'Folga' :
                               block.type === 'MAINTENANCE' ? 'Manutenção' : 'Pessoal'}
                            </span>
                          </div>
                          <div className="block-dates">
                            {new Date(block.startDate).toLocaleDateString('pt-BR')} - {new Date(block.endDate).toLocaleDateString('pt-BR')}
                            {!block.allDay && block.startTime && block.endTime && (
                              <span className="block-times"> • {block.startTime} - {block.endTime}</span>
                            )}
                          </div>
                        </div>
                        <div className="block-actions">
                          <button onClick={() => toggleItem(block.id!, 'block')} className="toggle-btn">
                            {block.enabled ? '🔓' : '🔒'}
                          </button>
                          <button onClick={() => removeItem(block.id!, 'block')} className="remove-btn">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="tab-panel">
                <h3>Configurações de Horário</h3>
                
                <div className="schedule-section">
                  <h4>Horário de Almoço</h4>
                  <p className="section-description">
                    Configure o bloqueio automático para horário de almoço.
                  </p>
                  
                  <div className="lunch-break-config">
                    <label className="toggle-item">
                      <input 
                        type="checkbox" 
                        checked={settings.lunchBreakEnabled}
                        onChange={(e) => setSettings({...settings, lunchBreakEnabled: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                      <span>Ativar bloqueio de horário de almoço</span>
                    </label>
                    
                    {settings.lunchBreakEnabled && (
                      <div className="lunch-time-inputs">
                        <div className="time-input-group">
                          <label>Início do almoço</label>
                          <input 
                            type="time" 
                            value={settings.lunchBreakStart}
                            onChange={(e) => setSettings({...settings, lunchBreakStart: e.target.value})}
                          />
                        </div>
                        <div className="time-input-group">
                          <label>Fim do almoço</label>
                          <input 
                            type="time" 
                            value={settings.lunchBreakEnd}
                            onChange={(e) => setSettings({...settings, lunchBreakEnd: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="schedule-section">
                  <h4>Informações Importantes</h4>
                  <div className="info-cards">
                    <div className="info-card">
                      <div className="info-icon">📅</div>
                      <div className="info-content">
                        <h5>Dias Bloqueados</h5>
                        <p>Dias com feriados, férias ou folgas aparecerão com cor diferenciada na agenda e não permitirão novos agendamentos.</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">🔒</div>
                      <div className="info-content">
                        <h5>Bloqueio Automático</h5>
                        <p>Feriados nacionais, estaduais e municipais são bloqueados automaticamente quando ativados.</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">🔓</div>
                      <div className="info-content">
                        <h5>Desbloqueios</h5>
                        <p>Você pode desbloquear dias específicos para permitir agendamentos em feriados quando necessário.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="save-btn" onClick={handleSave}>
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;