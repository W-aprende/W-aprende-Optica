import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PatientManager } from './components/PatientManager';
import { BillingManager } from './components/BillingManager';
import { SettingsManager } from './components/SettingsManager';
import { ViewState, Patient, Order, OrderStatus, BackupData } from './types';
import { Lock, Key, AlertTriangle, ChevronRight } from 'lucide-react';

// Initial Mock Data to populate the app if empty
const INITIAL_PATIENTS: Patient[] = [

];

const INITIAL_ORDERS: Order[] = [

];

// --- TRIAL LOCK SCREEN COMPONENT ---
const TrialLockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === 'opticage') {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000); // Reset error shake after 2s
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative max-w-lg w-full bg-slate-900/80 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 tracking-wider uppercase">Acceso Bloqueado</h2>
        <div className="flex items-center justify-center gap-2 text-red-400 mb-6 text-sm font-mono">
          <AlertTriangle size={16} />
          <span>PERIODO DE PRUEBA FINALIZADO</span>
        </div>

        <p className="text-slate-300 mb-8 leading-relaxed">
          Lo sentimos usted ya terminó su periodo de prueba ponte en contacto con el administrador <strong className="text-white">WONG IT</strong>, para continuar utilizando pagina web tiene que poner la clave de producto:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Key size={18} />
            </div>
            <input 
              type="password" 
              maxLength={8}
              className={`w-full bg-slate-950 border ${error ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-slate-800 focus:border-red-500'} rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 outline-none transition-all tracking-widest font-mono text-center`}
              placeholder="XXXXXXXX"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            ACTIVAR SISTEMA <ChevronRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
          SYSTEM ID: WONG-IT-SECURE-8821
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('optica_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('optica_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('optica_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // --- TRIAL LOGIC STATE ---
  const [isTrialLocked, setIsTrialLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- TRIAL LOGIC CHECK ---
  useEffect(() => {
    const checkTrialStatus = () => {
      // 1. Check if product key is already active
      const isLicenseActive = localStorage.getItem('optica_license_active') === 'true';
      if (isLicenseActive) {
        setIsLoading(false);
        return;
      }

      // 2. Manage trial start date
      let startDateStr = localStorage.getItem('optica_trial_start_date');
      if (!startDateStr) {
        // First run: set start date
        startDateStr = new Date().toISOString();
        localStorage.setItem('optica_trial_start_date', startDateStr);
      }

      // 3. Calculate time difference
      const startDate = new Date(startDateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const TRIAL_LIMIT_DAYS = 30;

      // 4. Lock if > 30 days
      if (diffDays > TRIAL_LIMIT_DAYS) {
        setIsTrialLocked(true);
      }
      setIsLoading(false);
    };

    checkTrialStatus();
  }, []);

  const handleUnlockSystem = () => {
    localStorage.setItem('optica_license_active', 'true');
    setIsTrialLocked(false);
  };

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('optica_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('optica_theme', 'light');
    }
  }, [isDarkMode]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('optica_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('optica_orders', JSON.stringify(orders));
  }, [orders]);

  // Handlers
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Patient Handlers
  const addPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este paciente? Esto no borrará sus pedidos existentes.')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  // Order Handlers
  const createOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const deleteOrder = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Import Handler
  const handleImportData = (data: BackupData) => {
    setPatients(data.patients);
    setOrders(data.orders);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard patients={patients} orders={orders} />;
      case 'patients':
        return (
          <PatientManager 
            patients={patients} 
            onAddPatient={addPatient} 
            onUpdatePatient={updatePatient}
            onDeletePatient={deletePatient} 
          />
        );
      case 'billing':
        return (
          <BillingManager 
            orders={orders} 
            patients={patients} 
            onCreateOrder={createOrder} 
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
            onUpdateStatus={updateOrderStatus} 
          />
        );
      case 'settings':
        return (
          <SettingsManager 
            patients={patients}
            orders={orders}
            onImportData={handleImportData}
          />
        );
      default:
        return <Dashboard patients={patients} orders={orders} />;
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-cyan-500">Cargando Sistema...</div>;
  }

  if (isTrialLocked) {
    return <TrialLockScreen onUnlock={handleUnlockSystem} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
