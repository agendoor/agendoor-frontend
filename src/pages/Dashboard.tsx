import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Settings from '../components/Settings';
import UrgentPanel from '../components/UrgentPanel';
import Drawer from '../components/Drawer';
import TopBar from '../components/TopBar';
import AppointmentPanel from '../components/AppointmentPanel';
import { isDateBlocked, formatHolidayDate } from '../utils/holidays';
import '../styles/dashboard.css';

interface ClientNote {
  id: string;
  date: string;
  content: string;
  author: string;
}

interface ClientHistory {
  id: string;
  date: string;
  service: string;
  professional: string;
  status: 'completed' | 'no_show' | 'cancelled';
}

interface ClientInfo {
  fullName: string;
  phone: string;
  photo?: string;
  history: ClientHistory[];
  notes: ClientNote[];
}

interface UrgencyInfo {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedAt: string;
}

interface Appointment {
  id: string;
  title: string;
  client: string;
  clientInfo: ClientInfo;
  service: string;
  serviceId?: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  color: string;
  professional?: string;
  notes?: string;
  duration: number;
  urgency?: UrgencyInfo;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUrgentPanelOpen, setIsUrgentPanelOpen] = useState(false);
  
  // New Appointment States
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: string, time: string} | null>(null);

  // Load appointments from backend
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Helper function to get colors based on appointment status
  const getColorByStatus = (status: string) => {
    const statusColors = {
      'confirmed': '#22c55e',    // Verde - confirmado
      'pending': '#f59e0b',      // Laranja - pendente
      'cancelled': '#ef4444',    // Vermelho - cancelado
      'completed': '#8b5cf6',    // Roxo - completado
      'no_show': '#6b7280',      // Cinza - não compareceu
      'overdue': '#dc2626',      // Vermelho escuro - atrasado
    };
    return statusColors[status as keyof typeof statusColors] || '#64B5F6'; // Azul como padrão
  };

  // Configurações de bloqueios (exemplo - posteriormente virão do backend)
  const [blockSettings] = useState({
    nationalHolidays: true,
    stateHolidays: true,
    cityHolidays: false,
  });

  const [customHolidays] = useState([]);
  const [holidayBridges] = useState([]);
  const [dateBlocks] = useState([]);
  const [dateUnblocks] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigate('/login', { replace: true });
    }
  };

  // Estado para navegação semanal
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Função para gerar dias da semana baseado na semana atual
  const getCurrentWeekDays = () => {
    // Get current Monday as base date
    const today = new Date();
    const currentDay = today.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so 6 days from Monday
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() - daysFromMonday); // Set to current Monday
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + (currentWeek * 7));
    
    const weekDays = [];
    for (let i = 0; i < 6; i++) { // Segunda a Sábado
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dayFullNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      weekDays.push({
        date: currentDate.toISOString().split('T')[0],
        day: dayFullNames[currentDate.getDay()],
        dayShort: dayNames[currentDate.getDay()]
      });
    }
    return weekDays;
  };

  const weekDays = getCurrentWeekDays();
  
  // Load appointments from backend
  const loadAppointments = async () => {
    try {
      const startDate = weekDays[0]?.date;
      const endDate = weekDays[weekDays.length - 1]?.date;
      
      if (startDate && endDate) {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/appointments?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.appointments) {
          const now = new Date();
          
          // Convert backend appointments to frontend format and check for overdue
          const convertedAppointments = await Promise.all(data.appointments.map(async (apt: any) => {
            let status = apt.status.toLowerCase();
            
            // Check if appointment is overdue
            const appointmentDateTime = new Date(`${apt.date.split('T')[0]}T${apt.startTime}`);
            const isOverdue = appointmentDateTime < now && (status === 'pending' || status === 'confirmed');
            
            // If overdue, mark as late in the backend
            if (isOverdue) {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/appointments/${apt.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    status: 'OVERDUE'
                  })
                });
                
                if (response.ok) {
                  status = 'overdue';
                } else {
                  console.error('Erro ao marcar agendamento como atrasado:', await response.text());
                }
              } catch (error) {
                console.error('Erro ao marcar agendamento como atrasado:', error);
              }
            }
            
            return {
              id: apt.id,
              title: apt.client.fullName,
              client: apt.client.fullName,
              clientInfo: {
                fullName: apt.client.fullName,
                phone: apt.client.phone,
                photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.client.fullName)}&background=14b8a6&color=fff&size=120`,
                history: [],
                notes: apt.client.notes ? [{ id: '1', date: apt.createdAt, content: apt.client.notes, author: 'Sistema' }] : []
              },
              service: apt.service.name,
              serviceId: apt.service.id,
              startTime: apt.startTime,
              endTime: apt.endTime,
              date: apt.date.split('T')[0],
              status,
              color: getColorByStatus(status),
              professional: 'Sistema',
              notes: apt.notes,
              duration: apt.service.duration
            };
          }));
          
          setAppointments(convertedAppointments);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };
  
  // Load appointments when component mounts or week changes
  useEffect(() => {
    if (weekDays.length > 0) {
      loadAppointments();
    }
  }, [currentWeek]); // Depend on currentWeek instead of weekDays to avoid circular deps
  
  // Calcular dias bloqueados para a semana atual
  const blockedDays = useMemo(() => {
    const blocked = new Set<string>();
    const blockedInfo = new Map<string, { reason: string; holiday?: any }>();
    
    weekDays.forEach(day => {
      const blockStatus = isDateBlocked(
        day.date,
        blockSettings,
        customHolidays,
        holidayBridges,
        dateBlocks,
        dateUnblocks
      );
      
      if (blockStatus.blocked) {
        blocked.add(day.date);
        blockedInfo.set(day.date, {
          reason: blockStatus.reason || 'Dia bloqueado',
          holiday: blockStatus.holiday
        });
      }
    });
    
    return { blocked, info: blockedInfo };
  }, [weekDays, blockSettings, customHolidays, holidayBridges, dateBlocks, dateUnblocks]);
  
  // Funções para navegação
  const goToPreviousWeek = () => setCurrentWeek(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeek(prev => prev + 1);
  const goToCurrentWeek = () => setCurrentWeek(0);

  // Appointments are now loaded from backend in useEffect

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  // Function to open appointment panel and close others
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsSettingsOpen(false);
    setIsNewAppointmentOpen(false);
  };

  // Function to open settings and close others
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setSelectedAppointment(null);
    setIsNewAppointmentOpen(false);
  };

  // Function to handle time slot click for new appointments
  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedTimeSlot({ date, time });
    setIsNewAppointmentOpen(true);
    setSelectedAppointment(null);
    setIsSettingsOpen(false);
  };

  // Calculate daily metrics based on today's appointments
  const getDailyMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    return {
      approved: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'cancelled').length,
      rescheduled: 0, // This would need to be tracked separately in a real system
      pending: todayAppointments.filter(apt => apt.status === 'pending').length
    };
  };

  const dailyMetrics = getDailyMetrics();

  // Calculate urgent appointments count
  const urgentCount = appointments.filter(apt => apt.urgency).length;

  // Get urgent appointments sorted by priority
  const getUrgentAppointments = () => {
    const urgentAppts = appointments.filter(apt => apt.urgency);
    
    // Sort by urgency level (critical/high > medium > low)
    return urgentAppts.sort((a, b) => {
      const urgencyOrder = { critical: 1, high: 1, medium: 2, low: 3 };
      const aOrder = urgencyOrder[a.urgency!.level as keyof typeof urgencyOrder] || 999;
      const bOrder = urgencyOrder[b.urgency!.level as keyof typeof urgencyOrder] || 999;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      return new Date(a.urgency!.reportedAt).getTime() - new Date(b.urgency!.reportedAt).getTime();
    }).slice(0, 3); // Show only first 3
  };

  const urgentAppointments = getUrgentAppointments();

  // Helper function to get urgency class
  const getUrgencyClass = (level: string) => {
    if (level === 'critical' || level === 'high') return 'urgency-high';
    if (level === 'medium') return 'urgency-medium';
    return 'urgency-low';
  };

  // Helper function to get urgency label
  const getUrgencyLabelText = (level: string) => {
    if (level === 'critical') return 'Crítica';
    if (level === 'high') return 'Alta';
    if (level === 'medium') return 'Média';
    return 'Baixa';
  };

  return (
    <div className="dashboard">
      {/* TopBar */}
      <TopBar 
        onSettingsClick={handleOpenSettings}
        onLogout={handleLogout}
        onUrgentClick={() => setIsUrgentPanelOpen(true)}
        urgentCount={urgentCount}
        userWelcome={user ? `Olá, ${user.fullName.split(' ')[0]}!` : 'Olá!'}
      />

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Panel Bar */}
        <div className={`panel-bar ${(isNewAppointmentOpen || selectedAppointment) ? 'panel-bar-expanded' : ''}`}>

        {/* Appointment Panel - New or Existing */}
        <AppointmentPanel
          isOpen={isNewAppointmentOpen || !!selectedAppointment}
          date={selectedTimeSlot?.date || selectedAppointment?.date || ''}
          time={selectedTimeSlot?.time || selectedAppointment?.startTime || ''}
          onClose={() => {
            setIsNewAppointmentOpen(false);
            setSelectedAppointment(null);
          }}
          onSave={async () => {
            await loadAppointments();
            setIsNewAppointmentOpen(false);
            setSelectedAppointment(null);
          }}
          existingAppointment={selectedAppointment}
        />
        
        {!selectedAppointment && !isNewAppointmentOpen && (
          /* Main Panel - Urgencies + Filters */
          <div className="panel-controls">
            {/* Daily Metrics - Overview of today's appointments */}
            <div className="metrics-section">
              <h4 className="section-title">Métricas do Dia</h4>
              <div className="metrics-cards-grid">
                <div className="metric-card metric-approved">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-count">{dailyMetrics.approved}</span>
                    <span className="metric-label">Aprovados</span>
                  </div>
                </div>
                
                <div className="metric-card metric-pending">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-count">{dailyMetrics.pending}</span>
                    <span className="metric-label">Pendentes</span>
                  </div>
                </div>
                
                <div className="metric-card metric-cancelled">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-count">{dailyMetrics.cancelled}</span>
                    <span className="metric-label">Cancelados</span>
                  </div>
                </div>
                
                <div className="metric-card metric-rescheduled">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <span className="metric-count">{dailyMetrics.rescheduled}</span>
                    <span className="metric-label">Remarcados</span>
                  </div>
                </div>
              </div>
              
              <div className="metrics-summary">
                <span className="summary-label">Total do dia</span>
                <span className="summary-value">{dailyMetrics.approved + dailyMetrics.pending + dailyMetrics.cancelled + dailyMetrics.rescheduled}</span>
              </div>
            </div>

            {/* Waiting Room - Urgency Panel */}
            <div className="urgency-section">
              <div className="section-header">
                <h4 className="section-title">Sala de Espera - Urgência</h4>
                {urgentCount > 0 && <span className="urgency-badge">{urgentCount}</span>}
              </div>
              
              {urgentAppointments.length > 0 ? (
                <>
                  <div className="urgency-list">
                    {urgentAppointments.map((apt) => (
                      <div 
                        key={apt.id} 
                        className={`urgency-item ${getUrgencyClass(apt.urgency!.level)}`}
                        onClick={() => handleAppointmentClick(apt)}
                      >
                        <div className="urgency-indicator"></div>
                        <div className="urgency-content">
                          <div className="urgency-client">{apt.client}</div>
                          <div className="urgency-details">
                            <span className="urgency-time">{apt.startTime}</span>
                            <span className="urgency-separator">•</span>
                            <span className="urgency-service">{apt.service}</span>
                          </div>
                        </div>
                        <div className={`urgency-level-tag ${apt.urgency!.level === 'critical' || apt.urgency!.level === 'high' ? 'high' : apt.urgency!.level === 'medium' ? 'medium' : 'low'}`}>
                          {getUrgencyLabelText(apt.urgency!.level)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {urgentCount > 3 && (
                    <button 
                      className="view-all-urgency-btn"
                      onClick={() => setIsUrgentPanelOpen(true)}
                    >
                      Ver todas as urgências ({urgentCount})
                    </button>
                  )}
                </>
              ) : (
                <div className="urgency-empty-state">
                  <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', padding: '20px 0' }}>
                    Nenhuma urgência no momento
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointments Grid */}
      <div className="appointments-section">
        {/* Week Navigation */}
        <div className="week-navigation">
          <div className="week-controls">
            <button className="week-nav-btn" onClick={goToPreviousWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            
            <div className="week-display">
              <h2>{weekDays[0]?.date ? 
                `${new Date(weekDays[0].date).getDate()} - ${new Date(weekDays[5].date).getDate()} ${new Date(weekDays[0].date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')}` 
                : 'Carregando...'}</h2>
              <span className="week-subtitle">Visão Semanal</span>
            </div>
            
            <button className="week-nav-btn" onClick={goToNextWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="week-actions">
            <button className="today-btn" onClick={goToCurrentWeek}>Hoje</button>
            <span className="user-welcome">{user ? `Olá, ${user.fullName.split(' ')[0]}!` : 'Olá!'}</span>
            <button className="logout-btn" onClick={handleLogout}>Sair</button>
          </div>
        </div>

        <div className="appointments-grid weekly-view">
          {/* Cabeçalho dos dias da semana */}
          <div className="week-header">
            <div className="time-header">Horário</div>
            {weekDays.map((day) => {
              const isBlocked = blockedDays.blocked.has(day.date);
              const blockInfo = blockedDays.info.get(day.date);
              
              return (
                <div key={day.date} className={`day-header ${isBlocked ? 'blocked-day' : ''}`}>
                  <div className="day-name">{day.dayShort}</div>
                  <div className="day-date">
                    {day.date.split('-')[2]}
                    {isBlocked && (
                      <span className="blocked-indicator" title={blockInfo?.reason}>
                        🚫
                      </span>
                    )}
                  </div>
                  {isBlocked && blockInfo?.holiday && (
                    <div className="holiday-name" title={formatHolidayDate(day.date)}>
                      {blockInfo.holiday.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grade com horários e colunas dos dias */}
          <div className="appointments-content">
            <div className="time-column">
              {timeSlots.map((time) => (
                <div key={time} className="time-slot">
                  {time}
                </div>
              ))}
            </div>

            {/* Colunas para cada dia da semana */}
            {weekDays.map((day) => {
              const isBlocked = blockedDays.blocked.has(day.date);
              
              return (
                <div key={day.date} className={`day-column ${isBlocked ? 'blocked-day-column' : ''}`}>
                  <div className="appointments-timeline">
                    {isBlocked && (
                      <div className="blocked-day-overlay">
                        <div className="blocked-message">
                          <span className="blocked-icon">🚫</span>
                          <span className="blocked-text">
                            {blockedDays.info.get(day.date)?.reason || 'Dia bloqueado'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Time slot click areas for new appointments */}
                    {!isBlocked && timeSlots.map((time) => {
                      const timeHour = parseInt(time.split(':')[0]);
                      const timeMinute = parseInt(time.split(':')[1]);
                      const timePosition = ((timeHour - 8) * 60 + timeMinute);
                      
                      // Check if this time slot is occupied
                      const isOccupied = appointments.some(appointment => {
                        if (appointment.date !== day.date) return false;
                        
                        const aptStart = appointment.startTime;
                        const aptEnd = appointment.endTime;
                        
                        return time >= aptStart && time < aptEnd;
                      });
                      
                      return !isOccupied ? (
                        <div
                          key={`${day.date}-${time}`}
                          className="time-slot-clickable"
                          style={{
                            position: 'absolute',
                            top: `${timePosition}px`,
                            height: '30px',
                            width: '100%',
                            cursor: 'pointer',
                            zIndex: 1
                          }}
                          onClick={() => handleTimeSlotClick(day.date, time)}
                          title={`Agendar para ${time}`}
                        />
                      ) : null;
                    })}
                    
                  {appointments
                    .filter((appointment) => appointment.date === day.date)
                    .map((appointment) => {
                      const startHour = parseInt(appointment.startTime.split(':')[0]);
                      const startMinute = parseInt(appointment.startTime.split(':')[1]);
                      const endHour = parseInt(appointment.endTime.split(':')[0]);
                      const endMinute = parseInt(appointment.endTime.split(':')[1]);
                      
                      const startPosition = ((startHour - 8) * 60 + startMinute);
                      const duration = ((endHour - startHour) * 60 + (endMinute - startMinute));
                      const height = duration;

                      return (
                        <div
                          key={appointment.id}
                          className="appointment-block"
                          style={{
                            top: `${startPosition}px`,
                            height: `${height}px`,
                            backgroundColor: appointment.color,
                            position: 'relative',
                            zIndex: 2
                          }}
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <div className="appointment-content">
                            <div className="appointment-title">{appointment.title}</div>
                            <div className="appointment-service">{appointment.service}</div>
                            <div className="appointment-time">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* Urgent Panel Drawer */}
      <Drawer 
        isOpen={isUrgentPanelOpen} 
        onClose={() => setIsUrgentPanelOpen(false)}
        side="left"
      >
        <UrgentPanel 
          appointments={appointments} 
          onAppointmentClick={(apt) => {
            handleAppointmentClick(apt);
            setIsUrgentPanelOpen(false);
          }}
          onClose={() => setIsUrgentPanelOpen(false)}
        />
      </Drawer>

      {/* Settings Modal */}
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;