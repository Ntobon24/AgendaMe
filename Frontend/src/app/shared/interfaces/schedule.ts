export interface BusinessSchedule {
  monday?: { open: string; close: string; closed: boolean };
  tuesday?: { open: string; close: string; closed: boolean };
  wednesday?: { open: string; close: string; closed: boolean };
  thursday?: { open: string; close: string; closed: boolean };
  friday?: { open: string; close: string; closed: boolean };
  saturday?: { open: string; close: string; closed: boolean };
  sunday?: { open: string; close: string; closed: boolean };
  [key: string]: { open: string; close: string; closed: boolean } | undefined;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes', index: 1 },
  { key: 'tuesday', label: 'Martes', index: 2 },
  { key: 'wednesday', label: 'Miércoles', index: 3 },
  { key: 'thursday', label: 'Jueves', index: 4 },
  { key: 'friday', label: 'Viernes', index: 5 },
  { key: 'saturday', label: 'Sábado', index: 6 },
  { key: 'sunday', label: 'Domingo', index: 0 }
] as const;
