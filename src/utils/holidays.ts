// Utilitários para feriados brasileiros
import { addDays, format, parseISO } from 'date-fns';

export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD
  type: 'NATIONAL' | 'STATE' | 'CITY' | 'CUSTOM';
  recurring: boolean; // true para feriados que se repetem todo ano
}

// Feriados nacionais fixos (se repetem todo ano)
export const NATIONAL_HOLIDAYS_FIXED: Omit<Holiday, 'date'>[] = [
  { name: 'Confraternização Universal', type: 'NATIONAL', recurring: true }, // 01/01
  { name: 'Dia de Tiradentes', type: 'NATIONAL', recurring: true }, // 21/04
  { name: 'Dia do Trabalho', type: 'NATIONAL', recurring: true }, // 01/05
  { name: 'Independência do Brasil', type: 'NATIONAL', recurring: true }, // 07/09
  { name: 'Nossa Senhora Aparecida', type: 'NATIONAL', recurring: true }, // 12/10
  { name: 'Finados', type: 'NATIONAL', recurring: true }, // 02/11
  { name: 'Proclamação da República', type: 'NATIONAL', recurring: true }, // 15/11
  { name: 'Natal', type: 'NATIONAL', recurring: true }, // 25/12
];

// Datas fixas para feriados nacionais
const getFixedHolidays = (year: number): Holiday[] => {
  const fixedDates = [
    { month: 1, day: 1, name: 'Confraternização Universal' },
    { month: 4, day: 21, name: 'Dia de Tiradentes' },
    { month: 5, day: 1, name: 'Dia do Trabalho' },
    { month: 9, day: 7, name: 'Independência do Brasil' },
    { month: 10, day: 12, name: 'Nossa Senhora Aparecida' },
    { month: 11, day: 2, name: 'Finados' },
    { month: 11, day: 15, name: 'Proclamação da República' },
    { month: 12, day: 25, name: 'Natal' },
  ];

  return fixedDates.map(({ month, day, name }) => ({
    name,
    date: format(new Date(year, month - 1, day), 'yyyy-MM-dd'),
    type: 'NATIONAL' as const,
    recurring: true,
  }));
};

// Cálculo do Domingo de Páscoa usando algoritmo de Gauss
const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  
  return new Date(year, n - 1, p + 1);
};

// Feriados móveis baseados na Páscoa
const getEasterHolidays = (year: number): Holiday[] => {
  const easter = getEasterSunday(year);
  
  return [
    {
      name: 'Carnaval (Segunda-feira)',
      date: format(addDays(easter, -48), 'yyyy-MM-dd'),
      type: 'NATIONAL' as const,
      recurring: true,
    },
    {
      name: 'Carnaval (Terça-feira)',
      date: format(addDays(easter, -47), 'yyyy-MM-dd'),
      type: 'NATIONAL' as const,
      recurring: true,
    },
    {
      name: 'Sexta-feira Santa',
      date: format(addDays(easter, -2), 'yyyy-MM-dd'),
      type: 'NATIONAL' as const,
      recurring: true,
    },
    {
      name: 'Domingo de Páscoa',
      date: format(easter, 'yyyy-MM-dd'),
      type: 'NATIONAL' as const,
      recurring: true,
    },
    {
      name: 'Corpus Christi',
      date: format(addDays(easter, 60), 'yyyy-MM-dd'),
      type: 'NATIONAL' as const,
      recurring: true,
    },
  ];
};

// Obter todos os feriados nacionais para um ano
export const getNationalHolidays = (year: number): Holiday[] => {
  return [
    ...getFixedHolidays(year),
    ...getEasterHolidays(year),
  ];
};

// Alguns feriados estaduais comuns (São Paulo como exemplo)
export const getSaopauloStateHolidays = (year: number): Holiday[] => {
  return [
    {
      name: 'Revolução Constitucionalista',
      date: format(new Date(year, 6, 9), 'yyyy-MM-dd'), // 09/07
      type: 'STATE' as const,
      recurring: true,
    },
    {
      name: 'Consciência Negra (SP)',
      date: format(new Date(year, 10, 20), 'yyyy-MM-dd'), // 20/11
      type: 'STATE' as const,
      recurring: true,
    },
  ];
};

// Alguns feriados municipais comuns (São Paulo capital como exemplo)
export const getSaoPauloCityHolidays = (year: number): Holiday[] => {
  return [
    {
      name: 'Aniversário de São Paulo',
      date: format(new Date(year, 0, 25), 'yyyy-MM-dd'), // 25/01
      type: 'CITY' as const,
      recurring: true,
    },
    {
      name: 'São João (SP)',
      date: format(new Date(year, 5, 24), 'yyyy-MM-dd'), // 24/06
      type: 'CITY' as const,
      recurring: true,
    },
  ];
};

// Verificar se uma data é feriado
export const isHoliday = (
  date: string, // YYYY-MM-DD
  holidays: Holiday[]
): Holiday | null => {
  return holidays.find(holiday => holiday.date === date) || null;
};

