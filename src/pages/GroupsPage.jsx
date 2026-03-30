export default function GroupsPage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Grupos</h1>
        <p className="page-header__desc">Coordiná turnos con tus compañeros</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.7 }}>👥</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Próximamente
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
          En la versión completa podrás crear grupos privados, comparar cuadrantes con compañeros y proponer cambios de turno que se actualizan automáticamente.
        </p>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '32px auto 0' }}>
          {[
            { icon: '🔗', title: 'Crear grupo privado', desc: 'Invitá a tu binomio o equipo' },
            { icon: '📊', title: 'Comparar cuadrantes', desc: 'Visualizá quién trabaja cada día' },
            { icon: '🔄', title: 'Proponer cambios', desc: 'Cambios de turno con aceptación automática' },
            { icon: '🔒', title: 'Privacidad total', desc: 'Solo se comparten turnos, nunca notas personales' },
          ].map((feat, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                textAlign: 'left', opacity: 0.7,
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>{feat.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{feat.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
