import { useState, useRef } from 'react';
import { useAppData } from '../context/DataContext';

export default function SettingsPage() {
  const { state, dispatch } = useAppData();
  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState('');

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardiapp_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        dispatch({ type: 'LOAD_DATA', payload: data });
        setImportMsg('Datos importados correctamente ✓');
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('Error al importar el archivo');
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('¿Estás seguro? Se borrarán todos los datos guardados.')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Configuración</h1>
        <p className="page-header__desc">Personalización y gestión de datos</p>
      </div>

      {/* Apariencia */}
      <div className="section">
        <div className="section__title" style={{ marginBottom: 10, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Apariencia
        </div>
        <div className="card">
          <div className="settings-item">
            <div className="settings-item__left">
              <div className="settings-item__icon">{state.theme === 'dark' ? '🌙' : '☀️'}</div>
              <div>
                <div className="settings-item__label">Modo oscuro</div>
                <div className="settings-item__desc">
                  {state.theme === 'dark' ? 'Activado — ideal para consultas nocturnas' : 'Desactivado'}
                </div>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={state.theme === 'dark'} onChange={toggleTheme} />
              <span className="toggle__slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="section">
        <div className="section__title" style={{ marginBottom: 10, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Datos
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="settings-item" style={{ cursor: 'pointer' }} onClick={exportData}>
            <div className="settings-item__left">
              <div className="settings-item__icon">💾</div>
              <div>
                <div className="settings-item__label">Exportar datos</div>
                <div className="settings-item__desc">Descargar backup en JSON</div>
              </div>
            </div>
            <span style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }}>→</span>
          </div>

          <div className="settings-item" style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <div className="settings-item__left">
              <div className="settings-item__icon">📂</div>
              <div>
                <div className="settings-item__label">Importar datos</div>
                <div className="settings-item__desc">Restaurar backup desde archivo</div>
              </div>
            </div>
            <span style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }}>→</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importData}
          />

          {importMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: importMsg.includes('Error') ? 'rgba(139, 26, 26, 0.1)' : 'rgba(45, 106, 79, 0.1)',
              color: importMsg.includes('Error') ? 'var(--accent)' : 'var(--success)',
              fontSize: '0.85rem', fontWeight: 500,
            }}>
              {importMsg}
            </div>
          )}

          <div className="settings-item" style={{ cursor: 'pointer' }} onClick={resetData}>
            <div className="settings-item__left">
              <div className="settings-item__icon">🗑️</div>
              <div>
                <div className="settings-item__label" style={{ color: 'var(--accent)' }}>Resetear datos</div>
                <div className="settings-item__desc">Borrar toda la información guardada</div>
              </div>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>→</span>
          </div>
        </div>
      </div>

      {/* Cuenta */}
      <div className="section">
        <div className="section__title" style={{ marginBottom: 10, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Cuenta
        </div>
        <div className="card">
          <div className="settings-item" style={{ opacity: 0.6 }}>
            <div className="settings-item__left">
              <div className="settings-item__icon">🔗</div>
              <div>
                <div className="settings-item__label">Vincular cuenta de Google</div>
                <div className="settings-item__desc">Próximamente — Sincronización en la nube</div>
              </div>
            </div>
            <span className="badge badge--neutral">Próx.</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛡️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>GuardiApp</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Policía de Mendoza</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
            v1.0.0 Beta
          </div>
        </div>
      </div>
    </div>
  );
}
