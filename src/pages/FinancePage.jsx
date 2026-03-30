import { useState } from 'react';
import { useAppData } from '../context/DataContext';
import {
  calcMonthlySalary, calcExtraServicesNeeded, parseSalarySlip, formatCurrency,
} from '../engine/financeCalculator';

export default function FinancePage() {
  const { state, dispatch } = useAppData();
  const [activeTab, setActiveTab] = useState('resumen');
  const [newExtra, setNewExtra] = useState({ description: '', amount: '' });
  const [newSlipField, setNewSlipField] = useState({ concept: '', amount: '', type: 'haberes' });

  const salary = calcMonthlySalary(state.baseSalary, state.extras, state.bonuses, state.deductions);
  const extraCalc = calcExtraServicesNeeded(state.salaryGoal, salary.netSalary, state.ratePerService);
  const slipAnalysis = parseSalarySlip(state.salarySlipFields);

  const handleAddExtra = () => {
    if (!newExtra.description || !newExtra.amount) return;
    dispatch({ type: 'ADD_EXTRA', payload: { ...newExtra, amount: Number(newExtra.amount) } });
    setNewExtra({ description: '', amount: '' });
  };

  const handleAddSlipField = () => {
    if (!newSlipField.concept || !newSlipField.amount) return;
    dispatch({
      type: 'SET_SALARY_SLIP',
      payload: [...state.salarySlipFields, { ...newSlipField, amount: Number(newSlipField.amount) }],
    });
    setNewSlipField({ concept: '', amount: '', type: 'haberes' });
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Finanzas</h1>
        <p className="page-header__desc">Control salarial y servicios extraordinarios</p>
      </div>

      <div className="tabs">
        {[
          { id: 'resumen', label: 'Resumen' },
          { id: 'extras', label: 'Extras' },
          { id: 'meta', label: 'Meta' },
          { id: 'bono', label: 'Bono' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==== RESUMEN ==== */}
      {activeTab === 'resumen' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__title">💼 Sueldo Base</div>
            <div className="form-group" style={{ marginTop: 8 }}>
              <input
                type="number"
                id="base-salary"
                placeholder="Ingresá tu sueldo base"
                value={state.baseSalary || ''}
                onChange={(e) => dispatch({ type: 'SET_BASE_SALARY', payload: e.target.value })}
              />
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card__icon">💵</div>
              <div className="stat-card__value">{formatCurrency(salary.grossSalary)}</div>
              <div className="stat-card__label">Bruto</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">💰</div>
              <div className="stat-card__value">{formatCurrency(salary.netSalary)}</div>
              <div className="stat-card__label">Neto estimado</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🚔</div>
              <div className="stat-card__value">{salary.extrasCount}</div>
              <div className="stat-card__label">Servicios extra</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">💎</div>
              <div className="stat-card__value">{formatCurrency(salary.extrasTotal)}</div>
              <div className="stat-card__label">Ingresos extras</div>
            </div>
          </div>

          {/* Desglose */}
          <div className="card">
            <div className="card__title">Desglose</div>
            <div className="list-item">
              <div className="list-item__text">Sueldo base</div>
              <div className="list-item__value">{formatCurrency(salary.baseSalary)}</div>
            </div>
            {state.extras.map((e, i) => (
              <div key={i} className="list-item">
                <div className="list-item__left">
                  <div className="list-item__icon">🚔</div>
                  <div className="list-item__text">{e.description}</div>
                </div>
                <div className="list-item__value list-item__value--positive">
                  +{formatCurrency(e.amount)}
                </div>
              </div>
            ))}
            {state.bonuses.map((b, i) => (
              <div key={i} className="list-item">
                <div className="list-item__left">
                  <div className="list-item__icon">🎯</div>
                  <div className="list-item__text">{b.description}</div>
                </div>
                <div className="list-item__value list-item__value--positive">
                  +{formatCurrency(b.amount)}
                </div>
              </div>
            ))}
            {state.deductions.map((d, i) => (
              <div key={i} className="list-item">
                <div className="list-item__left">
                  <div className="list-item__icon">📉</div>
                  <div className="list-item__text">{d.description}</div>
                </div>
                <div className="list-item__value list-item__value--negative">
                  -{formatCurrency(d.amount)}
                </div>
              </div>
            ))}
            <div className="list-item" style={{ borderTop: '2px solid var(--border)', marginTop: 4, paddingTop: 12 }}>
              <div className="list-item__text" style={{ fontWeight: 700 }}>Total neto</div>
              <div className="list-item__value" style={{ fontSize: '1.2rem' }}>
                {formatCurrency(salary.netSalary)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==== EXTRAS ==== */}
      {activeTab === 'extras' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__title">Agregar servicio extraordinario</div>
            <div className="form-row" style={{ marginTop: 8 }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Descripción"
                  value={newExtra.description}
                  onChange={(e) => setNewExtra((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ maxWidth: 120 }}>
                <input
                  type="number"
                  placeholder="Monto $"
                  value={newExtra.amount}
                  onChange={(e) => setNewExtra((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
            </div>
            <button className="btn btn--primary btn--full" onClick={handleAddExtra}>
              + Agregar Servicio
            </button>
          </div>

          <div className="card">
            <div className="card__title">Servicios registrados ({state.extras.length})</div>
            {state.extras.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state__icon">🚔</div>
                <div className="empty-state__desc">No hay servicios extras registrados</div>
              </div>
            ) : (
              state.extras.map((e, i) => (
                <div key={i} className="list-item">
                  <div className="list-item__left">
                    <div className="list-item__icon">🚔</div>
                    <div>
                      <div className="list-item__text">{e.description}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="list-item__value list-item__value--positive">
                      {formatCurrency(e.amount)}
                    </div>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => dispatch({ type: 'REMOVE_EXTRA', payload: i })}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==== META ==== */}
      {activeTab === 'meta' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__title">🎯 Objetivo salarial</div>
            <div className="form-row" style={{ marginTop: 8 }}>
              <div className="form-group">
                <label htmlFor="salary-goal">Meta mensual ($)</label>
                <input
                  id="salary-goal"
                  type="number"
                  placeholder="Ej: 500000"
                  value={state.salaryGoal || ''}
                  onChange={(e) => dispatch({ type: 'SET_SALARY_GOAL', payload: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="rate-service">Valor por servicio extra ($)</label>
                <input
                  id="rate-service"
                  type="number"
                  placeholder="Ej: 15000"
                  value={state.ratePerService || ''}
                  onChange={(e) => dispatch({ type: 'SET_RATE_PER_SERVICE', payload: e.target.value })}
                />
              </div>
            </div>
          </div>

          {state.salaryGoal > 0 && (
            <div className="card card--accent" style={{ marginBottom: 16 }}>
              <div className="card__title">📊 Proyección</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Progreso hacia la meta</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {Math.min(100, Math.round((salary.netSalary / state.salaryGoal) * 100))}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 12 }}>
                  <div
                    className={`progress-bar__fill ${
                      salary.netSalary >= state.salaryGoal ? 'progress-bar__fill--gold' : ''
                    }`}
                    style={{ width: `${Math.min(100, (salary.netSalary / state.salaryGoal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div className="stat-card">
                  <div className="stat-card__value">{formatCurrency(salary.netSalary)}</div>
                  <div className="stat-card__label">Sueldo actual</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value">{formatCurrency(state.salaryGoal)}</div>
                  <div className="stat-card__label">Meta</div>
                </div>
              </div>

              {salary.netSalary < state.salaryGoal && state.ratePerService > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Para llegar a tu meta necesitás
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>
                    {extraCalc.servicesNeeded}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    servicios extraordinarios
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    ({formatCurrency(extraCalc.deficit)} faltantes ÷ {formatCurrency(state.ratePerService)}/servicio)
                  </div>
                </div>
              )}

              {salary.netSalary >= state.salaryGoal && (
                <div style={{
                  marginTop: 16, padding: 16, background: 'rgba(45, 106, 79, 0.1)',
                  borderRadius: 'var(--radius-md)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem' }}>🎉</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>¡Meta alcanzada!</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Superás tu meta por {formatCurrency(salary.netSalary - state.salaryGoal)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==== BONO ==== */}
      {activeTab === 'bono' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__title">📄 Cargar bono de sueldo</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Ingresá los conceptos de tu recibo de sueldo para analizar el desglose
            </p>
            <div className="form-row" style={{ marginTop: 8 }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Concepto"
                  value={newSlipField.concept}
                  onChange={(e) => setNewSlipField((p) => ({ ...p, concept: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ maxWidth: 120 }}>
                <input
                  type="number"
                  placeholder="Monto"
                  value={newSlipField.amount}
                  onChange={(e) => setNewSlipField((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ maxWidth: 140 }}>
                <select
                  value={newSlipField.type}
                  onChange={(e) => setNewSlipField((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="haberes">Haberes</option>
                  <option value="deducciones">Deducciones</option>
                </select>
              </div>
            </div>
            <button className="btn btn--primary btn--full" onClick={handleAddSlipField}>
              + Agregar Concepto
            </button>
          </div>

          {state.salarySlipFields.length > 0 && (
            <div className="card">
              <div className="card__title">Análisis del Bono</div>
              <div className="stat-grid" style={{ marginTop: 12 }}>
                <div className="stat-card">
                  <div className="stat-card__value" style={{ color: 'var(--success)' }}>
                    {formatCurrency(slipAnalysis.totalHaberes)}
                  </div>
                  <div className="stat-card__label">Total haberes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__value" style={{ color: 'var(--accent)' }}>
                    {formatCurrency(slipAnalysis.totalDeducciones)}
                  </div>
                  <div className="stat-card__label">Total deducciones</div>
                </div>
              </div>

              <div style={{
                textAlign: 'center', padding: 16, marginTop: 12,
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Neto a cobrar</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatCurrency(slipAnalysis.neto)}</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                  Conceptos ({slipAnalysis.conceptCount})
                </div>
                {state.salarySlipFields.map((f, i) => (
                  <div key={i} className="list-item">
                    <div className="list-item__left">
                      <div className="list-item__icon">
                        {f.type === 'haberes' ? '📈' : '📉'}
                      </div>
                      <div>
                        <div className="list-item__text">{f.concept}</div>
                        <div className="list-item__sub">{f.type}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className={`list-item__value ${
                        f.type === 'haberes' ? 'list-item__value--positive' : 'list-item__value--negative'
                      }`}>
                        {f.type === 'haberes' ? '+' : '-'}{formatCurrency(f.amount)}
                      </div>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => {
                          const updated = state.salarySlipFields.filter((_, idx) => idx !== i);
                          dispatch({ type: 'SET_SALARY_SLIP', payload: updated });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
