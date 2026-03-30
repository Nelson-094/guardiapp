import { useMemo } from 'react';
import { format, isToday, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useShifts } from '../hooks/useShifts';
import { useAppData } from '../context/DataContext';
import { calcMonthlySalary, formatCurrency } from '../engine/financeCalculator';
import { calcHourIndices } from '../engine/hourCalculator';

export default function Dashboard() {
  const { state } = useAppData();
  const { pattern, calendar, getMonthlySummary } = useShifts();

  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const todayData = calendar.get(todayKey);

  const nextWorkDay = useMemo(() => {
    let cursor = addDays(today, 1);
    for (let i = 0; i < 10; i++) {
      const key = format(cursor, 'yyyy-MM-dd');
      const day = calendar.get(key);
      if (day && !day.isOff && day.shifts.length > 0) {
        return day;
      }
      cursor = addDays(cursor, 1);
    }
    return null;
  }, [calendar, today]);

  const monthSummary = getMonthlySummary(today.getFullYear(), today.getMonth());
  const hourIndices = calcHourIndices(monthSummary);
  const salary = calcMonthlySalary(state.baseSalary, state.extras, state.bonuses, state.deductions);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Dashboard</h1>
        <p className="page-header__desc">
          {format(today, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Estado de hoy */}
      <div className="card card--accent animate-in" style={{ marginBottom: 16 }}>
        <div className="card__title">Hoy</div>
        {todayData ? (
          todayData.isOff ? (
            <div>
              <div className="card__value" style={{ color: 'var(--success)' }}>🟢 Franco</div>
              <div className="card__subtitle">Estás de descanso hoy</div>
            </div>
          ) : (
            <div>
              <div className="card__value">
                {todayData.shifts.map((s, i) => (
                  <span key={i}>
                    {s.isNight ? '🌙' : '☀️'} {s.label}
                    {i < todayData.shifts.length - 1 ? ' / ' : ''}
                  </span>
                ))}
              </div>
              <div className="card__subtitle">
                {todayData.shifts.map((s) =>
                  `${Math.floor(s.startHour)}:00 — ${Math.floor(s.startHour + s.hours)}:00`
                ).join(' | ')}
              </div>
            </div>
          )
        ) : (
          <div className="card__value" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            Configurá tu turno en el calendario
          </div>
        )}
      </div>

      {/* Próximo turno */}
      {nextWorkDay && (
        <div className="card animate-in-delay" style={{ marginBottom: 16 }}>
          <div className="card__title">Próximo turno</div>
          <div className="card__value" style={{ fontSize: '1.2rem' }}>
            {nextWorkDay.shifts.map((s, i) => (
              <span key={i}>
                {s.isNight ? '🌙' : '☀️'} {s.label}
                {i < nextWorkDay.shifts.length - 1 ? ' / ' : ''}
              </span>
            ))}
          </div>
          <div className="card__subtitle">
            {format(nextWorkDay.date, "EEEE d 'de' MMMM", { locale: es })}
          </div>
        </div>
      )}

      {/* Stats del mes */}
      <div className="stat-grid animate-in-delay">
        <div className="stat-card">
          <div className="stat-card__icon">📅</div>
          <div className="stat-card__value">{monthSummary.workDays}</div>
          <div className="stat-card__label">Días laborales</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🟢</div>
          <div className="stat-card__value">{monthSummary.offDays}</div>
          <div className="stat-card__label">Días de franco</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">⏱️</div>
          <div className="stat-card__value">{hourIndices.totalRaw}h</div>
          <div className="stat-card__label">Horas totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🌙</div>
          <div className="stat-card__value">{hourIndices.nightHours}h</div>
          <div className="stat-card__label">Horas nocturnas</div>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="card animate-in-delay-2" style={{ marginBottom: 16 }}>
        <div className="card__title">💰 Sueldo estimado del mes</div>
        <div className="card__value">{formatCurrency(salary.netSalary)}</div>
        {salary.extrasCount > 0 && (
          <div className="card__subtitle">
            Incluye {salary.extrasCount} servicio(s) extra por {formatCurrency(salary.extrasTotal)}
          </div>
        )}
        {state.salaryGoal > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Meta: {formatCurrency(state.salaryGoal)}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {Math.min(100, Math.round((salary.netSalary / state.salaryGoal) * 100))}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar__fill ${
                  salary.netSalary >= state.salaryGoal ? 'progress-bar__fill--gold' : ''
                }`}
                style={{ width: `${Math.min(100, (salary.netSalary / state.salaryGoal) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Patrón activo */}
      <div className="card animate-in-delay-2">
        <div className="card__title">🔄 Patrón activo</div>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{pattern.name}</div>
        <div className="card__subtitle">{pattern.description}</div>
      </div>
    </div>
  );
}
