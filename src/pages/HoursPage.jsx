import { useState } from 'react';
import { useShifts } from '../hooks/useShifts';
import { useAppData } from '../context/DataContext';
import { calcHourIndices, calcAnnualBalance, INCIDENT_TYPES } from '../engine/hourCalculator';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function HoursPage() {
  const { state, dispatch } = useAppData();
  const { getMonthlySummary } = useShifts();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [newIncident, setNewIncident] = useState({ type: 'sick_leave', hours: '', description: '', month: new Date().getMonth() });

  const year = new Date().getFullYear();
  const monthSummary = getMonthlySummary(year, selectedMonth);
  const hourIndices = calcHourIndices(monthSummary);

  const monthlySummaries = Array.from({ length: 12 }, (_, i) => getMonthlySummary(year, i));
  const annualBalance = calcAnnualBalance(monthlySummaries, state.incidents);

  const maxHours = Math.max(hourIndices.totalCorrected, hourIndices.standardHours, 1);

  const handleAddIncident = () => {
    if (!newIncident.hours) return;
    dispatch({
      type: 'ADD_INCIDENT',
      payload: {
        ...newIncident,
        hours: Number(newIncident.hours),
        date: new Date().toISOString(),
        id: Date.now(),
      },
    });
    setNewIncident({ type: 'sick_leave', hours: '', description: '', month: selectedMonth });
    setShowAddIncident(false);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Control de Horas</h1>
        <p className="page-header__desc">Índices correctores y saldo horario</p>
      </div>

      {/* Selector de mes */}
      <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', gap: 2 }}>
        {MONTHS.map((m, i) => (
          <button
            key={i}
            className={`tabs__tab ${selectedMonth === i ? 'tabs__tab--active' : ''}`}
            onClick={() => setSelectedMonth(i)}
            style={{ flex: 'none', padding: '6px 10px', fontSize: '0.75rem' }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Resumen mensual */}
      <div className="stat-grid animate-in">
        <div className="stat-card">
          <div className="stat-card__icon">⏱️</div>
          <div className="stat-card__value">{hourIndices.totalRaw}h</div>
          <div className="stat-card__label">Horas brutas</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">📐</div>
          <div className="stat-card__value">{hourIndices.totalCorrected}h</div>
          <div className="stat-card__label">Horas corregidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🌙</div>
          <div className="stat-card__value">{hourIndices.nightHours}h</div>
          <div className="stat-card__label">H. Nocturnas</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🔴</div>
          <div className="stat-card__value">{hourIndices.holidayHours}h</div>
          <div className="stat-card__label">H. Festivas</div>
        </div>
      </div>

      {/* Barras de horas */}
      <div className="card animate-in-delay" style={{ marginBottom: 16 }}>
        <div className="card__title">📊 Índices correctores — {MONTHS[selectedMonth]}</div>

        <div className="hour-bar" style={{ marginTop: 12 }}>
          <div className="hour-bar__label">Regular</div>
          <div className="hour-bar__track">
            <div
              className="hour-bar__fill hour-bar__fill--regular"
              style={{ width: `${(hourIndices.regularHours / maxHours) * 100}%` }}
            >
              {hourIndices.regularHours}h
            </div>
          </div>
        </div>

        <div className="hour-bar">
          <div className="hour-bar__label">Noct. (×{1.3})</div>
          <div className="hour-bar__track">
            <div
              className="hour-bar__fill hour-bar__fill--night"
              style={{ width: `${(hourIndices.correctedNightHours / maxHours) * 100}%` }}
            >
              {hourIndices.correctedNightHours}h
            </div>
          </div>
        </div>

        <div className="hour-bar">
          <div className="hour-bar__label">Fest. (×{2.0})</div>
          <div className="hour-bar__track">
            <div
              className="hour-bar__fill hour-bar__fill--holiday"
              style={{ width: `${(hourIndices.correctedHolidayHours / maxHours) * 100}%` }}
            >
              {hourIndices.correctedHolidayHours}h
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: 12, background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exceso / Déficit mensual</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: hourIndices.isOvertime ? 'var(--gold)' : 'var(--text-primary)' }}>
              {hourIndices.excess > 0 ? '+' : ''}{hourIndices.excess}h
            </div>
          </div>
          <div className={`badge ${hourIndices.isOvertime ? 'badge--positive' : 'badge--neutral'}`}>
            {hourIndices.isOvertime ? 'Exceso' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Saldo Anual */}
      <div className="card animate-in-delay" style={{ marginBottom: 16 }}>
        <div className="card__title">📅 Saldo anual {year}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Horas trabajadas (corregidas)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{annualBalance.totalWorked}h</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estándar anual</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{annualBalance.annualStandard}h</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="progress-bar" style={{ height: 10 }}>
            <div
              className={`progress-bar__fill ${
                annualBalance.balance > 0 ? 'progress-bar__fill--gold' : ''
              }`}
              style={{
                width: `${Math.min(100, (annualBalance.totalWorked / annualBalance.annualStandard) * 100)}%`,
              }}
            />
          </div>
          <div style={{
            textAlign: 'center', marginTop: 8, fontSize: '0.85rem', fontWeight: 600,
            color: annualBalance.balance > 0 ? 'var(--gold)' : 'var(--text-secondary)',
          }}>
            Balance: {annualBalance.balance > 0 ? '+' : ''}{annualBalance.balance}h
          </div>
        </div>
      </div>

      {/* Incidencias */}
      <div className="card animate-in-delay-2">
        <div className="section__header">
          <div className="card__title">📋 Incidencias</div>
          <button className="btn btn--primary btn--sm" onClick={() => setShowAddIncident(true)}>
            + Agregar
          </button>
        </div>
        {state.incidents.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div className="empty-state__desc">No hay incidencias registradas</div>
          </div>
        ) : (
          state.incidents.map((inc, i) => {
            const incType = Object.values(INCIDENT_TYPES).find((t) => t.id === inc.type);
            return (
              <div key={i} className="list-item">
                <div className="list-item__left">
                  <div className="list-item__icon">{incType?.icon || '📋'}</div>
                  <div>
                    <div className="list-item__text">{incType?.label || inc.type}</div>
                    {inc.description && <div className="list-item__sub">{inc.description}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="list-item__value">{inc.hours}h</div>
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => dispatch({ type: 'REMOVE_INCIDENT', payload: i })}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal agregar incidencia */}
      {showAddIncident && (
        <div className="modal-overlay" onClick={() => setShowAddIncident(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Registrar Incidencia</h3>
              <button className="modal__close" onClick={() => setShowAddIncident(false)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label htmlFor="incident-type">Tipo</label>
                <select
                  id="incident-type"
                  value={newIncident.type}
                  onChange={(e) => setNewIncident((p) => ({ ...p, type: e.target.value }))}
                >
                  {Object.values(INCIDENT_TYPES).map((t) => (
                    <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="incident-hours">Horas</label>
                <input
                  id="incident-hours"
                  type="number"
                  placeholder="Ej: 8"
                  value={newIncident.hours}
                  onChange={(e) => setNewIncident((p) => ({ ...p, hours: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="incident-desc">Descripción (opcional)</label>
                <input
                  id="incident-desc"
                  type="text"
                  placeholder="Nota adicional"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowAddIncident(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleAddIncident}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
