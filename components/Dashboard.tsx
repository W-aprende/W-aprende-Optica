import React, { useMemo } from 'react';
import { Order, Patient, OrderStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Activity, TrendingUp } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  orders: Order[];
}

// Map styles explicitly to avoid broken class string manipulation
const CARD_STYLES = {
  emerald: { text: 'text-emerald-500', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
  cyan: { text: 'text-cyan-500', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)' },
  purple: { text: 'text-purple-500', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)' },
  pink: { text: 'text-pink-500', bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.2)' },
};

export const Dashboard: React.FC<DashboardProps> = ({ patients, orders }) => {
  // Calculate Stats
  const totalRevenue = useMemo(() => orders.reduce((acc, curr) => acc + curr.amount, 0), [orders]);
  const activeOrders = useMemo(() => orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length, [orders]);
  const monthlyData = useMemo(() => {
    if (orders.length === 0) {
      return [
        { name: 'Ene', total: 125000 }, { name: 'Feb', total: 210000 },
        { name: 'Mar', total: 80000 }, { name: 'Abr', total: 160000 },
        { name: 'May', total: 240000 }, { name: 'Jun', total: 320000 },
      ];
    }
    return orders.map(o => ({
      name: new Date(o.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      total: o.amount
    })).slice(-7);
  }, [orders]);

  const StatCard = ({ title, value, sub, icon: Icon, type }: { title: string, value: string | number, sub: string, icon: any, type: keyof typeof CARD_STYLES }) => {
    const styles = CARD_STYLES[type];
    
    return (
      <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden group border border-slate-200 dark:border-slate-800/60 transition-all duration-300 hover:border-[color:var(--hover-border)]" style={{ '--hover-border': styles.border } as React.CSSProperties}>
        {/* Background Icon - Absolute Positioned */}
        <div className={`absolute top-0 right-0 p-4 transition-opacity ${styles.text}`} style={{ opacity: 0.1, pointerEvents: 'none' }}>
          <Icon size={80} />
        </div>
        
        {/* Content - Relative to sit on top */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
            <div className={`p-2 rounded-lg flex items-center justify-center ${styles.text}`} style={{ backgroundColor: styles.bg }}>
              <Icon size={20} />
            </div>
            <span className="font-medium text-sm uppercase tracking-wider">{title}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
          <div className="text-xs text-slate-500 font-mono">{sub}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Panel General</h1>
        <p className="text-slate-500 dark:text-slate-400">Resumen de actividad y métricas financieras.</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos" 
          value={`${totalRevenue.toLocaleString()} FCFA`} 
          sub="+12% vs mes anterior"
          icon={DollarSign}
          type="emerald"
        />
        <StatCard 
          title="Pacientes" 
          value={patients.length} 
          sub="Registrados"
          icon={Users}
          type="cyan"
        />
        <StatCard 
          title="Pedidos" 
          value={activeOrders} 
          sub="Activos"
          icon={Activity}
          type="purple"
        />
        <StatCard 
          title="Promedio" 
          value={`${orders.length ? Math.round(totalRevenue / orders.length).toLocaleString() : 0} FCFA`} 
          sub="Por paciente"
          icon={TrendingUp}
          type="pink"
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl h-[400px] border border-slate-200 dark:border-slate-800/60 transition-all duration-300 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Tendencia de Ingresos</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#22d3ee' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ingresos']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini List */}
        <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Actividad Reciente</h3>
          <div className="space-y-4">
            {orders.slice().reverse().slice(0, 5).map((order) => {
              const patient = patients.find(p => p.id === order.patientId);
              return (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{patient?.name || 'Desconocido'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{order.items}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{order.amount.toLocaleString()} FCFA</div>
                    <div className="text-[10px] text-slate-500">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <div className="text-center text-slate-500 py-10">No hay actividad reciente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};