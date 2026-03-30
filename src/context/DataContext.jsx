import { createContext, useContext, useReducer, useEffect } from 'react';

const DataContext = createContext(null);

const STORAGE_KEY = 'guardiapp_data';

const initialState = {
  // Configuración de turno
  selectedPattern: '12x24_12x48',
  customPatterns: [],
  startDate: `${new Date().getFullYear()}-01-01`,
  startHour: 7,

  // Finanzas
  baseSalary: 0,
  extras: [],
  bonuses: [],
  deductions: [],
  salaryGoal: 0,
  ratePerService: 0,
  salarySlipFields: [],

  // Incidencias
  incidents: [],

  // Feriados de Mendoza / Argentina
  holidays: [
    '2026-01-01', '2026-02-16', '2026-02-17',
    '2026-03-24', '2026-04-02', '2026-04-03',
    '2026-05-01', '2026-05-25', '2026-06-15',
    '2026-06-20', '2026-07-09', '2026-08-17',
    '2026-10-12', '2026-11-23', '2026-12-08',
    '2026-12-25',
  ],

  // Tema
  theme: 'dark',
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_PATTERN':
      return { ...state, selectedPattern: action.payload };
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };
    case 'SET_START_HOUR':
      return { ...state, startHour: Number(action.payload) };

    case 'ADD_CUSTOM_PATTERN':
      return { ...state, customPatterns: [...state.customPatterns, action.payload] };
    case 'SET_BASE_SALARY':
      return { ...state, baseSalary: Number(action.payload) };
    case 'ADD_EXTRA':
      return { ...state, extras: [...state.extras, action.payload] };
    case 'REMOVE_EXTRA':
      return { ...state, extras: state.extras.filter((_, i) => i !== action.payload) };
    case 'SET_EXTRAS':
      return { ...state, extras: action.payload };
    case 'ADD_BONUS':
      return { ...state, bonuses: [...state.bonuses, action.payload] };
    case 'REMOVE_BONUS':
      return { ...state, bonuses: state.bonuses.filter((_, i) => i !== action.payload) };
    case 'ADD_DEDUCTION':
      return { ...state, deductions: [...state.deductions, action.payload] };
    case 'REMOVE_DEDUCTION':
      return { ...state, deductions: state.deductions.filter((_, i) => i !== action.payload) };
    case 'SET_SALARY_GOAL':
      return { ...state, salaryGoal: Number(action.payload) };
    case 'SET_RATE_PER_SERVICE':
      return { ...state, ratePerService: Number(action.payload) };
    case 'SET_SALARY_SLIP':
      return { ...state, salarySlipFields: action.payload };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [...state.incidents, action.payload] };
    case 'REMOVE_INCIDENT':
      return { ...state, incidents: state.incidents.filter((_, i) => i !== action.payload) };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_HOLIDAYS':
      return { ...state, holidays: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed };
      }
    } catch (e) {
      console.warn('Error cargando datos guardados:', e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error guardando datos:', e);
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppData debe usarse dentro de DataProvider');
  }
  return context;
}
