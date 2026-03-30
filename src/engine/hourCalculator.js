/**
 * Cálculos de horas, índices correctores y saldos.
 */

/**
 * Configuración por defecto de índices correctores.
 */
export const DEFAULT_HOUR_CONFIG = {
  nightMultiplier: 1.3,
  holidayMultiplier: 2.0,
  extraMultiplier: 1.5,
  standardMonthlyHours: 160,
};

/**
 * Calcula horas nocturnas, festivas y sus correcciones.
 * @param {Object} monthSummary - Resumen del mes (de shiftCalculator)
 * @param {Object} config - Configuración de índices
 * @returns {Object} Desglose de horas con correcciones
 */
export function calcHourIndices(monthSummary, config = DEFAULT_HOUR_CONFIG) {
  const { totalHours, nightHours, holidayHours } = monthSummary;
  const regularHours = totalHours - nightHours - holidayHours;

  const correctedNightHours = nightHours * config.nightMultiplier;
  const correctedHolidayHours = holidayHours * config.holidayMultiplier;

  const totalCorrected = regularHours + correctedNightHours + correctedHolidayHours;
  const excess = totalCorrected - config.standardMonthlyHours;

  return {
    regularHours: round(regularHours),
    nightHours: round(nightHours),
    holidayHours: round(holidayHours),
    correctedNightHours: round(correctedNightHours),
    correctedHolidayHours: round(correctedHolidayHours),
    totalRaw: round(totalHours),
    totalCorrected: round(totalCorrected),
    standardHours: config.standardMonthlyHours,
    excess: round(excess),
    isOvertime: excess > 0,
  };
}

/**
 * Calcula el saldo anual de horas.
 * @param {Object[]} monthlySummaries - Array de 12 resúmenes mensuales
 * @param {Object[]} incidents - Incidencias [{type, hours, month}]
 * @param {Object} config - Configuración
 * @returns {Object} Saldo anual
 */
export function calcAnnualBalance(monthlySummaries, incidents = [], config = DEFAULT_HOUR_CONFIG) {
  let totalWorked = 0;
  let totalNight = 0;
  let totalHoliday = 0;
  const monthlyData = [];
  const annualStandard = config.standardMonthlyHours * 12;

  for (let i = 0; i < monthlySummaries.length; i++) {
    const summary = monthlySummaries[i] || { totalHours: 0, nightHours: 0, holidayHours: 0 };
    const indices = calcHourIndices(summary, config);
    monthlyData.push(indices);
    totalWorked += indices.totalCorrected;
    totalNight += indices.nightHours;
    totalHoliday += indices.holidayHours;
  }

  const incidentHours = incidents.reduce((sum, inc) => sum + (Number(inc.hours) || 0), 0);

  return {
    totalWorked: round(totalWorked),
    totalNight: round(totalNight),
    totalHoliday: round(totalHoliday),
    annualStandard,
    incidentHours: round(incidentHours),
    balance: round(totalWorked - incidentHours - annualStandard),
    monthlyData,
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Tipos de incidencia.
 */
export const INCIDENT_TYPES = {
  SICK_LEAVE: { id: 'sick_leave', label: 'Licencia por enfermedad', icon: '🏥' },
  PERSONAL_DAY: { id: 'personal_day', label: 'Día de asuntos propios', icon: '📋' },
  PERMISSION: { id: 'permission', label: 'Permiso', icon: '📝' },
  VACATION: { id: 'vacation', label: 'Vacaciones', icon: '🏖️' },
  OVERTIME: { id: 'overtime', label: 'Horas extra', icon: '⏰' },
  EXTRA_SERVICE: { id: 'extra_service', label: 'Servicio extraordinario', icon: '🚔' },
};