// Verificar se uma data está bloqueada (feriado ou bloqueio customizado)
export const isDateBlocked = (
  date: string,
  settings: {
    nationalHolidays: boolean;
    stateHolidays: boolean;
    cityHolidays: boolean;
  },
  customHolidays: Holiday[] = [],
  bridges: Array<{ startDate: string; endDate: string; enabled: boolean }> = [],
  blocks: Array<{ startDate: string; endDate: string; enabled: boolean }> = [],
  unblocks: Array<{ date: string; enabled: boolean }> = []
): { blocked: boolean; reason?: string; holiday?: Holiday } => {
  const dateObj = parseISO(date);
  const year = dateObj.getFullYear();
  
  // Verificar se há desbloqueio específico para esta data
  const unblock = unblocks.find(u => u.date === date && u.enabled);
  if (unblock) {
    return { blocked: false };
  }
  
  // Verificar feriados nacionais
  if (settings.nationalHolidays) {
    const nationalHolidays = getNationalHolidays(year);
    const holiday = isHoliday(date, nationalHolidays);
    if (holiday) {
      return { blocked: true, reason: 'Feriado Nacional', holiday };
    }
  }
  
  // Verificar feriados estaduais (exemplo SP)
  if (settings.stateHolidays) {
    const stateHolidays = getSaopauloStateHolidays(year);
    const holiday = isHoliday(date, stateHolidays);
    if (holiday) {
      return { blocked: true, reason: 'Feriado Estadual', holiday };
    }
  }
  
  // Verificar feriados municipais (exemplo SP)
  if (settings.cityHolidays) {
    const cityHolidays = getSaoPauloCityHolidays(year);
    const holiday = isHoliday(date, cityHolidays);
    if (holiday) {
      return { blocked: true, reason: 'Feriado Municipal', holiday };
    }
  }
  
  // Verificar feriados customizados
  const customHoliday = isHoliday(date, customHolidays.filter(h => h.type === 'CUSTOM'));
  if (customHoliday) {
    return { blocked: true, reason: 'Feriado Personalizado', holiday: customHoliday };
  }
  
  // Verificar pontes de feriados
  for (const bridge of bridges) {
    if (!bridge.enabled) continue;
    
    if (date >= bridge.startDate && date <= bridge.endDate) {
      return { blocked: true, reason: 'Ponte de Feriado' };
    }
  }
  
  // Verificar bloqueios personalizados (férias, folgas, etc)
  for (const block of blocks) {
    if (!block.enabled) continue;
    
    if (date >= block.startDate && date <= block.endDate) {
      return { blocked: true, reason: 'Período Bloqueado' };
    }
  }
  
  return { blocked: false };
};

// Obter próximos feriados
export const getUpcomingHolidays = (
  startDate: string,
  settings: {
    nationalHolidays: boolean;
    stateHolidays: boolean;
    cityHolidays: boolean;
  },
  customHolidays: Holiday[] = [],
  limit: number = 10
): Holiday[] => {
  const start = parseISO(startDate);
  const year = start.getFullYear();
  const nextYear = year + 1;
  
  let allHolidays: Holiday[] = [];
  
  if (settings.nationalHolidays) {
    allHolidays.push(...getNationalHolidays(year));
    allHolidays.push(...getNationalHolidays(nextYear));
  }
  
  if (settings.stateHolidays) {
    allHolidays.push(...getSaopauloStateHolidays(year));
    allHolidays.push(...getSaopauloStateHolidays(nextYear));
  }
  
  if (settings.cityHolidays) {
    allHolidays.push(...getSaoPauloCityHolidays(year));
    allHolidays.push(...getSaoPauloCityHolidays(nextYear));
  }
  
  // Adicionar feriados customizados
  allHolidays.push(...customHolidays);
  
  // Filtrar apenas feriados futuros e ordenar por data
  return allHolidays
    .filter(holiday => holiday.date >= startDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
};

// Função auxiliar para formatar data em português
export const formatHolidayDate = (date: string): string => {
  const dateObj = parseISO(date);
  return dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Verificar se o final de semana deve ser considerado bloqueado
export const isWeekend = (date: string): boolean => {
  const dateObj = parseISO(date);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
};

// Função para sugerir pontes automaticamente
export const suggestBridges = (year: number): Array<{ name: string; startDate: string; endDate: string }> => {
  const holidays = getNationalHolidays(year);
  const suggestions: Array<{ name: string; startDate: string; endDate: string }> = [];
  
  for (const holiday of holidays) {
    const holidayDate = parseISO(holiday.date);
    const dayOfWeek = holidayDate.getDay();
    
    // Sugerir ponte se o feriado cai na terça ou quinta
    if (dayOfWeek === 2) { // Terça
      const mondayBefore = format(addDays(holidayDate, -1), 'yyyy-MM-dd');
      suggestions.push({
        name: `Ponte - ${holiday.name}`,
        startDate: mondayBefore,
        endDate: holiday.date,
      });
    } else if (dayOfWeek === 4) { // Quinta
      const fridayAfter = format(addDays(holidayDate, 1), 'yyyy-MM-dd');
      suggestions.push({
        name: `Ponte - ${holiday.name}`,
        startDate: holiday.date,
        endDate: fridayAfter,
      });
    }
  }
  
  return suggestions;
};