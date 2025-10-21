import React from 'react';
import NewAppointmentForm from './NewAppointmentForm';
import ExistingAppointmentView from './ExistingAppointmentView';

interface AppointmentPanelProps {
  isOpen: boolean;
  date: string;
  time: string;
  onClose: () => void;
  onSave: (data: any) => void;
  existingAppointment?: any;
}

const AppointmentPanel: React.FC<AppointmentPanelProps> = ({
  isOpen,
  date,
  time,
  onClose,
  onSave,
  existingAppointment
}) => {
  if (!isOpen) return null;

  return (
    <>
      {existingAppointment ? (
        <ExistingAppointmentView 
          appointment={existingAppointment}
          onClose={onClose}
          onSave={onSave}
        />
      ) : (
        <NewAppointmentForm 
          date={date}
          time={time}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </>
  );
};

export default AppointmentPanel;
