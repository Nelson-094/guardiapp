/**
 * Cálculos financieros para la gestión salarial del policía.
 */

/**
 * Calcula el sueldo mensual total.
 * @param {number} baseSalary - Sueldo base
 * @param {Object[]} extras - Servicios extraordinarios [{description, amount}]
 * @param {Object[]} bonuses - Bonificaciones adicionales [{description, amount}]
 * @param {Object[]} deductions - Deducciones [{description, amount}]
 * @returns {Object} Desglose salarial
 */
export function calcMonthlySalary(baseSalary, extras = [], bonuses = [], deductions = []) {
  const extrasTotal = extras.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const bonusesTotal = bonuses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const deductionsTotal = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const grossSalary = baseSalary + extrasTotal + bonusesTotal;
  const netSalary = grossSalary - deductionsTotal;

  return {
    baseSalary,
    extrasTotal,
    bonusesTotal,
    deductionsTotal,
    grossSalary,
    netSalary,
    extrasCount: extras.length,
  };
}

/**
 * Calcula cuántos servicios extraordinarios se necesitan para llegar al objetivo.
 * @param {number} goalAmount - Monto objetivo
 * @param {number} currentNetSalary - Sueldo neto actual (sin extras adicionales)
 * @param {number} ratePerService - Monto por cada servicio extra
 * @returns {Object} Resultado con cantidad y monto faltante
 */
export function calcExtraServicesNeeded(goalAmount, currentNetSalary, ratePerService) {
  if (ratePerService <= 0) {
    return { servicesNeeded: 0, deficit: 0, achievable: true };
  }

  const deficit = goalAmount - currentNetSalary;

  if (deficit <= 0) {
    return { servicesNeeded: 0, deficit: 0, achievable: true };
  }

  const servicesNeeded = Math.ceil(deficit / ratePerService);

  return {
    servicesNeeded,
    deficit,
    achievable: true,
    totalFromExtras: servicesNeeded * ratePerService,
    projectedSalary: currentNetSalary + servicesNeeded * ratePerService,
  };
}

/**
 * Parsea los campos del bono de sueldo para análisis.
 * @param {Object[]} fields - Conceptos del recibo [{concept, amount, type: 'haberes'|'deducciones'}]
 * @returns {Object} Análisis del bono
 */
export function parseSalarySlip(fields) {
  const haberes = fields.filter((f) => f.type === 'haberes');
  const deducciones = fields.filter((f) => f.type === 'deducciones');

  const totalHaberes = haberes.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const totalDeducciones = deducciones.reduce((s, f) => s + (Number(f.amount) || 0), 0);

  return {
    haberes,
    deducciones,
    totalHaberes,
    totalDeducciones,
    neto: totalHaberes - totalDeducciones,
    conceptCount: fields.length,
  };
}

/**
 * Formatea un monto en pesos argentinos.
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
