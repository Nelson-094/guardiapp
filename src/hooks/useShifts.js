import { useMemo } from 'react';
import { useAppData } from '../context/DataContext';
import { PATTERNS } from '../engine/shiftPatterns';
import { generateCalendar, getMonthSummary } from '../engine/shiftCalculator';

/**
 * Hook que genera y cachea el calendario basado en la configuración actual.
 */
export function useShifts() {
  const { state } = useAppData();

  const pattern = useMemo(() => {
    if (PATTERNS[state.selectedPattern]) {
      return PATTERNS[state.selectedPattern];
    }
    const custom = state.customPatterns.find((p) => p.id === state.selectedPattern);
    return custom || PATTERNS['12x24_12x48'];
  }, [state.selectedPattern, state.customPatterns]);

  const calendar = useMemo(() => {
    const hour = String(state.startHour ?? 7).padStart(2, '0');
    const start = new Date(state.startDate + `T${hour}:00:00`);
    return generateCalendar(pattern, start, 13, state.holidays);
  }, [pattern, state.startDate, state.startHour, state.holidays]);

  const getMonthlySummary = (year, month) => {
    return getMonthSummary(calendar, year, month);
  };

  return { pattern, calendar, getMonthlySummary };
}
