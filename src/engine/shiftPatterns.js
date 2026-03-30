/**
 * Patrones de turno predefinidos para la Policía de Mendoza.
 * Cada patrón tiene un nombre, descripción y una secuencia de slots.
 * Un slot puede ser 'work' (turno) o 'off' (descanso/franco).
 */

export const SHIFT_TYPES = {
  DAY: 'day',
  NIGHT: 'night',
  OFF: 'off',
  HOLIDAY: 'holiday',
  LEAVE: 'leave',
  EXTRA: 'extra',
};

export const SHIFT_COLORS = {
  [SHIFT_TYPES.DAY]: '#2A5A8C',
  [SHIFT_TYPES.NIGHT]: '#1B3A5C',
  [SHIFT_TYPES.OFF]: '#2D6A4F',
  [SHIFT_TYPES.HOLIDAY]: '#8B1A1A',
  [SHIFT_TYPES.LEAVE]: '#6B5B95',
  [SHIFT_TYPES.EXTRA]: '#C9A84C',
};

export const PATTERNS = {
  '12x24_12x48': {
    id: '12x24_12x48',
    name: '12×24 / 12×48',
    description: 'Turno estándar Policía de Mendoza. Día→Franco 24h→Noche→Franco 48h',
    slots: [
      { type: 'work', label: 'Día', shiftType: SHIFT_TYPES.DAY, durationHours: 12 },
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 24 },
      { type: 'work', label: 'Noche', shiftType: SHIFT_TYPES.NIGHT, durationHours: 12 },
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 48 },
    ],
  },
  americano: {
    id: 'americano',
    name: 'Americano (24×48)',
    description: '24 horas de trabajo, 48 horas de franco',
    slots: [
      { type: 'work', label: 'Guardia 24h', shiftType: SHIFT_TYPES.DAY, startHour: 8, durationHours: 24 },
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 48 },
    ],
  },
  africano: {
    id: 'africano',
    name: 'Africano (24×24)',
    description: '24 horas de trabajo, 24 horas de franco',
    slots: [
      { type: 'work', label: 'Guardia 24h', shiftType: SHIFT_TYPES.DAY, startHour: 8, durationHours: 24 },
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 24 },
    ],
  },
  '6x6': {
    id: '6x6',
    name: '6×6',
    description: '6 días de trabajo, 6 días de franco',
    slots: [
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'work',
        label: `Día ${i + 1}`,
        shiftType: SHIFT_TYPES.DAY,
        startHour: 7,
        durationHours: 12,
      })),
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 144 },
    ],
  },
  '6x5': {
    id: '6x5',
    name: '6×5',
    description: '6 días de trabajo, 5 días de franco',
    slots: [
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'work',
        label: `Día ${i + 1}`,
        shiftType: SHIFT_TYPES.DAY,
        startHour: 7,
        durationHours: 12,
      })),
      { type: 'off', label: 'Franco', shiftType: SHIFT_TYPES.OFF, durationHours: 120 },
    ],
  },
  quintoTurno: {
    id: 'quintoTurno',
    name: 'Quinto Turno (MNSDD)',
    description: 'Mañana → Noche → Saliente → Descanso → Descanso',
    slots: [
      { type: 'work', label: 'Mañana', shiftType: SHIFT_TYPES.DAY, startHour: 6, durationHours: 8 },
      { type: 'work', label: 'Noche', shiftType: SHIFT_TYPES.NIGHT, startHour: 22, durationHours: 8 },
      { type: 'work', label: 'Saliente', shiftType: SHIFT_TYPES.DAY, startHour: 14, durationHours: 8 },
      { type: 'off', label: 'Descanso', shiftType: SHIFT_TYPES.OFF, durationHours: 24 },
      { type: 'off', label: 'Descanso', shiftType: SHIFT_TYPES.OFF, durationHours: 24 },
    ],
  },
};

/**
 * Crea un patrón personalizado a partir de los slots definidos por el usuario.
 */
export function createCustomPattern(name, description, slots) {
  return {
    id: `custom_${Date.now()}`,
    name: name || 'Patrón Personalizado',
    description: description || 'Patrón definido por el usuario',
    slots,
    isCustom: true,
  };
}

/**
 * Retorna la lista de todos los patrones predefinidos.
 */
export function getPatternList() {
  return Object.values(PATTERNS);
}
