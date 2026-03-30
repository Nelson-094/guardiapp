import { addHours, startOfDay, isSameDay, format, addDays } from 'date-fns';
import { SHIFT_TYPES } from './shiftPatterns';

/**
 * Genera el calendario de turnos para un período dado.
 * @param {Object} pattern - Patrón de turno (de shiftPatterns.js)
 * @param {Date} startDate - Fecha de inicio del primer turno
 * @param {number} months - Cantidad de meses a generar
 * @param {string[]} holidays - Array de fechas en formato 'yyyy-MM-dd'
 * @returns {Map<string, Object>} Mapa de fecha (yyyy-MM-dd) → datos del día
 */
export function generateCalendar(pattern, startDate, months = 12, holidays = []) {
  const calendar = new Map();
  const totalDays = months * 31 + 10;
  const endDate = addDays(startOfDay(startDate), totalDays);

  let currentTime = new Date(startDate.getTime());
  let slotIndex = 0;

  const holidaySet = new Set(holidays);

  while (currentTime < endDate) {
    const slot = pattern.slots[slotIndex % pattern.slots.length];

    if (slot.type === 'work') {
      const workStart = new Date(currentTime.getTime());
      if (slot.startHour !== undefined) {
        workStart.setHours(slot.startHour, 0, 0, 0);
      }
      const workEnd = addHours(workStart, slot.durationHours);

      // Determine if this is a night shift by checking if workStart hour >= 18 or < 6
      const effectiveShiftType = slot.shiftType || (
        (workStart.getHours() >= 18 || workStart.getHours() < 6)
          ? SHIFT_TYPES.NIGHT
          : SHIFT_TYPES.DAY
      );

      const effectiveSlot = { ...slot, shiftType: effectiveShiftType };

      assignWorkDay(calendar, workStart, workEnd, effectiveSlot, holidaySet);
      currentTime = workEnd;
    } else {
      const offEnd = addHours(currentTime, slot.durationHours);
      assignOffDays(calendar, currentTime, offEnd, holidaySet);
      currentTime = offEnd;
    }

    slotIndex++;
  }

  return calendar;
}

function assignWorkDay(calendar, workStart, workEnd, slot, holidaySet) {
  let cursor = startOfDay(workStart);
  const dayEnd = startOfDay(workEnd);

  while (cursor <= dayEnd) {
    const key = format(cursor, 'yyyy-MM-dd');
    const isHoliday = holidaySet.has(key);

    if (!calendar.has(key)) {
      calendar.set(key, {
        date: new Date(cursor),
        dateKey: key,
        shifts: [],
        isOff: false,
        isHoliday,
      });
    }

    const entry = calendar.get(key);
    entry.isOff = false;

    const dayStart = Math.max(workStart.getTime(), cursor.getTime());
    const dayEndTime = Math.min(workEnd.getTime(), addHours(cursor, 24).getTime());

    if (dayStart < dayEndTime) {
      const startH = new Date(dayStart).getHours() + new Date(dayStart).getMinutes() / 60;
      const hours = (dayEndTime - dayStart) / 3600000;
      const nightHours = calcNightHoursInRange(dayStart, dayEndTime);

      entry.shifts.push({
        label: slot.label,
        shiftType: isHoliday ? SHIFT_TYPES.HOLIDAY : slot.shiftType,
        startHour: startH,
        hours,
        nightHours,
        isNight: slot.shiftType === SHIFT_TYPES.NIGHT,
      });
    }

    cursor = addDays(cursor, 1);
  }
}

function assignOffDays(calendar, offStart, offEnd, holidaySet) {
  let cursor = startOfDay(offStart);
  const lastDay = startOfDay(offEnd);

  while (cursor < lastDay) {
    const key = format(cursor, 'yyyy-MM-dd');
    const isHoliday = holidaySet.has(key);

    if (!calendar.has(key)) {
      calendar.set(key, {
        date: new Date(cursor),
        dateKey: key,
        shifts: [],
        isOff: true,
        isPartialOff: false,
        isHoliday,
      });
    } else {
      // Day already has shifts (e.g. night shift tail) but rest of day is franco
      const entry = calendar.get(key);
      entry.isPartialOff = true;
    }

    cursor = addDays(cursor, 1);
  }
}

/**
 * Calcula las horas nocturnas en un rango dado (22:00–06:00).
 */
function calcNightHoursInRange(startMs, endMs) {
  let nightH = 0;
  let cursor = startMs;

  while (cursor < endMs) {
    const d = new Date(cursor);
    const hour = d.getHours();
    if (hour >= 22 || hour < 6) {
      nightH += Math.min(1, (endMs - cursor) / 3600000);
    }
    cursor += 3600000;
  }

  return Math.round(nightH * 100) / 100;
}

/**
 * Obtiene el resumen de un mes del calendario.
 */
export function getMonthSummary(calendar, year, month) {
  let workDays = 0;
  let offDays = 0;
  let totalHours = 0;
  let nightHours = 0;
  let holidayHours = 0;

  for (const [key, day] of calendar) {
    const d = day.date;
    if (d.getFullYear() === year && d.getMonth() === month) {
      if (day.isOff) {
        offDays++;
      } else {
        workDays++;
        for (const shift of day.shifts) {
          totalHours += shift.hours;
          nightHours += shift.nightHours;
          if (day.isHoliday) {
            holidayHours += shift.hours;
          }
        }
      }
    }
  }

  return { workDays, offDays, totalHours, nightHours, holidayHours };
}
