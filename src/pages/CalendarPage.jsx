import { useState, useMemo } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isToday, isSameMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useShifts } from '../hooks/useShifts';
import { useAppData } from '../context/DataContext';
import { PATTERNS, getPatternList } from '../engine/shiftPatterns';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarPage() {
  const { state, dispatch } = useAppData();
  const { calendar } = useShifts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  }, [currentMonth]);

  const patterns = getPatternList();

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Calendario</h1>
        <p className="page-header__desc">Generador de cuadrante inteligente</p>
      </div>

      {/* Configuración */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pattern-select">Patrón de turno</label>
            <select
              id="pattern-select"
              value={state.selectedPattern}
              onChange={(e) => dispatch({ type: 'SET_PATTERN', payload: e.target.value })}
            >
              {patterns.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {state.customPatterns.map((p) => (
                <option key={p.id} value={p.id}>✨ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="start-date">Fecha de inicio</label>
            <input
              id="start-date"
              type="date"
              value={state.startDate}
              onChange={(e) => dispatch({ type: 'SET_START_DATE', payload: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="start-hour">Hora de ingreso</label>
            <select
              id="start-hour"
              value={state.startHour ?? 7}
              onChange={(e) => dispatch({ type: 'SET_START_HOUR', payload: e.target.value })}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leyenda Visual */}
      <div className="calendar-legend animate-in-delay">
        <div className="legend-item">
          <span className="shift-badge shift-badge--day">☀️</span> Día
        </div>
        <div className="legend-item">
          <span className="shift-badge shift-badge--night">🌙</span> Noche
        </div>
        <div className="legend-item">
          <span className="shift-badge shift-badge--off">F</span> Franco
        </div>
        <div className="legend-item">
          <span className="shift-badge shift-badge--holiday">🟣</span> Feriado
        </div>
      </div>

      {/* Calendario */}
      <div className="calendar animate-in-delay-2">
        <div className="calendar__header">
          <button
            className="calendar__nav-btn"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label="Mes anterior"
          >
            ◀
          </button>
          <span className="calendar__title">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            className="calendar__nav-btn"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
          >
            ▶
          </button>
        </div>

        <div className="calendar__weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar__weekday">{d}</div>
          ))}
        </div>

        <div className="calendar__grid">
          {calendarDays.map((date) => {
            const key = format(date, 'yyyy-MM-dd');
            const dayData = calendar.get(key);
            const inMonth = isSameMonth(date, currentMonth);
            const today = isToday(date);

            let className = 'calendar__day';
            if (!inMonth) className += ' calendar__day--empty';
            if (today) className += ' calendar__day--today';
            if (dayData?.isOff || dayData?.isPartialOff) className += ' calendar__day--off';
            else if (dayData?.shifts?.length > 0) className += ' calendar__day--work';
            if (dayData?.isHoliday) className += ' calendar__day--holiday';

            return (
              <div
                key={key}
                className={className}
                onClick={() => dayData && setSelectedDay(dayData)}
                style={{ opacity: inMonth ? 1 : 0.3, cursor: dayData ? 'pointer' : 'default' }}
              >
                <span className="calendar__day-number">{format(date, 'd')}</span>
                {dayData && inMonth && (
                  <>
                    {dayData.isOff ? (
                      <span className="shift-badge shift-badge--off" style={{ fontSize: '0.5rem' }}>F</span>
                    ) : (
                      <>
                        {dayData.shifts.map((s, i) => (
                          <span
                            key={i}
                            className={`shift-badge shift-badge--${s.isNight ? 'night' : 'day'}`}
                            style={{ fontSize: '0.5rem' }}
                          >
                            {s.isNight ? '🌙' : '☀️'}
                          </span>
                        ))}
                        {dayData.isPartialOff && (
                          <span className="shift-badge shift-badge--off" style={{ fontSize: '0.5rem' }}>F</span>
                        )}
                      </>
                    )}
                    {dayData.isHoliday && (
                      <span className="shift-badge shift-badge--holiday" style={{ fontSize: '0.5rem' }}>🟣</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                {format(selectedDay.date, "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <button className="modal__close" onClick={() => setSelectedDay(null)}>✕</button>
            </div>
            <div className="modal__body">
              {selectedDay.isHoliday && (
                <div className="badge shift-badge--holiday" style={{ marginBottom: 12, display: 'inline-flex' }}>🟣 Feriado</div>
              )}
              {selectedDay.isOff && !selectedDay.isPartialOff ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🟢</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--success)' }}>Franco</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    Día de descanso
                  </p>
                </div>
              ) : (
                <div>
                  {selectedDay.shifts.map((shift, i) => {
                    const startH = Math.floor(shift.startHour);
                    const endH = Math.floor(shift.startHour + shift.hours) % 24;
                    const startStr = String(startH).padStart(2, '0') + ':00';
                    const endStr = String(endH).padStart(2, '0') + ':00';
                    return (
                      <div key={i} className="list-item">
                        <div className="list-item__left">
                          <div className="list-item__icon">{shift.isNight ? '🌙' : '☀️'}</div>
                          <div>
                            <div className="list-item__text">{shift.label}</div>
                            <div className="list-item__sub">
                              {startStr} — {endStr}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="list-item__value">{shift.hours}h</div>
                          {shift.nightHours > 0 && (
                            <div className="list-item__sub">{shift.nightHours}h noct.</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {selectedDay.isPartialOff && (
                    <div className="list-item" style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12 }}>
                      <div className="list-item__left">
                        <div className="list-item__icon">🟢</div>
                        <div>
                          <div className="list-item__text" style={{ color: 'var(--success)' }}>Franco</div>
                          <div className="list-item__sub">Saliente de guardia → Descanso</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
