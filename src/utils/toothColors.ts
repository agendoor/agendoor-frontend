// Cores padronizadas para os dentes baseadas no status
export const getToothColors = (status: string) => {
  const colors = {
    healthy: { fill: '#f8fafc', stroke: '#e2e8f0' },
    caries: { fill: '#fca5a5', stroke: '#ef4444' },
    restored: { fill: '#93c5fd', stroke: '#3b82f6' },
    missing: { fill: 'transparent', stroke: '#9ca3af' },
    implant: { fill: '#c4b5fd', stroke: '#8b5cf6' },
    crown: { fill: '#fcd34d', stroke: '#f59e0b' },
    root_canal: { fill: '#f9a8d4', stroke: '#ec4899' }
  };
  
  return colors[status as keyof typeof colors] || colors.healthy;
};

// Cores para a legenda (compatibilidade com o código existente)
export const getToothColor = (status: string) => {
  return getToothColors(status).fill;
};

export const getToothStroke = (status: string) => {
  return getToothColors(status).stroke;
};

// Labels para os status
export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'healthy': return 'Hígido';
    case 'caries': return 'Cárie';
    case 'restored': return 'Restaurado';
    case 'missing': return 'Ausente';
    case 'implant': return 'Implante';
    case 'crown': return 'Coroa';
    case 'root_canal': return 'Tratamento Endodôntico';
    default: return 'Hígido';
  }
};